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
import { useCustomToast } from '@/hooks/use-custom-toast';
import type { Chapter } from '@prisma/client';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FC } from 'react';

interface ControllProps {
  chapter: Pick<Chapter, 'id' | 'isPublished'>;
}

const Controll: FC<ControllProps> = ({ chapter }) => {
  const { loginToast, notFoundToast, serverErrorToast, successToast } =
    useCustomToast();
  const router = useRouter();

  const { mutate: Hide, isLoading: isHiding } = useMutation({
    mutationKey: ['hide-chapter', chapter.id],
    mutationFn: async () => {
      await axios.patch('/api/chapter', { id: chapter.id });
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

  const { mutate: Delete, isLoading: isDeleting } = useMutation({
    mutationKey: ['delete-chapter', chapter.id],
    mutationFn: async () => {
      await axios.delete('/api/chapter', { data: { id: chapter.id } });
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) return loginToast();
        if (err.response?.status === 404) return notFoundToast();
      }

      return serverErrorToast();
    },
    onSuccess: () => {
      router.push('/chapter');
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
            <AlertDialogTitle>
              Bạn có chắc chắn xóa Chapter này
            </AlertDialogTitle>
            <AlertDialogDescription>Không thể khôi phục</AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel
              className={buttonVariants({ variant: 'destructive' })}
            >
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              className={buttonVariants()}
              onClick={() => Delete()}
            >
              Chắc chắn
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {chapter.isPublished && (
        <Button
          disabled={isHiding}
          isLoading={isHiding}
          variant={'destructive'}
          onClick={() => Hide()}
        >
          Ẩn
        </Button>
      )}
      <Link href={`/chapter/${chapter.id}/edit`} className={buttonVariants()}>
        Sửa
      </Link>
    </div>
  );
};

export default Controll;
