import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { notFound, redirect } from 'next/navigation';
import { FC } from 'react';
import dynamic from 'next/dynamic';
import ChapterUploadSkeleton from '@/components/Skeleton/ChapterUploadSkeleton';

const ChapterEdit = dynamic(() => import('@/components/Manage/Chapter/Edit'), {
  ssr: false,
  loading: () => <ChapterUploadSkeleton />,
});

interface pageProps {
  params: {
    id: string;
  };
}

const page: FC<pageProps> = async ({ params }) => {
  const session = await getAuthSession();
  if (!session) return redirect(`${process.env.MAIN_URL}`);

  const [user, chapter] = await Promise.all([
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
        name: true,
        volume: true,
        chapterIndex: true,
        images: true,
      },
    }),
  ]);

  if (!user || !chapter) return notFound();

  return (
    <section className="h-fit p-2 rounded-md dark:bg-zinc-900/60">
      <ChapterEdit chapter={chapter} />
    </section>
  );
};

export default page;
