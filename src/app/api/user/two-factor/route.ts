import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';
import { z } from 'zod';

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized');

    const { id } = z
      .object({
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
          twoFactorEnabled: true,
          permissions: true,
        },
      }),
    ]);

    if (
      !me.permissions.includes('ADMINISTRATOR') &&
      user.permissions.includes('ADMINISTRATOR')
    )
      return new Response('Not found', { status: 404 });

    if (!user.twoFactorEnabled)
      return new Response('Two factor enabled required', { status: 406 });

    await db.$transaction([
      db.user.update({
        where: {
          id: user.id,
        },
        data: {
          twoFactorEnabled: false,
          twoFactorSecret: null,
        },
      }),
      db.log.create({
        data: {
          content: `${me.name} (${me.id}) đã tắt 2FA ${user.name} (${user.id})`,
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
