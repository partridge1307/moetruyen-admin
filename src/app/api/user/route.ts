import { getAuthSession } from '@/lib/auth';
import { z } from 'zod';
import { Permission, Prisma } from '@prisma/client';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorzied', { status: 401 });

    const { id, permission } = z
      .object({
        id: z.string(),
        permission: z.array(z.nativeEnum(Permission)),
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
        },
      }),
      db.user.findUniqueOrThrow({
        where: {
          id,
          twoFactorEnabled: true,
        },
        select: {
          id: true,
          name: true,
        },
      }),
    ]);

    const [updatedUser] = await db.$transaction([
      db.user.update({
        where: {
          id: user.id,
        },
        data: {
          permissions: permission,
        },
      }),
      db.log.create({
        data: {
          content: `${me.name} (${me.id}) đã thay đổi Permission user ${user.name} (${user.id})`,
        },
      }),
    ]);

    return new Response(JSON.stringify(updatedUser.permissions));
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

export async function PUT(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorzied', { status: 401 });

    const { id, badge } = z
      .object({
        id: z.string(),
        badge: z.array(z.number()),
      })
      .parse(await req.json());

    const [me, user] = await db.$transaction([
      db.user.findUniqueOrThrow({
        where: {
          id: session.user.id,
          permissions: {
            hasSome: ['ADMINISTRATOR', 'MANAGE_USER'],
          },
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
          permissions: true,
        },
      }),
    ]);

    if (
      !me.permissions.includes('ADMINISTRATOR') &&
      user.permissions.includes('ADMINISTRATOR')
    )
      return new Response('Not found', { status: 404 });

    const [, , updatedUser] = await db.$transaction([
      db.user.update({
        where: {
          id: user.id,
        },
        data: {
          badge: {
            set: badge.map((b) => ({ id: b })),
          },
        },
      }),
      db.log.create({
        data: {
          content: `${me.name} (${me.id}) đã thay đổi Badge user ${user.name} (${user.id})`,
        },
      }),
      db.user.findUniqueOrThrow({
        where: {
          id: user.id,
        },
        select: {
          badge: {
            select: {
              id: true,
            },
          },
        },
      }),
    ]);

    return new Response(JSON.stringify(updatedUser.badge.map((b) => b.id)));
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

export async function PATCH(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized', { status: 401 });

    const { type, id } = z
      .object({
        type: z.enum(['ACCEPT', 'REJECT']),
        id: z.string(),
      })
      .parse(await req.json());

    const [me, user] = await db.$transaction([
      db.user.findUniqueOrThrow({
        where: {
          id: session.user.id,
          permissions: {
            hasSome: ['ADMINISTRATOR', 'MANAGE_USER'],
          },
          twoFactorEnabled: true,
        },
        select: {
          id: true,
          name: true,
        },
      }),
      db.user.findUniqueOrThrow({
        where: {
          id,
          isWaitVeify: {
            userId: id,
          },
        },
        select: {
          id: true,
          name: true,
          verified: true,
        },
      }),
    ]);

    if (user.verified) return new Response('Already verified', { status: 406 });

    await db.$transaction([
      db.user.update({
        where: {
          id: user.id,
        },
        data: {
          verified: type === 'ACCEPT' ? true : false,
          isWaitVeify: {
            delete: {
              userId: user.id,
            },
          },
          notifications: {
            create: {
              type: 'SYSTEM',
              content: `Yêu cầu xác thực của bạn đã ${
                type === 'ACCEPT' ? 'được chấp thuận.' : 'bị từ chối'
              }`,
              endPoint: `${process.env.MAIN_URL}`,
            },
          },
        },
      }),
      db.log.create({
        data: {
          content: `${me.name} (${me.id}) đã ${
            type === 'ACCEPT' ? 'chấp nhận' : 'từ chối'
          } Verify cho user ${user.name} (${user.id})`,
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
