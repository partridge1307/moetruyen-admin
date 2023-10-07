import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { notFound, redirect } from 'next/navigation';
import dynamic from 'next/dynamic';

const BadgeCreateForm = dynamic(
  () => import('@/components/Manage/Badge/Create'),
  { ssr: false }
);

const page = async () => {
  const session = await getAuthSession();
  if (!session) return redirect(`${process.env.MAIN_URL}`);

  const user = await db.user.findUnique({
    where: {
      id: session.user.id,
      permissions: {
        hasSome: ['ADMINISTRATOR', 'MANAGE_BADGE'],
      },
      twoFactorEnabled: true,
    },
  });
  if (!user) return notFound();

  return (
    <section className="h-fit space-y-10 p-2 rounded-md dark:bg-zinc-900/60">
      <h1 className="text-xl font-semibold">Tạo huy hiệu</h1>

      <BadgeCreateForm />
    </section>
  );
};

export default page;
