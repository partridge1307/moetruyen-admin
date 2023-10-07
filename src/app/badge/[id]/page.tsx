import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import Image from 'next/image';
import { notFound, redirect } from 'next/navigation';
import { FC } from 'react';
import dynamic from 'next/dynamic';

const Controll = dynamic(() => import('@/components/Manage/Badge/Controll'), {
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
        _count: {
          select: {
            user: true,
          },
        },
      },
    }),
  ]);
  if (!user || !badge) return notFound();

  return (
    <section className="h-fit p-2 space-y-6 rounded-md dark:bg-zinc-900/60">
      <div className="relative aspect-square">
        <Image
          fill
          sizes="(max-width: 640px) 60vw, 70vw"
          quality={40}
          src={badge.image}
          alt={`${badge.name} Icon`}
          className="object-cover"
        />
      </div>

      <h1 className="text-xl font-semibold">
        <span>Tên:</span> {badge.name}
      </h1>

      <Controll badge={badge} />

      <p>
        <span>Mô tả:</span> {badge.description}
      </p>

      <p>
        <span>Màu:</span> {JSON.stringify(badge.color)}
      </p>

      <p>{badge._count.user} người dùng</p>
    </section>
  );
};

export default page;
