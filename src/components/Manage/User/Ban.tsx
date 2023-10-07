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
import { useCustomToast } from '@/hooks/use-custom-toast';
import { toast } from '@/hooks/use-toast';
import type { User } from '@prisma/client';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import { FC, useRef } from 'react';

interface BanProps {
  user: Pick<User, 'id'>;
  type: 'BAN' | 'UNBAN';
}

const Ban: FC<BanProps> = ({ user, type }) => {
  const router = useRouter();
  const { loginToast, notFoundToast, serverErrorToast, successToast } =
    useCustomToast();
  const actionRef = useRef<HTMLButtonElement>(null);

  const { mutate: Ban, isLoading: isBanning } = useMutation({
    mutationKey: ['ban-user', user.id],
    mutationFn: async () => {
      await axios.post('/api/user/ban', { id: user.id, type });
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) return loginToast();
        if (err.response?.status === 404) return notFoundToast();
        if (err.response?.status === 406)
          return toast({
            title: 'Không thể thực hiện',
            description: `User đã ${
              type === 'BAN' ? 'bị ban' : 'gỡ ban'
            } trước đó rồi`,
            variant: 'destructive',
          });
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
    <AlertDialog>
      <AlertDialogTrigger
        disabled={isBanning}
        className={buttonVariants({ variant: 'destructive' })}
      >
        {type === 'BAN' ? 'Ban' : 'Unban'}
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Bạn đã chắc chắn muốn Ban user này?
          </AlertDialogTitle>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={isBanning}
            className={buttonVariants({ variant: 'destructive' })}
          >
            Hủy
          </AlertDialogCancel>
          <Button
            isLoading={isBanning}
            disabled={isBanning}
            onClick={() => Ban()}
          >
            Chắc chắn
          </Button>

          <AlertDialogAction ref={actionRef} className="hidden" />
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default Ban;
