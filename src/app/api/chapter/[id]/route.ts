import { getAuthSession } from '@/lib/auth';
import { EditChapterImage } from '@/lib/contabo';
import { db } from '@/lib/db';
import { getImagesBase64 } from '@/lib/plaiceholder';
import { ChapterFormEditValidator } from '@/lib/validators/chapter';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';

export async function PATCH(req: Request, context: { params: { id: string } }) {
  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized', { status: 401 });

    const { images, order, chapterIndex, chapterName, volume } =
      ChapterFormEditValidator.parse(await req.formData());

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
          id: +context.params.id,
        },
        select: {
          id: true,
          mangaId: true,
          images: true,
          manga: {
            select: {
              name: true,
            },
          },
        },
      }),
    ]);

    const edittedImages = (
      await EditChapterImage(
        images.sort(
          (a, b) =>
            order.indexOf(images.indexOf(a)) - order.indexOf(images.indexOf(b))
        ),
        chapter.images,
        chapter.mangaId,
        chapter.id
      )
    )
      .sort((a, b) => a.index - b.index)
      .map((img) => img.image);
    const blurImages = await getImagesBase64(edittedImages);

    await db.$transaction([
      db.chapter.update({
        where: {
          id: +context.params.id,
        },
        data: {
          chapterIndex,
          name: chapterName,
          volume,
          images: edittedImages,
          blurImages,
        },
      }),
      db.log.create({
        data: {
          content: `${user.name} (${user.id}) đã sửa Chapter ${chapter.id} của Manga ${chapter.manga.name} (${chapter.mangaId})`,
        },
      }),
    ]);

    return new Response('OK');
  } catch (error) {
    if (error instanceof ZodError) {
      return new Response(error.message, { status: 422 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return new Response('Not found', { status: 404 });
      }
    }

    return new Response('Something went wrong', { status: 500 });
  }
}
