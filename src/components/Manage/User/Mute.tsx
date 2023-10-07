import { Button, buttonVariants } from '@/components/ui/Button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/Popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import { useCustomToast } from '@/hooks/use-custom-toast';
import { toast } from '@/hooks/use-toast';
import type { User } from '@prisma/client';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { addDays } from 'date-fns';
import { useRouter } from 'next/navigation';
import { FC, useState } from 'react';

interface MuteProps {
  user: Pick<User, 'id'>;
}

const Mute: FC<MuteProps> = ({ user }) => {
  const router = useRouter();
  const { loginToast, notFoundToast, serverErrorToast, successToast } =
    useCustomToast();
  const [date, setDate] = useState<Date>();

  const { mutate: Mute, isLoading: isMuting } = useMutation({
    mutationKey: ['mute-user', user.id],
    mutationFn: async () => {
      await axios.post('/api/user/mute', {
        id: user.id,
        muteTo: date?.toJSON(),
      });
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) return loginToast();
        if (err.response?.status === 404) return notFoundToast();
        if (err.response?.status === 406)
          return toast({
            title: 'User đang bị Mute',
            description: 'User đã bị mute trước đó',
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
    <Popover modal>
      <PopoverTrigger className={buttonVariants({ variant: 'destructive' })}>
        Mute
      </PopoverTrigger>

      <PopoverContent asChild>
        <div className="flex items-center gap-2">
          <Select
            onValueChange={(value) =>
              setDate(addDays(new Date(), parseInt(value)))
            }
          >
            <SelectTrigger className="focus:outline-none focus:ring-transparent ring-offset-transparent">
              <SelectValue placeholder="Thời hạn" />
            </SelectTrigger>

            <SelectContent position="popper" avoidCollisions>
              <SelectItem
                ref={(ref) => {
                  if (!ref) return;

                  ref.ontouchstart = (e) => e.preventDefault();
                }}
                value="1"
                className="hover:dark:bg-zinc-900 hover:cursor-pointer"
              >
                1 ngày
              </SelectItem>
              <SelectItem
                ref={(ref) => {
                  if (!ref) return;

                  ref.ontouchstart = (e) => e.preventDefault();
                }}
                value="3"
                className="hover:dark:bg-zinc-900 hover:cursor-pointer"
              >
                3 ngày
              </SelectItem>
              <SelectItem
                ref={(ref) => {
                  if (!ref) return;

                  ref.ontouchstart = (e) => e.preventDefault();
                }}
                value="7"
                className="hover:dark:bg-zinc-900 hover:cursor-pointer"
              >
                7 ngày
              </SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant={'destructive'}
            isLoading={isMuting}
            disabled={isMuting}
            onClick={() => Mute()}
          >
            Mute
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default Mute;
