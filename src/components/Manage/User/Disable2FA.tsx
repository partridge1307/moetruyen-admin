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
import { User } from '@prisma/client';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import { FC, useRef } from 'react';

interface Disable2FAProps {
  user: Pick<User, 'id'>;
}

const Disable2FA: FC<Disable2FAProps> = ({ user }) => {
  const actionRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();
  const { loginToast, notFoundToast, serverErrorToast, successToast } =
    useCustomToast();

  const { mutate: Disable2FA, isLoading: isDisabling } = useMutation({
    mutationKey: ['disable-user-2fa', user.id],
    mutationFn: async () => {
      await axios.post('/api/user/two-factor', { id: user.id });
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) return loginToast();
        if (err.response?.status === 404) return notFoundToast();
        if (err.response?.status === 406)
          return toast({
            title: 'Không thể thực hiện',
            description: `User đã tắt 2FA trước đó`,
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
        disabled={isDisabling}
        className={buttonVariants({ variant: 'destructive' })}
      >
        Tắt 2FA
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Bạn đã chắc chắn muốn tắt 2FA User này?
          </AlertDialogTitle>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={isDisabling}
            className={buttonVariants({ variant: 'destructive' })}
          >
            Hủy
          </AlertDialogCancel>
          <Button
            isLoading={isDisabling}
            disabled={isDisabling}
            onClick={() => Disable2FA()}
          >
            Chắc chắn
          </Button>

          <AlertDialogAction ref={actionRef} className="hidden" />
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default Disable2FA;
