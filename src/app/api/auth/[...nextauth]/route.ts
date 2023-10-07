import { AuthContext, authOptionsWrapper } from '@/lib/auth';
import NextAuth from 'next-auth/next';
import { NextRequest } from 'next/server';

async function handler(req: NextRequest, context: AuthContext) {
  return NextAuth(...authOptionsWrapper(req, context));
}

export { handler as GET, handler as POST };
