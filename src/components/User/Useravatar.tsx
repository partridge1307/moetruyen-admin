import type { User } from '@prisma/client';
import type { AvatarProps } from '@radix-ui/react-avatar';
import { FC } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/Avatar';
import Image from 'next/image';
import { User2 } from 'lucide-react';

interface UserAvatarProps extends AvatarProps {
  user?: Pick<User, 'name' | 'image'>;
}

const UserAvatar: FC<UserAvatarProps> = ({ user, ...props }) => {
  return (
    <Avatar {...props}>
      {user?.image ? (
        <div className="relative aspect-square">
          <Image
            fill
            sizes="(max-width: 640px) 20vw, 30vw"
            quality={40}
            src={user.image}
            alt={`${user.name} Avatar`}
          />
        </div>
      ) : (
        <AvatarFallback>
          <User2 className="w-7 h-7" />
        </AvatarFallback>
      )}
    </Avatar>
  );
};

export default UserAvatar;
