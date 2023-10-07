import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { notFound, redirect } from 'next/navigation';
import { FC } from 'react';
import dynamic from 'next/dynamic';

const EditBadgeForm = dynamic(() => import('@/components/Manage/Badge/Edit'), {
  ssr: false,
});

interface pageProps {
  params: {
    id: string;
  };
}

const page: FC<pageProps> = async ({ params }) => {
  const session = await getAuthSession();
  if (!session) return redirect(`${process.env.MAIN_URL}`);

  const [user, badge] = await db.$transaction([
    db.user.findUnique({
      where: {
        id: session.user.id,
        permissions: {
          hasSome: ['ADMINISTRATOR', 'MANAGE_BADGE'],
        },
        twoFactorEnabled: true,
      },
      select: {
        id: true,
      },
    }),
    db.badge.findUnique({
      where: {
        id: +params.id,
      },
      select: {
        id: true,
        image: true,
        name: true,
        description: true,
        color: true,
      },
    }),
  ]);
  if (!user || !badge) return notFound();

  return (
    <section className="h-fit p-2 space-y-6 rounded-md dark:bg-zinc-900/60">
      <h1 className="text-xl font-semibold">Sửa huy hiệu</h1>

      <EditBadgeForm badge={badge} />
    </section>
  );
};

export default page;
