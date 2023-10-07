import { PrismaAdapter } from '@auth/prisma-adapter';
import { randomUUID } from 'crypto';
import { getServerSession, type AuthOptions } from 'next-auth';
import { decode, encode } from 'next-auth/jwt';
import { cookies, headers } from 'next/headers';
import { NextRequest } from 'next/server';
import { db } from './db';
import { generateRandomName } from './uniqueName';

export interface AuthContext {
  params: { nextauth: string[] };
}

const HOST_URL = new URL(process.env.NEXTAUTH_URL!);
const useSecureCookies = HOST_URL.protocol.startsWith('https');

export const authOptionsWrapper = (
  request: NextRequest,
  context: AuthContext
) => {
  const { params } = context;

  const isCredentialsCallback =
    params?.nextauth?.includes('callback') &&
    params.nextauth.includes('credentials') &&
    request.method === 'POST';

  return [
    request,
    context,
    {
      adapter: PrismaAdapter(db),
      pages: {
        signIn: `/sign-in`,
        error: `/auth-error`,
        verifyRequest: `/verify-request`,
      },
      session: { strategy: 'database' },
      secret: process.env.NEXTAUTH_SECRET,
      providers: [],
      cookies: {
        sessionToken: {
          name: `${useSecureCookies ? `__Secure-` : ''}next-auth.session-token`,
          options: {
            httpOnly: true,
            sameSite: 'lax',
            path: '/',
            domain:
              HOST_URL.hostname === 'localhost'
                ? HOST_URL.hostname
                : `.${new URL(process.env.MAIN_URL!).host}`,
            secure: useSecureCookies,
          },
        },
      },
      callbacks: {
        async signIn({ user, account }) {
          if (user) {
            if (isCredentialsCallback) {
              const sessionToken = randomUUID();
              const sessionExpiry = new Date(
                Date.now() + 15 * 24 * 60 * 60 * 1000
              );

              await db.session.create({
                data: {
                  sessionToken,
                  userId: user.id,
                  expires: sessionExpiry,
                },
              });

              cookies().set(
                `${useSecureCookies ? '__Secure-' : ''}next-auth.session-token`,
                sessionToken,
                {
                  expires: sessionExpiry,
                  httpOnly: true,
                  sameSite: 'lax',
                  domain:
                    HOST_URL.hostname === 'localhost'
                      ? HOST_URL.hostname
                      : `.${new URL(process.env.MAIN_URL!).host}`,
                  secure: useSecureCookies,
                }
              );

              return true;
            } else {
              if (account?.provider === 'email') {
                const userExist = await db.user.findUnique({
                  where: {
                    id: user.id,
                  },
                });

                if (userExist) return true;
              } else if (account?.provider === 'discord') {
                const existAccount = await db.user.findUnique({
                  where: {
                    id: user.id,
                    account: {
                      some: {
                        provider: 'discord',
                      },
                    },
                  },
                  select: {
                    id: true,
                  },
                });
                if (existAccount) {
                  await db.account.deleteMany({
                    where: {
                      userId: existAccount.id,
                    },
                  });
                }

                return true;
              }

              return false;
            }
          } else return false;
        },
        session: async ({ session, user: dbUser }) => {
          const { expires } = session;

          if (dbUser.isBanned) {
            return null;
          } else if (
            dbUser.muteExpires &&
            new Date(dbUser.muteExpires).getTime() >= Date.now()
          ) {
            return null;
          }

          if (!dbUser.name) {
            const updatedUser = await db.user.update({
              where: {
                id: dbUser.id,
              },
              data: {
                name: generateRandomName,
              },
            });

            return {
              user: {
                id: updatedUser.id,
                name: updatedUser.name,
                image: updatedUser.image,
                banner: updatedUser.banner,
                color: updatedUser.color,
              },
              expires,
            };
          }

          return {
            user: {
              id: dbUser.id,
              name: dbUser.name,
              image: dbUser.image,
              banner: dbUser.banner,
              color: dbUser.color,
            },
            expires,
          };
        },
      },
      jwt: {
        maxAge: 15 * 24 * 60 * 60,
        encode: async (arg) => {
          if (isCredentialsCallback) {
            const cookie = cookies().get(
              `${useSecureCookies ? '__Secure-' : ''}next-auth.session-token`
            );

            if (cookie) return cookie.value;
            return '';
          }

          return encode(arg);
        },
        decode: async (arg) => {
          if (isCredentialsCallback) {
            return null;
          }
          return decode(arg);
        },
      },
      events: {
        signOut: async ({ session }) => {
          const { sessionToken = '' } = session as unknown as {
            sessionToken?: string;
          };

          if (sessionToken) {
            await db.session.deleteMany({
              where: {
                sessionToken,
              },
            });
          }
        },
      },
    } as AuthOptions,
  ] as const;
};

export const getAuthSession = () =>
  getServerSession(
    authOptionsWrapper(
      // @ts-ignore
      { cookies: cookies(), headers: headers() },
      { params: { nextauth: ['session'] } }
    )[2]
  );

// export const getAuthSession = () =>
//   getSession({ req: { headers: Object.fromEntries(headers().entries()) } });
