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
import { buttonVariants } from '@/components/ui/Button';
import { useCustomToast } from '@/hooks/use-custom-toast';
import type { Badge } from '@prisma/client';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FC } from 'react';

interface ControllProps {
  badge: Pick<Badge, 'id'>;
}

const Controll: FC<ControllProps> = ({ badge }) => {
  const { loginToast, notFoundToast, serverErrorToast, successToast } =
    useCustomToast();
  const router = useRouter();

  const { mutate: Delete, isLoading: isDeleting } = useMutation({
    mutationKey: ['delete-badge', badge.id],
    mutationFn: async () => {
      await axios.delete(`/api/badge`, { data: { id: badge.id } });
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) return loginToast();
        if (err.response?.status === 404) return notFoundToast();
      }

      return serverErrorToast();
    },
    onSuccess: () => {
      router.push('/badge');
      router.refresh();

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
            <AlertDialogTitle>Bạn có chắc chắn muốn xóa</AlertDialogTitle>
            <AlertDialogDescription>Không thể hoàn tác</AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel
              className={buttonVariants({ variant: 'destructive' })}
            >
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              onClick={() => Delete()}
              className={buttonVariants()}
            >
              Chắc chắn
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Link href={`/badge/${badge.id}/edit`} className={buttonVariants()}>
        Chỉnh sửa
      </Link>
    </div>
  );
};

export default Controll;
