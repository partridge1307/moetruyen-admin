import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { tagGroupByCategory } from '@/lib/query';
import { notFound, redirect } from 'next/navigation';
import { FC } from 'react';
import dynamic from 'next/dynamic';
import MangaUploadSkeleton from '@/components/Skeleton/MangaUploadSkeleton';

const EditManga = dynamic(() => import('@/components/Manage/Manga/Edit'), {
  ssr: false,
  loading: () => <MangaUploadSkeleton />,
});

interface pageProps {
  params: {
    slug: string;
  };
}

const page: FC<pageProps> = async ({ params }) => {
  const session = await getAuthSession();
  if (!session) return redirect(`${process.env.MAIN_URL}`);

  const [user, manga, tags] = await Promise.all([
    db.user.findUnique({
      where: {
        id: session.user.id,
        permissions: {
          hasSome: ['ADMINISTRATOR', 'MANAGE_MANGA'],
        },
        twoFactorEnabled: true,
      },
      select: {
        id: true,
      },
    }),
    db.manga.findUnique({
      where: {
        slug: params.slug,
      },
      select: {
        id: true,
        slug: true,
        name: true,
        altName: true,
        image: true,
        author: true,
        tags: true,
        description: true,
        review: true,
        facebookLink: true,
        discordLink: true,
      },
    }),
    tagGroupByCategory(),
  ]);

  if (!user || !manga) return notFound();

  return (
    <section className="h-fit p-2 rounded-md dark:bg-zinc-900/60">
      <EditManga manga={manga} tags={tags} />
    </section>
  );
};

export default page;
