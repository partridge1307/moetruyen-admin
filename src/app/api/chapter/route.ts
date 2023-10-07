import { getAuthSession } from '@/lib/auth';
import { DeleteChapterImages } from '@/lib/contabo';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';
import { z } from 'zod';

const ChapterValidator = z.object({ id: z.number() });

export async function PATCH(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized', { status: 401 });

    const { id } = ChapterValidator.parse(await req.json());

    const [user, chapter] = await db.$transaction([
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
      db.chapter.findUniqueOrThrow({
        where: {
          id,
          isPublished: true,
        },
        select: {
          id: true,
          isPublished: true,
          manga: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
    ]);

    await db.$transaction([
      db.chapter.update({
        where: {
          id: chapter.id,
        },
        data: {
          isPublished: !chapter.isPublished,
        },
      }),
      db.log.create({
        data: {
          content: `${user.name} (${user.id}) đã chuyển Chapter ${chapter.id} của Manga ${chapter.manga.name} (${chapter.manga.id}) về trạng thái Unpublish`,
        },
      }),
    ]);

    return new Response('OK');
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response('Invalid', { status: 422 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025')
        return new Response('Not found', { status: 404 });
    }

    return new Response('Something went wrong', { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized', { status: 401 });

    const { id } = ChapterValidator.parse(await req.json());

    const [user, chapter] = await db.$transaction([
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
      db.chapter.findUniqueOrThrow({
        where: {
          id,
        },
        select: {
          id: true,
          mangaId: true,
          chapterIndex: true,
          manga: {
            select: {
              name: true,
            },
          },
        },
      }),
    ]);

    await DeleteChapterImages({
      mangaId: chapter.mangaId,
      chapterId: chapter.id,
    });

    await db.$transaction([
      db.chapter.delete({
        where: {
          id: chapter.id,
        },
      }),
      db.log.create({
        data: {
          content: `${user.name} (${user.id}) đã xóa Chapter ${chapter.id} của Manga ${chapter.manga.name} ${chapter.mangaId}`,
        },
      }),
    ]);

    return new Response('OK');
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response('Invalid', { status: 422 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025')
        return new Response('Not found', { status: 404 });
    }

    return new Response('Something went wrong', { status: 500 });
  }
}
