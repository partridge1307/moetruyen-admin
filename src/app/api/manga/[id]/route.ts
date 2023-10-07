import { getAuthSession } from '@/lib/auth';
import { UploadMangaImage } from '@/lib/contabo';
import { db } from '@/lib/db';
import { MangaFormValidator } from '@/lib/validators/manga';
import { Prisma } from '@prisma/client';
import { z } from 'zod';

export async function PATCH(req: Request, context: { params: { id: string } }) {
  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized', { status: 401 });

    const {
      slug,
      image: img,
      name,
      description,
      review,
      altName,
      author,
      tag,
      facebookLink,
      discordLink,
    } = MangaFormValidator.parse(await req.formData());

    const [user, targetManga] = await db.$transaction([
      db.user.findUniqueOrThrow({
        where: {
          id: session.user.id,
          permissions: {
            hasSome: ['ADMINISTRATOR', 'MANAGE_CHAPTER'],
          },
          twoFactorEnabled: true,
        },
        select: {
          id: true,
          name: true,
        },
      }),
      db.manga.findUniqueOrThrow({
        where: {
          id: +context.params.id,
        },
        select: {
          id: true,
          slug: true,
          image: true,
        },
      }),
    ]);

    let image: string;
    if (img instanceof File) {
      image = await UploadMangaImage(img, targetManga.id, targetManga.image);
    } else {
      image = img;
    }

    const userSlug = slug?.trim() ?? targetManga.slug;

    const [updatedManga] = await db.$transaction([
      db.manga.update({
        where: {
          id: targetManga.id,
        },
        data: {
          image,
          slug: userSlug,
          name,
          description: { ...description },
          review,
          altName,
          facebookLink: !facebookLink ? null : facebookLink,
          discordLink: !discordLink ? null : discordLink,
          tags: {
            connect: tag.map((t) => ({ id: t.id })),
          },
          author: {
            connectOrCreate: author.map((a) => ({
              where: { id: a.id },
              create: { name: a.name },
            })),
          },
        },
      }),
      db.log.create({
        data: {
          content: `${user.name} (${user.id}) đã chỉnh sửa Manga ${name} ${targetManga.id}`,
        },
      }),
    ]);

    return new Response(JSON.stringify(updatedManga.slug));
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return new Response('Not found', { status: 404 });
      }
      if (error.code === 'P2002') {
        return new Response('Existing Slug', { status: 406 });
      }
    }

    return new Response('Something went wrong', { status: 500 });
  }
}

export async function PUT(req: Request, context: { params: { id: string } }) {
  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized', { status: 401 });

    const { userId } = z.object({ userId: z.string() }).parse(await req.json());

    const [me, manga, user] = await db.$transaction([
      db.user.findUniqueOrThrow({
        where: {
          id: session.user.id,
          OR: [
            {
              permissions: {
                hasSome: ['ADMINISTRATOR'],
              },
            },
            {
              permissions: {
                hasEvery: ['MANAGE_MANGA', 'MANAGE_USER'],
              },
            },
          ],
          twoFactorEnabled: true,
        },
        select: {
          id: true,
          name: true,
        },
      }),
      db.manga.findUniqueOrThrow({
        where: {
          id: +context.params.id,
        },
        select: {
          id: true,
          name: true,
        },
      }),
      db.user.findUniqueOrThrow({
        where: {
          id: userId,
        },
        select: {
          id: true,
          name: true,
        },
      }),
    ]);

    await db.$transaction([
      db.manga.update({
        where: {
          id: manga.id,
        },
        data: {
          creatorId: user.id,
        },
      }),
      db.log.create({
        data: {
          content: `${me.name} (${me.id}) đã chuyển creator Manga ${manga.name} (${manga.id}) qua người dùng ${user.name} (${user.id})`,
        },
      }),
    ]);

    return new Response('OK');
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response('Invalid', { status: 422 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return new Response('Not found', { status: 404 });
    }

    return new Response('Something went wrong', { status: 500 });
  }
}
