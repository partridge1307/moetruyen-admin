import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';
import { z } from 'zod';

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized', { status: 401 });

    const { id, type } = z
      .object({
        id: z.string(),
        type: z.enum(['BAN', 'UNBAN']),
      })
      .parse(await req.json());

    const [me, user] = await db.$transaction([
      db.user.findUniqueOrThrow({
        where: {
          id: session.user.id,
          permissions: {
            hasSome: ['ADMINISTRATOR'],
          },
          twoFactorEnabled: true,
        },
        select: {
          id: true,
          name: true,
          permissions: true,
        },
      }),
      db.user.findUniqueOrThrow({
        where: {
          id,
        },
        select: {
          id: true,
          name: true,
          isBanned: true,
          permissions: true,
        },
      }),
    ]);

    if (
      !me.permissions.includes('ADMINISTRATOR') &&
      user.permissions.includes('ADMINISTRATOR')
    )
      return new Response('Not found', { status: 404 });

    if (type === 'BAN') {
      if (user.isBanned) return new Response('Already banned', { status: 406 });

      await db.$transaction([
        db.user.update({
          where: {
            id: user.id,
          },
          data: {
            isBanned: true,
            session: {
              deleteMany: {
                userId: user.id,
              },
            },
          },
        }),
        db.log.create({
          data: {
            content: `${me.name} (${me.id}) đã Ban user ${user.name} (${user.id})`,
          },
        }),
      ]);
    } else {
      if (!user.isBanned) return new Response('Already unban', { status: 406 });

      await db.$transaction([
        db.user.update({
          where: {
            id: user.id,
          },
          data: {
            isBanned: false,
            session: {
              deleteMany: {
                userId: user.id,
              },
            },
          },
        }),
        db.log.create({
          data: {
            content: `${me.name} (${me.id}) đã unban user ${user.name} (${user.id})`,
          },
        }),
      ]);
    }

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
