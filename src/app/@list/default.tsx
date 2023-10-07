import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { Permission } from '@prisma/client';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

const manageList: {
  permission: Permission;
  title: string;
  href: string;
}[] = [
  {
    permission: 'MANAGE_USER',
    title: 'Quản lý người dùng',
    href: '/user',
  },
  {
    permission: 'MANAGE_USER',
    title: 'Quản lý Verify',
    href: '/user/verify',
  },
  {
    permission: 'MANAGE_MANGA',
    title: 'Quản lý manga',
    href: '/manga',
  },
  {
    permission: 'MANAGE_CHAPTER',
    title: 'Quản lý chapter',
    href: '/chapter',
  },
  {
    permission: 'MANAGE_FORUM',
    title: 'Quản lý forum',
    href: '/forum',
  },
  {
    permission: 'MANAGE_BADGE',
    title: 'Quản lý huy hiệu',
    href: '/badge',
  },
  {
    permission: 'MANAGE_TEAM',
    title: 'Quản lý team',
    href: '/team',
  },
  {
    permission: 'ADMINISTRATOR',
    title: 'Tạo thông báo',
    href: '/notify',
  },
  {
    permission: 'ADMINISTRATOR',
    title: 'Log',
    href: '/log',
  },
];

const Default = async () => {
  const session = await getAuthSession();
  if (!session) return redirect(`${process.env.MAIN_URL}`);

  const user = await db.user.findUnique({
    where: {
      id: session.user.id,
      permissions: {
        hasSome: Object.keys(Permission) as Array<keyof typeof Permission>,
      },
      twoFactorEnabled: true,
    },
    select: {
      permissions: true,
    },
  });
  if (!user) return redirect(`${process.env.MAIN_URL}`);

  return (
    <section className="h-fit space-y-6 p-2 rounded-md dark:bg-zinc-900/60">
      <Link href="/" className="block text-2xl font-semibold text-center">
        Quản lý
      </Link>

      <div className="text-center space-y-3">
        {manageList.map((manage, idx) => {
          if (
            user.permissions.some(
              (per) => per === manage.permission || per === 'ADMINISTRATOR'
            )
          )
            return (
              <Link
                key={idx}
                href={manage.href}
                className={cn(buttonVariants({ variant: 'ghost' }), 'w-full')}
              >
                {manage.title}
              </Link>
            );
        })}
      </div>
    </section>
  );
};

export default Default;
