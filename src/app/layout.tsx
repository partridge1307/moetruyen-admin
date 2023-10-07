import Providers from '@/components/Providers';
import { Toaster } from '@/components/ui/Toaster';
import '@/styles/globals.css';
import type { Metadata } from 'next';
import { Roboto } from 'next/font/google';

export const metadata: Metadata = {
  metadataBase: new URL(`${process.env.NEXTAUTH_URL}`),
  title: {
    default: 'Moetruyen Admin',
    template: '%s | Moetruyen Admin',
  },
  description: 'Quản lý Moetruyen',
  colorScheme: 'dark light',
  themeColor: 'dark light',
  referrer: 'origin-when-cross-origin',
  generator: 'Moetruyen Admin',
  authors: [{ name: 'Moetruyen' }],
  keywords: ['Manga', 'Truyện tranh', 'Admin', 'Moetruyen'],
  openGraph: {
    title: 'Moetruyen Admin',
    description: 'Quản lý Moetruyen',
    siteName: 'Moetruyen Admin',
    url: `${process.env.NEXTAUTH_URL}`,
    locale: 'vi',
    type: 'website',
  },
  twitter: {
    site: 'Moetruyen Admin',
    title: 'Moetruyen Admin',
    description: 'Quản lý Moetruyen',
  },
  robots: {
    notranslate: true,
    index: false,
    follow: false,
    nositelinkssearchbox: true,
    noimageindex: true,
    nosnippet: true,
    noarchive: true,
  },
};

const roboto = Roboto({
  subsets: ['vietnamese'],
  weight: '400',
  variable: '--font-roboto',
  preload: true,
  display: 'swap',
});

export default function RootLayout({
  children,
  list,
}: {
  children: React.ReactNode;
  list: React.ReactNode;
}) {
  return (
    <html lang="vi" className={`dark ${roboto.variable} font-sans`}>
      <body className="antialiased dark:bg-zinc-800 md:scrollbar md:scrollbar--dark">
        <Providers>
          <main className="container mx-auto max-sm:px-2 my-10 grid grid-cols-1 lg:grid-cols-[.4fr_1fr] gap-6">
            {list}
            {children}
          </main>
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
