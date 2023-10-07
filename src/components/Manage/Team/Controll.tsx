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
import type { Team } from '@prisma/client';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FC, useRef, useState } from 'react';

interface ControllProps {
  team: Pick<Team, 'id'>;
}

const Controll: FC<ControllProps> = ({ team }) => {
  const { loginToast, notFoundToast, serverErrorToast, successToast } =
    useCustomToast();
  const router = useRouter();
  const actionRef = useRef<HTMLButtonElement>(null);
  const [userId, setUserId] = useState('');

  const { mutate: Delete, isLoading: isDeleting } = useMutation({
    mutationKey: ['delete-team', team.id],
    mutationFn: async () => {
      await axios.delete('/api/team', { data: { id: team.id } });
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) return loginToast();
        if (err.response?.status === 404) return notFoundToast();
      }

      return serverErrorToast();
    },
    onSuccess: () => {
      router.push('/team');
      router.refresh();

      return successToast();
    },
  });

  const { mutate: Change, isLoading: isChanging } = useMutation({
    mutationKey: ['change-owner', team.id],
    mutationFn: async () => {
      await axios.post(`/api/team/${team.id}`, { userId });
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
      <AlertDialog>
        <AlertDialogTrigger
          disabled={isDeleting}
          className={buttonVariants({ variant: 'destructive' })}
        >
          Xóa
        </AlertDialogTrigger>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Bạn có chắc chắn muốn xóa Team này
            </AlertDialogTitle>
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

      <AlertDialog>
        <AlertDialogTrigger disabled={isChanging} className={buttonVariants()}>
          Chuyển User
        </AlertDialogTrigger>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Chuyển người dùng</AlertDialogTitle>
          </AlertDialogHeader>

          <Input
            placeholder="User ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />

          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isChanging}
              className={buttonVariants({ variant: 'destructive' })}
            >
              Hủy
            </AlertDialogCancel>
            <Button
              onClick={() => Change()}
              disabled={isChanging}
              isLoading={isChanging}
            >
              Chuyển
            </Button>
            <AlertDialogAction ref={actionRef} className="hidden" />
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Link href={`/team/${team.id}/edit`} className={buttonVariants()}>
        Sửa
      </Link>
    </div>
  );
};

export default Controll;
