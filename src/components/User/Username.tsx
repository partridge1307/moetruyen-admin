import { cn } from '@/lib/utils';
import type { User } from '@prisma/client';
import { FC, HTMLAttributes } from 'react';

interface UsernameProps extends HTMLAttributes<HTMLParagraphElement> {
  user: Pick<User, 'color' | 'name'>;
  className?: string;
}

const Username: FC<UsernameProps> = ({ user, className }) => {
  return (
    <p
      className={cn(
        'text-center font-medium bg-clip-text animate-rainbow',
        !!!user.color ? 'text-black dark:text-white' : 'text-transparent',
        className
      )}
      style={{
        backgroundImage:
          !!user.color && // @ts-ignore
          !!user.color.from && // @ts-ignore
          !!user.color.to
            ? // @ts-ignore
              `linear-gradient(to right, ${user.color.from}, ${user.color.to})`
            : undefined,
        backgroundColor:
          !!user.color && // @ts-ignore
          !!user.color.color
            ? // @ts-ignore
              user.color.color
            : undefined,
      }}
    >
      {user.name}
    </p>
  );
};

export default Username;
