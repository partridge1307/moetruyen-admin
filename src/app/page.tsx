import UserAvatar from '@/components/User/Useravatar';
import UserBanner from '@/components/User/Userbanner';
import Username from '@/components/User/Username';
import { db } from '@/lib/db';
import { Permission } from '@prisma/client';

const page = async () => {
  const users = await db.user.findMany({
    where: {
      permissions: {
        hasSome: Object.keys(Permission) as Array<keyof typeof Permission>,
      },
      twoFactorEnabled: true,
    },
    select: {
      id: true,
      name: true,
      image: true,
      banner: true,
      color: true,
      permissions: true,
    },
  });

  return (
    <section className="p-2 space-y-6 rounded-md dark:bg-zinc-900/60">
      <h1 className="text-xl font-semibold">Quản lý Moetruyen</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {users.map((user) => (
          <a
            key={user.id}
            target="_blank"
            href={`${process.env.MAIN_URL}/user/${user.name
              ?.split(' ')
              .join('-')}`}
            className="p-2 rounded-md dark:bg-zinc-900"
          >
            <div className="relative">
              <UserBanner user={user} />
              <UserAvatar
                user={user}
                className="absolute left-4 bottom-0 translate-y-1/2 w-20 h-20 border-4 dark:border-zinc-900"
              />
            </div>

            <Username
              user={user}
              className="text-start mt-14 pl-4 font-medium"
            />

            <ul className="pl-4 mt-4 mb-2 flex flex-wrap items-center gap-2">
              {user.permissions.map((per, idx) => (
                <li key={idx} className="text-xs">
                  {per}
                </li>
              ))}
            </ul>
          </a>
        ))}
      </div>
    </section>
  );
};

export default page;
