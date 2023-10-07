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

  const [user, forums, total] = await db.$transaction([
    db.user.findUnique({
      where: {
        id: session.user.id,
        permissions: {
          hasSome: ['ADMINISTRATOR', 'MANAGE_FORUM'],
        },
        twoFactorEnabled: true,
      },
    }),
    db.subForum.findMany({
      take: INFINITE_SCROLL_PAGINATION_RESULTS,
      skip: (Number(page) - 1) * INFINITE_SCROLL_PAGINATION_RESULTS,
      select: {
        id: true,
        slug: true,
        title: true,
      },
    }),
    db.subForum.count(),
  ]);
  if (!user) return notFound();

  return (
    <section className="h-fit space-y-10 p-2 rounded-md dark:bg-zinc-900/60">
      <h1 className="text-xl font-semibold">Quản lý Forum</h1>

      <div className="space-y-2">
        <h2 className="text-lg font-medium">Tìm kiếm Forum</h2>

        <form
          action={async (formData) => {
            'use server';

            const id = formData.get('id');

            if (!id) {
              const slug = formData.get('slug');
              if (!slug) return;

              const forum = await db.subForum.findFirst({
                where: {
                  slug: `${slug}`,
                },
                select: {
                  slug: true,
                },
              });
              if (!forum) return notFound();

              return redirect(`/forum/${forum.slug}`);
            }

            const forum = await db.subForum.findUnique({
              where: {
                id: +id,
              },
              select: {
                slug: true,
              },
            });
            if (!forum) return notFound();

            return redirect(`/forum/${forum.slug}`);
          }}
          className="flex items-center gap-2"
        >
          <Input name="id" autoComplete="off" placeholder="Forum ID" />
          <Input name="slug" autoComplete="off" placeholder="Forum Slug" />
          <Button type="submit">
            <Search className="w-5 h-5" />
          </Button>
        </form>
      </div>

      {!!forums.length && (
        <Table>
          <TableCaption>Danh sách Forum</TableCaption>

          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Tên</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {forums.map((forum) => (
              <TableRow key={forum.id}>
                <TableCell>
                  <Link href={`/forum/${forum.slug}`}>{forum.id}</Link>
                </TableCell>
                <TableCell>
                  <Link href={`/forum/${forum.slug}`}>{forum.slug}</Link>
                </TableCell>
                <TableCell>
                  <Link href={`/forum/${forum.slug}`}>{forum.title}</Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <PaginationControll total={total} route="/forum?" />
    </section>
  );
};

export default page;
