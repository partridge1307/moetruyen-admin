import Username from '@/components/User/Username';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { notFound, redirect } from 'next/navigation';
import { FC } from 'react';

const MTEditor = dynamic(
  () => import('@/components/Editor/MoetruyenEditorOutput'),
  { ssr: false }
);
const MangaControll = dynamic(
  () => import('@/components/Manage/Manga/Controll'),
  {
    ssr: false,
    loading: () => (
      <div className="h-10 rounded-md animate-pulse bg-background" />
    ),
  }
);

interface pageProps {
  params: {
    slug: string;
  };
}

const page: FC<pageProps> = async ({ params }) => {
  const session = await getAuthSession();
  if (!session) return redirect(`${process.env.MAIN_URL}`);

  const [user, manga] = await db.$transaction([
    db.user.findUnique({
      where: {
        id: session.user.id,
        permissions: {
          hasSome: ['ADMINISTRATOR', 'MANAGE_MANGA'],
        },
        twoFactorEnabled: true,
      },
      select: {
        permissions: true,
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
        image: true,
        description: true,
        facebookLink: true,
        discordLink: true,
        isPublished: true,
        canPin: true,
        creator: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
        _count: {
          select: {
            chapter: true,
          },
        },
      },
    }),
  ]);
  if (!user || !manga) return notFound();

  return (
    <section className="h-fit p-2 space-y-6 rounded-md dark:bg-zinc-900/60">
      <div className="relative" style={{ aspectRatio: 4 / 3 }}>
        <Image
          fill
          sizes="(max-width: 640px) 40vw, 50vw"
          quality={40}
          src={manga.image}
          alt={`${manga.name} Thumbnail`}
          className="object-cover rounded-md"
        />
      </div>

      <h1 className="text-xl font-semibold">
        <span>Tên:</span> {manga.name}
      </h1>

      <dl className="flex flex-wrap justify-between">
        <dt className="flex flex-wrap items-center gap-2">
          <span>Người đăng:</span> <Username user={manga.creator} /> (
          {manga.creator.id})
        </dt>
        <dd>
          <span>ID:</span> {manga.id}
        </dd>
      </dl>

      <MangaControll manga={manga} user={user} />

      <dl className="flex flex-wrap justify-between">
        <dt>
          <span>Slug:</span> {manga.slug}
        </dt>

        <dd>
          <span>Trạng thái:</span>{' '}
          <span
            className={`${
              manga.isPublished ? 'text-green-400' : 'text-red-400'
            } font-semibold`}
          >
            {manga.isPublished ? 'Đã đăng' : 'Chờ đăng'}
          </span>
        </dd>
      </dl>

      <p>{manga._count.chapter} Chapter</p>

      <div className="space-y-1">
        <p className="text-lg font-medium">Mô tả</p>
        <MTEditor id={manga.id} content={manga.description} />
      </div>

      {!!manga.facebookLink && (
        <p>
          <span>FB:</span>{' '}
          <a
            target="_blank"
            href={manga.facebookLink}
            className="text-blue-500"
          >
            LINK
          </a>
        </p>
      )}

      {!!manga.discordLink && (
        <p>
          <span>FB:</span>{' '}
          <a target="_blank" href={manga.discordLink} className="text-blue-500">
            LINK
          </a>
        </p>
      )}
    </section>
  );
};

export default page;
