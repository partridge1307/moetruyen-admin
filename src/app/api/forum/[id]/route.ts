import { getAuthSession } from '@/lib/auth';
import { DeleteSubForumImage, UploadForumImage } from '@/lib/contabo';
import { db } from '@/lib/db';
import { EditThreadFormValidator } from '@/lib/validators/forum';
import { Prisma } from '@prisma/client';
import { ZodError, z } from 'zod';

export async function POST(req: Request, context: { params: { id: string } }) {
  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized', { status: 401 });

    const { userId } = z.object({ userId: z.string() }).parse(await req.json());

    const [me, user, forum] = await db.$transaction([
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
                hasEvery: ['MANAGE_FORUM', 'MANAGE_USER'],
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
      db.user.findUniqueOrThrow({
        where: {
          id: userId,
          verified: true,
        },
        select: {
          id: true,
          name: true,
        },
      }),
      db.subForum.findUniqueOrThrow({
        where: {
          id: +context.params.id,
        },
        select: {
          id: true,
          title: true,
        },
      }),
    ]);

    await db.$transaction([
      db.subForum.update({
        where: {
          id: forum.id,
        },
        data: {
          creatorId: user.id,
        },
      }),
      db.log.create({
        data: {
          content: `${me.name} (${me.id}) đã chuyển creator Forum ${forum.title} (${forum.id}) qua người dùng ${user.name} (${user.id})`,
        },
      }),
    ]);

    return new Response('OK');
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response('Invalid', { status: 422 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if ((error.code = 'P2025'))
        return new Response('Not found', { status: 404 });
    }

    return new Response('Something went wrong', { status: 500 });
  }
}

export async function PATCH(req: Request, context: { params: { id: string } }) {
  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized', { status: 401 });

    const { thumbnail, title, slug, canSend, managers } =
      EditThreadFormValidator.parse(await req.formData());

    const [, targetSubForum] = await db.$transaction([
      db.user.findUniqueOrThrow({
        where: {
          id: session.user.id,
          permissions: {
            hasSome: ['ADMINISTRATOR', 'MANAGE_FORUM'],
          },
          twoFactorEnabled: true,
        },
      }),
      db.subForum.findUniqueOrThrow({
        where: {
          id: +context.params.id,
        },
        select: {
          id: true,
          slug: true,
          banner: true,
          subscriptions: {
            where: {
              isManager: true,
            },
            select: {
              userId: true,
            },
          },
        },
      }),
    ]);

    if (
      slug &&
      (await db.subForum.findUnique({
        where: {
          slug,
          NOT: {
            id: targetSubForum.id,
          },
        },
      }))
    )
      return new Response('Existed slug', { status: 400 });

    if (
      managers.length &&
      !(
        await db.subscription.findMany({
          where: {
            subForumId: targetSubForum.id,
            userId: { in: managers.map((manager) => manager.id) },
            user: {
              verified: true,
            },
          },
        })
      ).length
    )
      return new Response('Invalid managers', { status: 406 });

    let uploadedImage: string | null = null;

    if (thumbnail) {
      if (thumbnail instanceof File) {
        uploadedImage = await UploadForumImage(
          thumbnail,
          targetSubForum.id,
          targetSubForum.banner
        );
      } else uploadedImage = thumbnail;
    } else if (targetSubForum.banner) {
      await DeleteSubForumImage(targetSubForum.id);
    }

    const subForumSlug = slug?.trim() ?? targetSubForum.slug;
    const removedManager = targetSubForum.subscriptions.filter(
      (user) => !managers.some((usr) => usr.id === user.userId)
    );

    if (managers.length) {
      await db.$transaction([
        db.subForum.update({
          where: {
            id: targetSubForum.id,
          },
          data: {
            title,
            slug: subForumSlug,
            canSend: canSend === 'true' ? true : false,
            banner: uploadedImage,
          },
        }),
        db.subscription.updateMany({
          where: {
            userId: { in: managers.map((manager) => manager.id) },
          },
          data: {
            isManager: true,
          },
        }),
      ]);
    } else
      await db.subForum.update({
        where: {
          id: targetSubForum.id,
        },
        data: {
          title,
          slug: subForumSlug,
          canSend: canSend === 'true' ? true : false,
          banner: uploadedImage,
        },
      });

    !!removedManager.length &&
      (await db.subscription.updateMany({
        where: {
          userId: { in: removedManager.map((user) => user.userId) },
        },
        data: {
          isManager: false,
        },
      }));

    return new Response(JSON.stringify(subForumSlug));
  } catch (error) {
    if (error instanceof ZodError) {
      return new Response('Invalid', { status: 422 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025')
        return new Response('Not found', { status: 404 });
    }
    return new Response('Something went wrong', { status: 500 });
  }
}
