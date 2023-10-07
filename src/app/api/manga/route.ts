import { getAuthSession } from '@/lib/auth';
import { DeleteChapterImages, DeleteMangaImage } from '@/lib/contabo';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';
import { z } from 'zod';

const MangaValidator = z.object({ id: z.number() });

export async function DELETE(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized', { status: 401 });

    const { id } = MangaValidator.parse(await req.json());

    const [user, manga] = await db.$transaction([
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
                hasEvery: ['MANAGE_MANGA', 'MANAGE_CHAPTER'],
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
          id,
        },
        select: {
          id: true,
          name: true,
          chapter: {
            select: {
              id: true,
            },
          },
        },
      }),
    ]);

    await db.$transaction([
      db.manga.delete({
        where: {
          id: manga.id,
        },
      }),
      db.log.create({
        data: {
          content: `${user.name} (${user.id}) đã xóa Manga ${manga.name} (${manga.id})`,
        },
      }),
    ]);

    await Promise.all([
      DeleteMangaImage(manga.id),
      ...manga.chapter.map((chapter) =>
        DeleteChapterImages({
          mangaId: manga.id,
          chapterId: chapter.id,
        })
      ),
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

export async function PATCH(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized', { status: 401 });

    const { id } = MangaValidator.parse(await req.json());

    const [user, manga] = await db.$transaction([
      db.user.findUniqueOrThrow({
        where: {
          id: session.user.id,
          permissions: {
            hasSome: ['ADMINISTRATOR', 'MANAGE_MANGA'],
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
          id,
          isPublished: true,
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
          isPublished: false,
        },
      }),
      db.log.create({
        data: {
          content: `${user.name} (${user.id}) đã chuyển Manga ${manga.name} (${manga.id}) về trạng thái unpublish`,
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

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized', { status: 401 });

    const { id } = MangaValidator.parse(await req.json());

    const [user, manga] = await db.$transaction([
      db.user.findUniqueOrThrow({
        where: {
          id: session.user.id,
          permissions: {
            hasSome: ['ADMINISTRATOR', 'MANAGE_MANGA'],
          },
          twoFactorEnabled: true,
        },
        select: {
          id: true,
          name: true,
        },
      }),
      db.manga.findUnique({
        where: {
          id,
          OR: [
            {
              canPin: false,
              isPublished: true,
            },
            {
              canPin: true,
            },
          ],
        },
        select: {
          id: true,
          name: true,
          canPin: true,
        },
      }),
    ]);

    if (!manga) return new Response('Need publish first', { status: 406 });

    await db.$transaction([
      db.manga.update({
        where: {
          id: manga.id,
        },
        data: {
          canPin: !manga.canPin,
        },
      }),
      db.log.create({
        data: {
          content: `${user.name} (${user.id}) đã cấp quyền ghim ${manga.name} (${manga.id})`,
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
