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

  const [user, teams, total] = await db.$transaction([
    db.user.findUnique({
      where: {
        id: session.user.id,
        permissions: {
          hasSome: ['ADMINISTRATOR', 'MANAGE_TEAM'],
        },
        twoFactorEnabled: true,
      },
    }),
    db.team.findMany({
      take: INFINITE_SCROLL_PAGINATION_RESULTS,
      skip: (Number(page) - 1) * INFINITE_SCROLL_PAGINATION_RESULTS,
    }),
    db.team.count(),
  ]);
  if (!user) return notFound();

  return (
    <section className="h-fit space-y-10 p-2 rounded-md dark:bg-zinc-900/60">
      <h1 className="text-xl font-semibold">Quản lý Team</h1>

      <div className="space-y-2">
        <h2 className="text-lg font-medium">Tìm kiếm Team</h2>

        <form
          action={async (formData) => {
            'use server';

            const id = formData.get('id');
            if (!id) {
              const name = formData.get('name');
              if (!name) return;

              const team = await db.team.findFirst({
                where: {
                  name: `${name}`,
                },
                select: {
                  id: true,
                },
              });
              if (!team) return notFound();

              return redirect(`/team/${team.id}`);
            }

            const team = await db.team.findUnique({
              where: {
                id: +id,
              },
              select: {
                id: true,
              },
            });
            if (!team) return notFound();

            return redirect(`/team/${team.id}`);
          }}
          className="flex items-center gap-2"
        >
          <Input name="id" autoComplete="off" placeholder="Team ID" />
          <Input name="name" autoComplete="off" placeholder="Team Name" />
          <Button type="submit">
            <Search className="w-5 h-5" />
          </Button>
        </form>
      </div>

      {!!teams.length && (
        <Table>
          <TableCaption>Danh sách Team</TableCaption>

          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Tên</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {teams.map((team) => (
              <TableRow key={team.id}>
                <TableCell>
                  <Link href={`/team/${team.id}`}>{team.id}</Link>
                </TableCell>
                <TableCell>
                  <Link href={`/team/${team.id}`}>{team.name}</Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <PaginationControll total={total} route="/team?" />
    </section>
  );
};

export default page;
