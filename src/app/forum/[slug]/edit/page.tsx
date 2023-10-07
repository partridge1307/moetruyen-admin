import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { notFound, redirect } from 'next/navigation';
import { FC } from 'react';
import dynamic from 'next/dynamic';

const ThreadEditForm = dynamic(
  () => import('@/components/Manage/Forum/ThreadEditForm'),
  { ssr: false }
);

interface pageProps {
  params: {
    slug: string;
  };
}

const page: FC<pageProps> = async ({ params }) => {
  const session = await getAuthSession();
  if (!session) return redirect(`${process.env.MAIN_URL}`);

  const [user, forum] = await db.$transaction([
    db.user.findUnique({
      where: {
        id: session.user.id,
        permissions: {
          hasSome: ['ADMINISTRATOR', 'MANAGE_FORUM'],
        },
        twoFactorEnabled: true,
      },
      select: {
        id: true,
      },
    }),
    db.subForum.findUnique({
      where: {
        slug: params.slug,
      },
      select: {
        id: true,
        slug: true,
        title: true,
        banner: true,
        canSend: true,
        subscriptions: {
          where: {
            isManager: true,
          },
          select: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    }),
  ]);
  if (!user || !forum) return notFound();

  return (
    <section className="h-fit p-2 rounded-md dark:bg-zinc-900/60">
      <ThreadEditForm subForum={forum} />
    </section>
  );
};

export default page;
