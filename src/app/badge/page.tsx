import PaginationControll from '@/components/PaginationControll';
import { Button, buttonVariants } from '@/components/ui/Button';
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
import Image from 'next/image';
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

  const [user, badges, total] = await db.$transaction([
    db.user.findUnique({
      where: {
        id: session.user.id,
        permissions: {
          hasSome: ['ADMINISTRATOR', 'MANAGE_BADGE'],
        },
        twoFactorEnabled: true,
      },
      select: {
        id: true,
      },
    }),
    db.badge.findMany({
      take: INFINITE_SCROLL_PAGINATION_RESULTS,
      skip: (Number(page) - 1) * INFINITE_SCROLL_PAGINATION_RESULTS,
    }),
    db.badge.count(),
  ]);
  if (!user) return notFound();

  return (
    <section className="h-fit space-y-10 p-2 rounded-md dark:bg-zinc-900/60">
      <h1 className="text-xl font-semibold">Quản lý Huy hiệu</h1>

      <Link
        href="/badge/create"
        className={buttonVariants({ className: 'w-full' })}
      >
        Tạo
      </Link>

      <div className="space-y-2">
        <h2 className="text-lg font-medium">Tìm kiếm Huy hiệu</h2>

        <form
          action={async (formData) => {
            'use server';

            const id = formData.get('id');
            if (!id) return;

            const badge = await db.badge.findUnique({
              where: {
                id: +id,
              },
              select: {
                id: true,
              },
            });
            if (!badge) return notFound();

            return redirect(`/badge/${badge.id}`);
          }}
          className="flex items-center gap-2"
        >
          <Input name="id" autoComplete="off" placeholder="Badge ID" />
          <Button type="submit">
            <Search className="w-5 h-5" />
          </Button>
        </form>
      </div>

      {!!badges.length && (
        <Table>
          <TableCaption>Danh sách Huy hiệu</TableCaption>

          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Icon</TableHead>
              <TableHead>Tên</TableHead>
              <TableHead>Màu</TableHead>
              <TableHead>Mô tả</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {badges.map((badge) => (
              <TableRow key={badge.id}>
                <TableCell>
                  <Link href={`/badge/${badge.id}`}>{badge.id}</Link>
                </TableCell>
                <TableCell>
                  <Link
                    href={`/badge/${badge.id}`}
                    className="block relative w-10 h-10 aspect-square"
                  >
                    <Image
                      fill
                      sizes="(max-width: 640px) 15vw, 20vw"
                      quality={40}
                      src={badge.image}
                      alt={`${badge.name} Icon`}
                    />
                  </Link>
                </TableCell>
                <TableCell>
                  <Link href={`/badge/${badge.id}`}>{badge.name}</Link>
                </TableCell>
                <TableCell>
                  <Link href={`/badge/${badge.id}`}>
                    {JSON.stringify(badge.color)}
                  </Link>
                </TableCell>
                <TableCell>
                  <Link href={`/badge/${badge.id}`}>{badge.description}</Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <PaginationControll total={total} route="/badge?" />
    </section>
  );
};

export default page;
