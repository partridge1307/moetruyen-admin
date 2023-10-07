import { getAuthSession } from '@/lib/auth';
import { DeleteBadgeImage, UploadBadgeImage } from '@/lib/contabo';
import { db } from '@/lib/db';
import { BadgeFormValidator } from '@/lib/validators/badge';
import { Prisma } from '@prisma/client';
import { ZodError, z } from 'zod';

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized', { status: 401 });

    const { icon, name, description, color } = BadgeFormValidator.parse(
      await req.formData()
    );

    const user = await db.user.findUniqueOrThrow({
      where: {
        id: session.user.id,
        permissions: {
          hasSome: ['ADMINISTRATOR', 'MANAGE_BADGE'],
        },
        twoFactorEnabled: true,
      },
      select: {
        id: true,
        name: true,
      },
    });

    const createdBadge = await db.badge.create({
      data: {
        image: '',
        name,
        description,
        color,
      },
    });

    let image;
    if (icon instanceof File) {
      image = await UploadBadgeImage(icon, createdBadge.id, null);
    } else {
      image = icon;
    }

    await db.$transaction([
      db.badge.update({
        where: {
          id: createdBadge.id,
        },
        data: {
          image,
        },
      }),
      db.log.create({
        data: {
          content: `${user.name} (${user.id}) đã tạo Badge ${createdBadge.name} (${createdBadge.id})`,
        },
      }),
    ]);

    return new Response('OK');
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

export async function DELETE(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized', { status: 401 });

    const { id } = z
      .object({
        id: z.number(),
      })
      .parse(await req.json());

    const [user, badge] = await db.$transaction([
      db.user.findUniqueOrThrow({
        where: {
          id: session.user.id,
          permissions: {
            hasSome: ['ADMINISTRATOR', 'MANAGE_BADGE'],
          },
          twoFactorEnabled: true,
        },
        select: {
          id: true,
          name: true,
        },
      }),
      db.badge.findUniqueOrThrow({
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
      DeleteBadgeImage(badge.id),
      db.$transaction([
        db.badge.delete({
          where: {
            id: badge.id,
          },
        }),
        db.log.create({
          data: {
            content: `${user.name} (${user.id}) đã xóa Badge ${badge.name} (${badge.id})`,
          },
        }),
      ]),
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
