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

  const [user, chapters, total] = await db.$transaction([
    db.user.findUnique({
      where: {
        id: session.user.id,
        permissions: {
          hasSome: ['ADMINISTRATOR', 'MANAGE_CHAPTER'],
        },
        twoFactorEnabled: true,
      },
    }),
    db.chapter.findMany({
      take: INFINITE_SCROLL_PAGINATION_RESULTS,
      skip: (Number(page) - 1) * INFINITE_SCROLL_PAGINATION_RESULTS,
      select: {
        id: true,
        name: true,
        isPublished: true,
        mangaId: true,
        chapterIndex: true,
      },
    }),
    db.chapter.count(),
  ]);
  if (!user) return notFound();

  return (
    <section className="h-fit space-y-10 p-2 rounded-md dark:bg-zinc-900/60">
      <h1 className="text-xl font-semibold">Quản lý Chapter</h1>

      <div className="space-y-2">
        <h2 className="text-lg font-medium">Tìm kiếm Chapter</h2>

        <form
          action={async (formData) => {
            'use server';

            const id = formData.get('id');
            if (!id) return;

            const chapter = await db.chapter.findUnique({
              where: {
                id: +id,
              },
              select: {
                id: true,
              },
            });
            if (!chapter) return notFound();

            return redirect(`/chapter/${chapter.id}`);
          }}
          className="flex items-center gap-2"
        >
          <Input name="id" autoComplete="off" placeholder="Chapter ID" />
          <Button type="submit">
            <Search className="w-5 h-5" />
          </Button>
        </form>
      </div>

      {!!chapters.length && (
        <Table>
          <TableCaption>Danh sách Chapter</TableCaption>

          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Manga ID</TableHead>
              <TableHead>STT Chapter</TableHead>
              <TableHead>Tên</TableHead>
              <TableHead>Trạng thái</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {chapters.map((chapter) => (
              <TableRow key={chapter.id}>
                <TableCell>
                  <Link href={`/chapter/${chapter.id}`}>{chapter.id}</Link>
                </TableCell>
                <TableCell>
                  <Link href={`/chapter/${chapter.id}`}>{chapter.mangaId}</Link>
                </TableCell>
                <TableCell>
                  <Link href={`/chapter/${chapter.id}`}>
                    {chapter.chapterIndex}
                  </Link>
                </TableCell>
                <TableCell>
                  <Link href={`/chapter/${chapter.id}`}>{chapter.name}</Link>
                </TableCell>
                <TableCell>
                  <Link href={`/chapter/${chapter.id}`}>
                    {chapter.isPublished ? 'Đã đăng' : 'Chờ đăng'}
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <PaginationControll total={total} route="/chapter?" />
    </section>
  );
};

export default page;
