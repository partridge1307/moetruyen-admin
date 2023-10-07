import UserAvatar from '@/components/User/Useravatar';
import UserBanner from '@/components/User/Userbanner';
import Username from '@/components/User/Username';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { notFound, redirect } from 'next/navigation';
import { FC } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { formatTimeToNow } from '@/lib/utils';

const Controll = dynamic(() => import('@/components/Manage/User/Controll'), {
  ssr: false,
});

interface pageProps {
  params: {
    userId: string;
  };
}

const page: FC<pageProps> = async ({ params }) => {
  const session = await getAuthSession();
  if (!session) return redirect(`${process.env.MAIN_URL}`);

  const [me, user, badges] = await db.$transaction([
    db.user.findUnique({
      where: {
        id: session?.user.id,
        permissions: {
          hasSome: ['ADMINISTRATOR', 'MANAGE_USER'],
        },
        twoFactorEnabled: true,
      },
      select: {
        permissions: true,
      },
    }),
    db.user.findUnique({
      where: {
        id: params.userId,
      },
      select: {
        id: true,
        image: true,
        banner: true,
        permissions: true,
        name: true,
        color: true,
        badge: true,
        twoFactorEnabled: true,
        muteExpires: true,
        isBanned: true,
      },
    }),
    db.badge.findMany(),
  ]);
  if (!me || !user) return notFound();
  if (
    !me.permissions.includes('ADMINISTRATOR') &&
    user.permissions.includes('ADMINISTRATOR')
  )
    return notFound();

  return (
    <section className="h-fit p-2 rounded-md dark:bg-zinc-900/60">
      <div className="relative">
        <UserBanner user={user} />
        <UserAvatar
          user={user}
          className="absolute bottom-0 translate-y-1/2 left-4 w-32 h-32 border-4 dark:border-zinc-900"
        />
      </div>
      <Username
        user={user}
        className="mt-24 text-start text-lg pl-4 font-semibold"
      />

      <div className="my-6 space-y-2">
        <h1 className="text-xl font-semibold">Permissions</h1>
        <ul className="text-sm flex flex-wrap items-center gap-4">
          {!!user.permissions.length &&
            user.permissions.map((per, idx) => (
              <li key={idx} className="p-2 rounded-md bg-background">
                {per}
              </li>
            ))}
        </ul>
      </div>

      <Controll me={me} user={user} badges={badges} />

      <div className="my-6 space-y-6">
        <div className="space-y-2">
          <h1 className="text-xl font-semibold">Badge</h1>
          <ul className="flex flex-wrap items-center gap-4">
            {!!user.badge.length &&
              user.badge.map((badge) => (
                <li
                  key={badge.id}
                  className="flex items-center gap-2 p-2 rounded-md dark:bg-zinc-800"
                  title={badge.description}
                >
                  <div className="relative w-10 h-10 aspect-square">
                    <Image
                      fill
                      sizes="(max-width: 640px) 10vw, 15vw"
                      quality={40}
                      src={badge.image}
                      alt={`${badge.name} Icon`}
                      className="object-cover"
                    />
                  </div>

                  <span>{badge.name}</span>
                </li>
              ))}
          </ul>
        </div>

        <dl className="flex flex-wrap items-center gap-1.5">
          <dt>2FA:</dt>
          <dd
            className={
              !user.twoFactorEnabled
                ? 'text-red-500 font-semibold'
                : 'text-green-500 font-semibold'
            }
          >
            {user.twoFactorEnabled ? 'Đã bật' : 'Chưa bật'}
          </dd>
        </dl>

        {!!user.muteExpires &&
          user.muteExpires.getTime() > new Date().getTime() && (
            <dl className="flex flex-wrap items-center gap-1.5">
              <dt>Mute:</dt>
              <dd>
                <time dateTime={user.muteExpires.toDateString()}>
                  {formatTimeToNow(new Date(user.muteExpires))}
                </time>
              </dd>
            </dl>
          )}

        {user.isBanned && (
          <p className="text-red-500 text-lg font-semibold">Đã bị Ban</p>
        )}
      </div>
    </section>
  );
};

export default page;
