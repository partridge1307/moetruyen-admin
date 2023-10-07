'use client';

import { Button } from '@/components/ui/Button';
import { useCustomToast } from '@/hooks/use-custom-toast';
import { toast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { Check, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FC } from 'react';

interface ActionProps {
  id: string;
}

const VerifyAction: FC<ActionProps> = ({ id }) => {
  const { loginToast, notFoundToast, serverErrorToast, successToast } =
    useCustomToast();
  const router = useRouter();

  const { mutate: Toggle, isLoading: isToggling } = useMutation({
    mutationKey: ['verify-moderator', id],
    mutationFn: async (type: 'ACCEPT' | 'REJECT') => {
      await axios.patch('/api/user', { id, type });
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) return loginToast();
        if (err.response?.status === 404) return notFoundToast();
        if (err.response?.status === 406)
          return toast({
            title: 'Đã Verify',
            description: 'User đã được Verify trước đó',
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

  return (
    <div className="flex flex-wrap gap-4">
      <Button
        size={'sm'}
        isLoading={isToggling}
        disabled={isToggling}
        className="p-2 rounded-full"
        onClick={() => Toggle('ACCEPT')}
      >
        <Check />
      </Button>

      <Button
        size={'sm'}
        variant={'destructive'}
        isLoading={isToggling}
        disabled={isToggling}
        className="p-2 rounded-full"
        onClick={() => Toggle('REJECT')}
      >
        <X />
      </Button>
    </div>
  );
};

export default VerifyAction;
