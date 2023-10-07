import type { Session, User } from 'next-auth';
import type { JWT } from 'next-auth/jwt';

type UserId = string;

declare module 'next-auth/jwt' {
  interface JWT {
    id: UserId;
    name: string | null;
    banner: string | null;
    color:
      | {
          from: string;
          to: string;
        }
      | { color: string }
      | null;
  }
}

declare module 'next-auth' {
  interface Session {
    user: User & {
      id: UserId;
      name: string | null;
    };
  }
  interface User {
    name: string | null;
    image: string | null;
    banner: string | null;
    color:
      | {
          from: string;
          to: string;
        }
      | { color: string }
      | null;
    muteExpires: Date | null;
    isBanned: boolean;
  }
}
