import { getAuthSession } from '@/lib/auth';
import { UploadBadgeImage } from '@/lib/contabo';
import { db } from '@/lib/db';
import { BadgeFormValidator } from '@/lib/validators/badge';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';

export async function PATCH(req: Request, context: { params: { id: string } }) {
  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized', { status: 401 });

    const { icon, name, description, color } = BadgeFormValidator.parse(
      await req.formData()
    );

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
          id: +context.params.id,
        },
        select: {
          id: true,
          image: true,
        },
      }),
    ]);

    let image;
    if (icon instanceof File) {
      image = await UploadBadgeImage(icon, badge.id, badge.image);
    } else {
      image = icon;
    }

    await db.$transaction([
      db.badge.update({
        where: {
          id: badge.id,
        },
        data: {
          name,
          image,
          description,
          color,
        },
      }),
      db.log.create({
        data: {
          content: `${user.name} (${user.id}) đã sửa Badge ${name} (${badge.id})`,
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
