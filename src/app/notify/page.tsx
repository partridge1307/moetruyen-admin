import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { notFound, redirect } from 'next/navigation';

const page = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) => {
  const status = searchParams['status'];
  const session = await getAuthSession();
  if (!session) return redirect(`${process.env.MAIN_URL}`);

  const me = await db.user.findUnique({
    where: {
      id: session.user.id,
      permissions: {
        hasSome: ['ADMINISTRATOR'],
      },
      twoFactorEnabled: true,
    },
    select: {
      id: true,
      name: true,
    },
  });
  if (!me) return notFound();

  const formAction = async (formData: FormData) => {
    'use server';

    const content = formData.get('content');
    const endpoint = formData.get('endpoint');

    if (!content || !endpoint) return notFound();

    const check = formData.get('check');

    try {
      if (check === 'on') {
        const userID = formData.get('userID');
        if (!userID) return notFound();

        const user = await db.user.findUnique({
          where: {
            id: `${userID}`,
          },
          select: {
            id: true,
            name: true,
          },
        });
        if (!user) return notFound();

        await db.$transaction([
          db.notify.create({
            data: {
              type: 'SYSTEM',
              toUserId: user.id,
              content: `${content}`,
              endPoint: `${endpoint}`,
            },
          }),
          db.log.create({
            data: {
              content: `đã tạo Notify tới ${user.name} (${user.id})`,
            },
          }),
        ]);
      } else {
        const users = await db.user.findMany({
          select: {
            id: true,
          },
        });

        await db.$transaction([
          db.notify.createMany({
            data: users.map((usr) => ({
              type: 'SYSTEM',
              content: `${content}`,
              endPoint: `${endpoint}`,
              toUserId: usr.id,
            })),
            skipDuplicates: true,
          }),
          db.log.create({
            data: {
              content: `đã tạo Notify tới tất cả mọi người`,
            },
          }),
        ]);
      }
    } catch (error) {
      return redirect('/notify?status=error');
    }

    return redirect('/notify?status=success');
  };

  return (
    <section className="h-fit p-2 space-y-10 rounded-md dark:bg-zinc-900/60">
      <h1 className="text-xl font-semibold">Quản lý Verify</h1>

      <form action={formAction} className="space-y-6">
        <div className="space-y-1">
          <Label htmlFor="content">Nội dung</Label>
          <Input
            autoComplete="off"
            id="content"
            name="content"
            placeholder="Nội dung"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="endpoint">Đường dẫn</Label>
          <Input
            autoComplete="off"
            id="endpoint"
            name="endpoint"
            placeholder="Đường dẫn"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="check">User cụ thể (Nếu muốn)</Label>

          <div className="flex items-center justify-start gap-2">
            <Input
              id="check"
              type="checkbox"
              name="check"
              className="w-4 h-4"
            />
            <span>Có</span>
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="userID">ID User (Nếu muốn)</Label>
          <Input
            autoComplete="off"
            id="userID"
            name="userID"
            placeholder="User ID"
          />
        </div>

        <Button type="submit">Tạo</Button>
      </form>
    </section>
  );
};

export default page;
