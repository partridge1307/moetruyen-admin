import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';
import { z } from 'zod';

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized');

    const { id, muteTo } = z
      .object({
        id: z.string(),
        muteTo: z.string().refine((date) => {
          const today = new Date();
          today.setDate(today.getDate() + 1);

          return new Date(date).getTime() >= today.setHours(0, 0, 0, 0);
        }, 'Mute must be larger current date 1 day'),
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
          muteExpires: true,
          permissions: true,
        },
      }),
    ]);

    if (
      !me.permissions.includes('ADMINISTRATOR') &&
      user.permissions.includes('ADMINISTRATOR')
    )
      return new Response('Not found', { status: 404 });

    if (user.muteExpires && user.muteExpires.getTime() >= new Date().getTime())
      return new Response('Target was muted before', { status: 406 });

    await db.$transaction([
      db.user.update({
        where: {
          id: user.id,
        },
        data: {
          muteExpires: new Date(muteTo),
          session: {
            deleteMany: {
              userId: user.id,
            },
          },
        },
      }),
      db.log.create({
        data: {
          content: `${me.name} (${me.id}) đã Mute người dùng ${user.name} (${
            user.id
          }) ${new Date(muteTo).getDay()} ngày`,
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
