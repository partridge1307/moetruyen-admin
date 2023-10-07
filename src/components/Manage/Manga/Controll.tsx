'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/AlertDialog';
import { Button, buttonVariants } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useCustomToast } from '@/hooks/use-custom-toast';
import { toast } from '@/hooks/use-toast';
import type { Manga, User } from '@prisma/client';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FC, useRef, useState } from 'react';

interface MangaControllProps {
  manga: Pick<Manga, 'id' | 'slug' | 'isPublished' | 'canPin'>;
  user: Pick<User, 'permissions'>;
}

const MangaControll: FC<MangaControllProps> = ({ manga, user }) => {
  const router = useRouter();
  const { loginToast, notFoundToast, serverErrorToast, successToast } =
    useCustomToast();
  const [userId, setUserId] = useState('');
  const actionRef = useRef<HTMLButtonElement>(null);

  const { mutate: Delete, isLoading: isDeleting } = useMutation({
    mutationKey: ['delete-manga', manga.id],
    mutationFn: async () => {
      await axios.delete(`/api/manga`, { data: { id: manga.id } });
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) return loginToast();
        if (err.response?.status === 404) return notFoundToast();
      }

      return serverErrorToast();
    },
    onSuccess: () => {
      router.push(`/manga`);
      router.refresh();

      return successToast();
    },
  });

  const { mutate: Hide, isLoading: isHiding } = useMutation({
    mutationKey: ['hide-manga', manga.id],
    mutationFn: async () => {
      axios.patch(`/api/manga`, { id: manga.id });
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) return loginToast();
        if (err.response?.status === 404) return notFoundToast();
      }

      return serverErrorToast();
    },
    onSuccess: () => {
      router.refresh();

      return successToast();
    },
  });

  const { mutate: Toggle, isLoading: isToggling } = useMutation({
    mutationKey: ['toggle-pin', manga.id],
    mutationFn: async () => {
      await axios.post('/api/manga', { id: manga.id });
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) return loginToast();
        if (err.response?.status === 404) return notFoundToast();
        if (err.response?.status === 406)
          return toast({
            title: 'Không thể thực hiện',
            description: 'Yêu cầu Manga đã publish',
            variant: 'destructive',
          });
      }

      return serverErrorToast();
    },
    onSuccess: () => {
      router.refresh();

      return successToast();
    },
  });

  const { mutate: Change, isLoading: isChanging } = useMutation({
    mutationKey: ['change-user', manga.id],
    mutationFn: async () => {
      await axios.put(`/api/manga/${manga.id}`, { userId });
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) return loginToast();
        if (err.response?.status === 404) return notFoundToast();
      }

      return serverErrorToast();
    },
    onSuccess: () => {
      router.refresh();
      actionRef.current?.click();

      return successToast();
    },
  });

  return (
    <div className="flex flex-wrap items-center gap-4">
      {user.permissions.includes(
        'ADMINISTRATOR' || ('MANAGE_CHAPTER' && 'MANAGE_MANGA')
      ) && (
        <AlertDialog>
          <AlertDialogTrigger
            disabled={isDeleting || isChanging}
            className={buttonVariants({ variant: 'destructive' })}
          >
            Xoá
          </AlertDialogTrigger>

          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Bạn có chắc chắn muốn xóa truyện này?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Không thể hoàn tác
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel
                className={buttonVariants({ variant: 'destructive' })}
              >
                Hủy
              </AlertDialogCancel>

              <AlertDialogAction disabled={isDeleting} onClick={() => Delete()}>
                Chắc chắn
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {manga.isPublished && (
        <Button
          variant={'destructive'}
          onClick={() => Hide()}
          isLoading={isHiding}
          disabled={isHiding || isDeleting}
        >
          Ẩn
        </Button>
      )}

      {manga.canPin ? (
        <Button
          variant={'destructive'}
          isLoading={isToggling}
          disabled={isToggling || isDeleting}
          onClick={() => Toggle()}
        >
          Gỡ Ghim
        </Button>
      ) : (
        <Button
          isLoading={isToggling}
          disabled={isToggling || isDeleting}
          onClick={() => Toggle()}
        >
          Cấp Ghim
        </Button>
      )}

      <Link href={`/manga/${manga.slug}/edit`} className={buttonVariants()}>
        Sửa
      </Link>

      {user.permissions.includes(
        'ADMINISTRATOR' || ('MANAGE_USER' && 'MANAGE_MANGA')
      ) && (
        <AlertDialog>
          <AlertDialogTrigger
            disabled={isDeleting || isChanging}
            className={buttonVariants()}
          >
            Chuyển User
          </AlertDialogTrigger>

          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Chuyển người đăng</AlertDialogTitle>
            </AlertDialogHeader>

            <Input
              placeholder="ID người dùng"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            />

            <AlertDialogFooter>
              <AlertDialogCancel
                className={buttonVariants({ variant: 'destructive' })}
              >
                Hủy
              </AlertDialogCancel>
              <Button
                disabled={isDeleting || isChanging}
                isLoading={isChanging}
                onClick={() => Change()}
              >
                Chuyển
              </Button>
              <AlertDialogAction ref={actionRef} className="hidden" />
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};

export default MangaControll;
