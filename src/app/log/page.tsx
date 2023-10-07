import PaginationControll from '@/components/PaginationControll';
import { Button } from '@/components/ui/Button';
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
import { format } from 'date-fns';
import { notFound, redirect } from 'next/navigation';
import { FC } from 'react';
import Controll from '@/components/Manage/Log/Controll';

interface pageProps {
  searchParams: {
    [key: string]: string | string[] | undefined;
  };
}

const page: FC<pageProps> = async ({ searchParams }) => {
  const page = searchParams['page'] ?? '1';
  const orderBy = searchParams['order'] ?? 'desc';
  const session = await getAuthSession();
  if (!session) return redirect(`${process.env.MAIN_URL}`);

  const [user, logs, total] = await db.$transaction([
    db.user.findUnique({
      where: {
        id: session.user.id,
        permissions: {
          hasSome: ['ADMINISTRATOR'],
        },
        twoFactorEnabled: true,
      },
    }),
    db.log.findMany({
      take: INFINITE_SCROLL_PAGINATION_RESULTS,
      skip: (Number(page) - 1) * INFINITE_SCROLL_PAGINATION_RESULTS,
      orderBy: {
        createdAt: orderBy === 'asc' ? 'asc' : 'desc',
      },
    }),
    db.log.count(),
  ]);
  if (!user) return notFound();

  return (
    <section className="h-fit space-y-10 p-2 rounded-md dark:bg-zinc-900/60">
      <h1 className="text-xl font-semibold">Log</h1>

      <Controll />

      {!!logs.length && (
        <Table>
          <TableCaption>Log</TableCaption>

          <TableHeader>
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>Content</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>
                  <time dateTime={log.createdAt.toDateString()}>
                    {format(new Date(log.createdAt), 'k:m:s d/M/y')}
                  </time>
                </TableCell>
                <TableCell>{log.content}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <PaginationControll
        total={total}
        route={`/log?order=${orderBy === 'asc' ? 'asc' : 'desc'}`}
      />
    </section>
  );
};

export default page;
