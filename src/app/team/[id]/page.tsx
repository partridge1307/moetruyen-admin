import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { formatTimeToNow } from '@/lib/utils';
import Image from 'next/image';
import { notFound, redirect } from 'next/navigation';
import { FC } from 'react';
import dynamic from 'next/dynamic';

const Controll = dynamic(() => import('@/components/Manage/Team/Controll'), {
  ssr: false,
  loading: () => (
    <div className="h-10 rounded-md animate-pulse bg-background" />
  ),
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
        createdAt: true,
        owner: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),
  ]);
  if (!user || !team) return notFound();

  return (
    <section className="h-fit space-y-10 p-2 rounded-md dark:bg-zinc-900/60">
      <div className="relative aspect-square">
        <Image
          fill
          sizes="(max-width: 640px) 30vw, 40vw"
          quality={40}
          src={team.image}
          alt={`${team.name} Thumbnail`}
        />
      </div>

      <h1 className="text-xl font-semibold">
        <span>Tên:</span> {team.name}
      </h1>

      <Controll team={team} />

      <p>
        <span>Mô tả:</span> {team.description}
      </p>

      <div className="flex flex-wrap justify-between items-center">
        <p>
          <span>Chủ:</span> {team.owner.name} ({team.owner.id})
        </p>

        <dl className="flex items-center gap-2">
          <dt>Ngày tạo:</dt>
          <dd>
            <time dateTime={team.createdAt.toDateString()}>
              {formatTimeToNow(new Date(team.createdAt))}
            </time>
          </dd>
        </dl>
      </div>
    </section>
  );
};

export default page;
