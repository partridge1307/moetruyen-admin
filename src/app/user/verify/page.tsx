import VerifyAction from '@/components/Manage/Verify/Action';
import PaginationControll from '@/components/PaginationControll';
import { buttonVariants } from '@/components/ui/Button';
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
  const order = searchParams['order'] ?? 'desc';
  const session = await getAuthSession();
  if (!session) return redirect(`${process.env.MAIN_URL}`);

  const [user, verify, total] = await db.$transaction([
    db.user.findUnique({
      where: {
        id: session.user.id,
        permissions: {
          hasSome: ['ADMINISTRATOR', 'MANAGE_USER'],
        },
        twoFactorEnabled: true,
      },
    }),
    db.verifyList.findMany({
      take: INFINITE_SCROLL_PAGINATION_RESULTS,
      skip: (Number(page) - 1) * INFINITE_SCROLL_PAGINATION_RESULTS,
      orderBy: {
        createdAt: order === 'desc' ? 'desc' : 'asc',
      },
      select: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),
    db.verifyList.count(),
  ]);
  if (!user) return notFound();

  return (
    <section className="h-fit space-y-10 p-2 rounded-md dark:bg-zinc-900/60">
      <h1 className="text-xl font-semibold">Quản lý Verify</h1>

      {order === 'asc' ? (
        <Link
          href={`/user/verify?order=desc&page=${page}`}
          className={buttonVariants()}
        >
          Giảm dần
        </Link>
      ) : (
        <Link
          href={`/user/verify?order=asc&page=${page}`}
          className={buttonVariants()}
        >
          Tăng dần
        </Link>
      )}

      {!!verify.length && (
        <Table>
          <TableCaption>Danh sách người dùng</TableCaption>

          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Tên</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {verify.map(({ user }) => (
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
                  <VerifyAction id={user.id} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <PaginationControll total={total} route="/user/verify?order=desc" />
    </section>
  );
};

export default page;
