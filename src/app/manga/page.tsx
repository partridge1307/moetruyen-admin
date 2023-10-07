import PaginationControll from '@/components/PaginationControll';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import { INFINITE_SCROLL_PAGINATION_RESULTS } from '@/config';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { Search } from 'lucide-react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { FC } from 'react';

interface pageProps {
  searchParams: {
    [key: string]: string | string[] | undefined;
  };
}

const page: FC<pageProps> = async ({ searchParams }) => {
  const page = searchParams['page'] ?? '1';
  const session = await getAuthSession();
  if (!session) return redirect(`${process.env.MAIN_URL}`);

  const [user, mangas, total] = await db.$transaction([
    db.user.findUnique({
      where: {
        id: session.user.id,
        permissions: {
          hasSome: ['ADMINISTRATOR', 'MANAGE_MANGA'],
        },
        twoFactorEnabled: true,
      },
    }),
    db.manga.findMany({
      take: INFINITE_SCROLL_PAGINATION_RESULTS,
      skip: (Number(page) - 1) * INFINITE_SCROLL_PAGINATION_RESULTS,
      select: {
        id: true,
        slug: true,
        name: true,
        isPublished: true,
      },
    }),
    db.manga.count(),
  ]);
  if (!user) return notFound();

  return (
    <section className="h-fit space-y-10 p-2 rounded-md dark:bg-zinc-900/60">
      <h1 className="text-xl font-semibold">Quản lý Manga</h1>

      <div className="space-y-2">
        <h2 className="text-lg font-medium">Tìm kiếm Manga</h2>

        <form
          action={async (formData) => {
            'use server';

            const slug = formData.get('slug');

            if (!slug) {
              const name = formData.get('name');
              if (!name) return;

              const manga = await db.manga.findFirst({
                where: {
                  name: `${name}`,
                },
                select: {
                  slug: true,
                },
              });

              if (!manga) return notFound();

              return redirect(`/manga/${manga.slug}`);
            } else return redirect(`/manga/${slug}`);
          }}
          className="flex items-center gap-2"
        >
          <Input name="slug" autoComplete="off" placeholder="Slug manga" />
          <Input name="name" autoComplete="off" placeholder="Tên manga" />
          <Button type="submit">
            <Search className="w-5 h-5" />
          </Button>
        </form>
      </div>

      {!!mangas.length && (
        <Table>
          <TableCaption>Danh sách Manga</TableCaption>

          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Tên</TableHead>
              <TableHead>Trạng thái</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {mangas.map((manga) => (
              <TableRow key={manga.id}>
                <TableCell>
                  <Link href={`/manga/${manga.slug}`}>{manga.id}</Link>
                </TableCell>
                <TableCell>
                  <Link href={`/manga/${manga.slug}`}>{manga.slug}</Link>
                </TableCell>
                <TableCell>
                  <Link href={`/manga/${manga.slug}`}>{manga.name}</Link>
                </TableCell>
                <TableCell>
                  <Link href={`/manga/${manga.slug}`}>
                    {manga.isPublished ? 'Đã đăng' : 'Chờ đăng'}
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <PaginationControll total={total} route="/manga?" />
    </section>
  );
};

export default page;
