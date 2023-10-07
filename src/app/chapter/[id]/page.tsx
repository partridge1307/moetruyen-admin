import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { formatTimeToNow } from '@/lib/utils';
import { notFound, redirect } from 'next/navigation';
import { FC } from 'react';
import dynamic from 'next/dynamic';

const Controll = dynamic(() => import('@/components/Manage/Chapter/Controll'), {
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

  const [user, chapter] = await db.$transaction([
    db.user.findUnique({
      where: {
        id: session.user.id,
        permissions: {
          hasSome: ['ADMINISTRATOR', 'MANAGE_CHAPTER'],
        },
        twoFactorEnabled: true,
      },
    }),
    db.chapter.findUnique({
      where: {
        id: +params.id,
      },
      select: {
        id: true,
        volume: true,
        chapterIndex: true,
        name: true,
        images: true,
        mangaId: true,
        isPublished: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
  ]);
  if (!user || !chapter) return notFound();

  return (
    <section className="h-fit p-2 space-y-6 rounded-md dark:bg-zinc-900/60">
      <div className="flex flex-wrap justify-between items-center">
        <p>
          <span>Chapter ID:</span> {chapter.id}
        </p>
        <p>
          <span>Volume:</span> {chapter.volume}
        </p>
        <p>
          <span>STT Chapter:</span> {chapter.chapterIndex}
        </p>
      </div>

      <div className="flex flex-wrap justify-between items-center">
        <p>
          {chapter.images.length} <span>Ảnh</span>
        </p>
        <p>
          <span>Manga ID:</span> {chapter.mangaId}
        </p>
        <p>
          <span>Tên Chapter:</span> {chapter.name}
        </p>
      </div>

      <div className="flex flex-wrap justify-between items-center">
        <dl className="flex items-center gap-2">
          <dt>Trạng thái:</dt>
          <dd
            className={`font-semibold ${
              chapter.isPublished ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {chapter.isPublished ? 'Đã đăng' : 'Chờ đăng'}
          </dd>
        </dl>
        <dl className="flex items-center gap-2">
          <dt>Tạo vào:</dt>
          <dd>
            <time dateTime={chapter.createdAt.toDateString()}>
              {formatTimeToNow(new Date(chapter.createdAt))}
            </time>
          </dd>
        </dl>
        <dl className="flex items-center gap-2">
          <dt>Cập nhật vào:</dt>
          <dd>
            <time dateTime={chapter.updatedAt.toDateString()}>
              {formatTimeToNow(new Date(chapter.updatedAt))}
            </time>
          </dd>
        </dl>
      </div>

      <Controll chapter={chapter} />
    </section>
  );
};

export default page;
