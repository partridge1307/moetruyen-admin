import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { notFound, redirect } from 'next/navigation';
import { FC } from 'react';
import dynamic from 'next/dynamic';

const TeamEditForm = dynamic(() => import('@/components/Manage/Team/Edit'), {
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

  const [user, team] = await db.$transaction([
    db.user.findUnique({
      where: {
        id: session.user.id,
        permissions: {
          hasSome: ['ADMINISTRATOR', 'MANAGE_TEAM'],
        },
        twoFactorEnabled: true,
      },
    }),
    db.team.findUnique({
      where: {
        id: +params.id,
      },
      select: {
        id: true,
        image: true,
        name: true,
        description: true,
      },
    }),
  ]);
  if (!user || !team) return notFound();

  return (
    <section className="h-fit space-y-10 p-2 rounded-md dark:bg-zinc-900/60">
      <TeamEditForm team={team} />
    </section>
  );
};

export default page;
