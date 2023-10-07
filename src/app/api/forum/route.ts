import { getAuthSession } from '@/lib/auth';
import { DeleteSubForumImage } from '@/lib/contabo';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';
import { AxiosError } from 'axios';
import { z } from 'zod';

const ForumValidator = z.object({ id: z.number() });

export async function DELETE(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthozied', { status: 401 });

    const { id } = ForumValidator.parse(await req.json());

    const [user, forum] = await db.$transaction([
      db.user.findUniqueOrThrow({
        where: {
          id: session.user.id,
          permissions: {
            hasSome: ['ADMINISTRATOR', 'MANAGE_FORUM'],
          },
          twoFactorEnabled: true,
        },
        select: {
          id: true,
          name: true,
        },
      }),
      db.subForum.findUniqueOrThrow({
        where: {
          id,
        },
        select: {
          id: true,
          title: true,
        },
      }),
    ]);

    await Promise.all([
      DeleteSubForumImage(forum.id),
      db.$transaction([
        db.subForum.delete({
          where: {
            id: forum.id,
          },
        }),
        db.log.create({
          data: {
            content: `${user.name} (${user.id}) đã xóa Forum ${forum.title} (${forum.id})`,
          },
        }),
      ]),
    ]);

    return new Response('OK');
  } catch (error) {
    if (error instanceof AxiosError) {
      return new Response('Invalid', { status: 422 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025')
        return new Response('Not found', { status: 404 });
    }

    return new Response('Something went wrong', { status: 500 });
  }
}
