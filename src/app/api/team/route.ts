import { getAuthSession } from '@/lib/auth';
import { DeleteTeamImage } from '@/lib/contabo';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';
import { z } from 'zod';

const TeamValidator = z.object({
  id: z.number(),
});

export async function DELETE(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized', { status: 401 });

    const { id } = TeamValidator.parse(await req.json());

    const [user, team] = await db.$transaction([
      db.user.findUniqueOrThrow({
        where: {
          id: session.user.id,
          permissions: {
            hasSome: ['ADMINISTRATOR', 'MANAGE_TEAM'],
          },
          twoFactorEnabled: true,
        },
        select: {
          id: true,
          name: true,
        },
      }),
      db.team.findUniqueOrThrow({
        where: {
          id,
        },
        select: {
          id: true,
          name: true,
        },
      }),
    ]);

    await Promise.all([
      DeleteTeamImage(team.id),
      db.$transaction([
        db.team.delete({
          where: {
            id: team.id,
          },
        }),
      ]),
      db.log.create({
        data: {
          content: `${user.name} (${user.id}) đã xóa Team ${team.name} (${team.id})`,
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
