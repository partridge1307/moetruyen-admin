import { getAuthSession } from '@/lib/auth';
import { UploadTeamImage } from '@/lib/contabo';
import { db } from '@/lib/db';
import { TeamFormValidator } from '@/lib/validators/team';
import { Prisma } from '@prisma/client';
import { z } from 'zod';

export async function POST(req: Request, context: { params: { id: string } }) {
  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized', { status: 401 });

    const { userId } = z.object({ userId: z.string() }).parse(await req.json());

    const [me, team, user] = await db.$transaction([
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
          id: +context.params.id,
        },
        select: {
          id: true,
          name: true,
        },
      }),
      db.user.findUniqueOrThrow({
        where: {
          id: userId,
        },
        select: {
          id: true,
          name: true,
        },
      }),
    ]);

    await db.$transaction([
      db.team.update({
        where: {
          id: team.id,
        },
        data: {
          ownerId: user.id,
        },
      }),
      db.log.create({
        data: {
          content: `${me.name} (${me.id}) đã chuyển Owner Team ${team.name} (${team.id}) qua ${user.name} (${user.id})`,
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

export async function PATCH(req: Request, context: { params: { id: string } }) {
  try {
    const sesison = await getAuthSession();
    if (!sesison) return new Response('Unauthorized', { status: 401 });

    const {
      image: img,
      name,
      description,
    } = TeamFormValidator.parse(await req.formData());

    const [team, user] = await db.$transaction([
      db.team.findUniqueOrThrow({
        where: {
          id: +context.params.id,
        },
      }),
      db.user.findUniqueOrThrow({
        where: {
          id: sesison.user.id,
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
    ]);

    let image;
    if (img instanceof File)
      image = await UploadTeamImage(img, team.id, team.image);
    else image = img;

    await db.$transaction([
      db.team.update({
        where: {
          id: team.id,
        },
        data: {
          image,
          name,
          description,
        },
      }),
      db.log.create({
        data: {
          content: `${user.name} (${user.id}) đã chỉnh sửa Team ${name} (${team.id})`,
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
