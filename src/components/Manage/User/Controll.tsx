'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/AlertDialog';
import { Button, buttonVariants } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { useCustomToast } from '@/hooks/use-custom-toast';
import { cn } from '@/lib/utils';
import type { Badge, User } from '@prisma/client';
import { Permission } from '@prisma/client';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FC, useRef, useState } from 'react';
import Ban from './Ban';
import Mute from './Mute';

interface ControllProps {
  me: Pick<User, 'permissions'>;
  user: Pick<User, 'id' | 'permissions' | 'twoFactorEnabled' | 'isBanned'> & {
    badge: Pick<Badge, 'id'>[];
  };
  badges: Badge[];
}

const Controll: FC<ControllProps> = ({ me, user, badges }) => {
  const { loginToast, notFoundToast, serverErrorToast, successToast } =
    useCustomToast();
  const router = useRouter();
  const perActionRef = useRef<HTMLButtonElement>(null);
  const [permissionsChoosed, setPermission] = useState<
    Array<keyof typeof Permission>
  >(user.permissions);
  const badgeActionRef = useRef<HTMLButtonElement>(null);
  const [badgesChoosed, setBadge] = useState<number[]>(
    user.badge.map((badge) => badge.id)
  );

  const { mutate: ChangePermission, isLoading: isChangingPermission } =
    useMutation({
      mutationKey: ['change-permission', user.id],
      mutationFn: async () => {
        const { data } = await axios.post('/api/user', {
          id: user.id,
          permission: permissionsChoosed,
        });

        return data as Array<keyof typeof Permission>;
      },
      onError: (err) => {
        if (err instanceof AxiosError) {
          if (err.response?.status === 401) return loginToast();
          if (err.response?.status === 404) return notFoundToast();
        }

        return serverErrorToast();
      },
      onSuccess: (data) => {
        router.refresh();
        setPermission(data);
        perActionRef.current?.click();

        return successToast();
      },
    });

  const { mutate: ChangeBadge, isLoading: isChangingBadge } = useMutation({
    mutationKey: ['change-badge', user.id],
    mutationFn: async () => {
      const { data } = await axios.put('/api/user', {
        id: user.id,
        badge: badgesChoosed,
      });

      return data as number[];
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) return loginToast();
        if (err.response?.status === 404) return notFoundToast();
      }

      return serverErrorToast();
    },
    onSuccess: (data) => {
      router.refresh();
      setBadge(data);
      badgeActionRef.current?.click();

      return successToast();
    },
  });

  return (
    <div className="flex flex-wrap items-center gap-4">
      {me.permissions.includes('ADMINISTRATOR') && user.twoFactorEnabled && (
        <AlertDialog>
          <AlertDialogTrigger
            disabled={isChangingPermission}
            className={buttonVariants()}
          >
            Permission
          </AlertDialogTrigger>

          <AlertDialogContent className="dark:bg-zinc-900">
            <AlertDialogHeader>
              <AlertDialogTitle>Permission</AlertDialogTitle>
            </AlertDialogHeader>

            <ul className="space-y-2">
              {(Object.keys(Permission) as Array<keyof typeof Permission>).map(
                (per, idx) => (
                  <li
                    key={idx}
                    className="p-2 rounded-md bg-background flex items-center gap-2"
                  >
                    <p className="flex-1">{per}</p>{' '}
                    <Checkbox
                      className="w-6 h-6"
                      checked={permissionsChoosed.includes(per)}
                      onClick={() =>
                        setPermission((prev) => {
                          if (prev.includes(per))
                            return prev.filter((pre) => pre !== per);
                          else return [...prev, per];
                        })
                      }
                    />
                  </li>
                )
              )}
            </ul>

            <AlertDialogFooter>
              <AlertDialogCancel
                disabled={isChangingPermission}
                className={buttonVariants({ variant: 'destructive' })}
              >
                Hủy
              </AlertDialogCancel>
              <Button
                onClick={() => ChangePermission()}
                isLoading={isChangingPermission}
                disabled={isChangingPermission}
              >
                Xong
              </Button>
              <AlertDialogAction ref={perActionRef} className="hidden" />
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      <AlertDialog>
        <AlertDialogTrigger
          disabled={isChangingBadge}
          className={buttonVariants()}
        >
          Badge
        </AlertDialogTrigger>

        <AlertDialogContent className="dark:bg-zinc-900">
          <AlertDialogHeader>
            <AlertDialogTitle>Badge</AlertDialogTitle>
          </AlertDialogHeader>

          {!!badges.length && (
            <ul className="max-h-72 overflow-auto flex flex-wrap items-center gap-4">
              {badges.map((badge) => (
                <li
                  key={badge.id}
                  title={badge.description}
                  className={cn(
                    'flex items-center gap-2 p-2 rounded-md bg-background hover:cursor-pointer',
                    {
                      'bg-green-400 text-black': badgesChoosed.includes(
                        badge.id
                      ),
                    }
                  )}
                  onClick={() =>
                    setBadge((prev) => {
                      if (prev.includes(badge.id))
                        return prev.filter((pre) => pre !== badge.id);
                      else return [...prev, badge.id];
                    })
                  }
                >
                  <div className="relative aspect-square w-10 h-10">
                    <Image
                      fill
                      sizes="(max-width: 640px) 10vw 15vw"
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
          )}

          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isChangingBadge}
              className={buttonVariants({ variant: 'destructive' })}
            >
              Hủy
            </AlertDialogCancel>
            <Button
              onClick={() => ChangeBadge()}
              disabled={isChangingBadge}
              isLoading={isChangingBadge}
            >
              Xong
            </Button>
            <AlertDialogAction ref={badgeActionRef} className="hidden" />
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Mute user={user} />

      {me.permissions.includes('ADMINISTRATOR') && user.isBanned ? (
        <Ban user={user} type="UNBAN" />
      ) : (
        <Ban user={user} type="BAN" />
      )}
    </div>
  );
};

export default Controll;
