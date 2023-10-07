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

  const [user, users, total] = await db.$transaction([
    db.user.findUnique({
      where: {
        id: session.user.id,
        permissions: {
          hasSome: ['ADMINISTRATOR', 'MANAGE_USER'],
        },
        twoFactorEnabled: true,
      },
      select: {
        id: true,
      },
    }),
    db.user.findMany({
      take: INFINITE_SCROLL_PAGINATION_RESULTS,
      skip: (Number(page) - 1) * INFINITE_SCROLL_PAGINATION_RESULTS,
      select: {
        id: true,
        name: true,
        verified: true,
      },
    }),
    db.user.count(),
  ]);
  if (!user) return notFound();

  return (
    <section className="h-fit space-y-10 p-2 rounded-md dark:bg-zinc-900/60">
      <h1 className="text-xl font-semibold">Quản lý người dùng</h1>

      <div className="space-y-2">
        <h2 className="text-lg font-medium">Tìm kiếm người dùng</h2>

        <form
          action={async (formData) => {
            'use server';

            const id = formData.get('id');

            if (!id) {
              const name = formData.get('name');
              if (!name) return;

              const user = await db.user.findUnique({
                where: {
                  name: `${name}`,
                },
                select: {
                  id: true,
                },
              });

              if (!user) return notFound();

              return redirect(`/user/${user.id}`);
            } else return redirect(`/user/${id}`);
          }}
          className="flex items-center gap-2"
        >
          <Input name="id" autoComplete="off" placeholder="ID người dùng" />
          <Input name="name" autoComplete="off" placeholder="Tên người dùng" />
          <Button type="submit">
            <Search className="w-5 h-5" />
          </Button>
        </form>
      </div>

      {!!users.length && (
        <Table>
          <TableCaption>Danh sách người dùng</TableCaption>

          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Tên</TableHead>
              <TableHead>Verify</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="w-64">
                  <Link href={`/user/${user.id}`}>{user.id}</Link>
                </TableCell>
                <TableCell>
                  <Link href={`/user/${user.id}`}>
                    {user.name ?? 'Không có tên'}
                  </Link>
                </TableCell>
                <TableCell>
                  <Link href={`/user/${user.id}`}>
                    {user.verified ? 'True' : 'False'}
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <PaginationControll total={total} route="/user?" />
    </section>
  );
};

export default page;
