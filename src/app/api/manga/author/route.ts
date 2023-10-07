import { db } from '@/lib/db';

export async function GET(req: Request) {
  const url = new URL(req.url);

  try {
    const query = url.searchParams.get('q');
    if (!query) return new Response('Invalid URL', { status: 422 });

    const authors = await db.mangaAuthor.findMany({
      where: {
        OR: query
          .split(' ')
          .map((q) => ({ name: { contains: q, mode: 'insensitive' } })),
      },
    });

    return new Response(JSON.stringify(authors));
  } catch (error) {
    return new Response('Something went wrong');
  }
}
