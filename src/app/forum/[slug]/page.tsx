import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { formatTimeToNow } from '@/lib/utils';
import Image from 'next/image';
import { notFound, redirect } from 'next/navigation';
import { FC } from 'react';
import dynamic from 'next/dynamic';

const Controll = dynamic(() => import('@/components/Manage/Forum/Controll'), {
  ssr: false,
  loading: () => (
    <div className="h-10 rounded-md animate-pulse bg-background" />
  ),
});

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
        permissions: true,
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
        createdAt: true,
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            subscriptions: true,
          },
        },
      },
    }),
  ]);
  if (!user || !forum) return notFound();

  return (
    <section className="h-fit p-2 space-y-6 rounded-md dark:bg-zinc-900/60">
      {!!forum.banner && (
        <div className="relative aspect-video">
          <Image
            fill
            sizes="(max-width: 640px) 30vw, 40vw"
            quality={40}
            src={forum.banner}
            alt={`${forum.title} Thumbnail`}
          />
        </div>
      )}

      <div className="flex flex-wrap justify-between items-center">
        <p>
          <span>Tên:</span> {forum.title}
        </p>
        <p>
          <span>Slug:</span> {forum.slug}
        </p>
      </div>

      <Controll forum={forum} user={user} />

      <div className="flex flex-wrap justify-between items-center">
        <p>
          <span>Cho phép người khác đăng bài:</span>{' '}
          {forum.canSend ? 'Có' : 'Không'}
        </p>
        <p>
          <span>Tạo bởi:</span> {forum.creator.name} ({forum.creator.id})
        </p>
      </div>

      <div className="flex flex-wrap justify-between items-center">
        <p>{forum._count.subscriptions} member</p>
        <dl className="flex items-center gap-2">
          <dt>Tạo từ:</dt>
          <dd>
            <time dateTime={forum.createdAt.toDateString()}>
              {formatTimeToNow(new Date(forum.createdAt))}
            </time>
          </dd>
        </dl>
      </div>
    </section>
  );
};

export default page;
