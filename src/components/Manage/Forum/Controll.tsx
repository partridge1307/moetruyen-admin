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
import type { SubForum, User } from '@prisma/client';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FC, useRef, useState } from 'react';

interface ControllProps {
  forum: Pick<SubForum, 'id' | 'slug'>;
  user: Pick<User, 'permissions'>;
}

const Controll: FC<ControllProps> = ({ forum, user }) => {
  const { loginToast, notFoundToast, serverErrorToast, successToast } =
    useCustomToast();
  const router = useRouter();
  const [userId, setUserId] = useState('');
  const actionRef = useRef<HTMLButtonElement>(null);

  const { mutate: Change, isLoading: isChanging } = useMutation({
    mutationKey: ['change-owner', forum.id],
    mutationFn: async () => {
      await axios.post(`/api/forum/${forum.id}`, { userId });
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

  const { mutate: Delete, isLoading: isDeleting } = useMutation({
    mutationKey: ['delete-forum', forum.id],
    mutationFn: async () => {
      await axios.delete('/api/forum', { data: { id: forum.id } });
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) return loginToast();
        if (err.response?.status === 404) return notFoundToast();
      }

      return serverErrorToast();
    },
    onSuccess: () => {
      router.push('/forum');
      router.refresh();

      return successToast();
    },
  });

  return (
    <div className="flex flex-wrap items-center gap-4">
      <AlertDialog>
        <AlertDialogTrigger
          disabled={isDeleting || isChanging}
          className={buttonVariants({ variant: 'destructive' })}
        >
          Xóa
        </AlertDialogTrigger>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn xóa</AlertDialogTitle>
            <AlertDialogDescription>Không thể hoàn tác</AlertDialogDescription>
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

      {user.permissions.includes(
        'ADMINISTRATOR' || ('MANAGE_USER' && 'MANAGE_FORUM')
      ) && (
        <AlertDialog>
          <AlertDialogTrigger
            disabled={isChanging || isDeleting}
            className={buttonVariants()}
          >
            Chuyển User
          </AlertDialogTrigger>

          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Chuyển Owner</AlertDialogTitle>
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
                onClick={() => Change()}
                disabled={isChanging || isDeleting}
                isLoading={isChanging}
              >
                Chuyển
              </Button>
              <AlertDialogAction ref={actionRef} className="hidden" />
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      <Link href={`/forum/${forum.slug}/edit`} className={buttonVariants()}>
        Sửa
      </Link>
    </div>
  );
};

export default Controll;
