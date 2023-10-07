import { getPlaiceholder } from 'plaiceholder';
import { rgbDataURL } from './utils';

export async function getBase64(url: string) {
  try {
    const res = await fetch(url, {
      cache: 'force-cache',
    });
    if (!res.ok)
      throw new Error(
        `Failed to fetch image: ${res.status}: ${res.statusText}`
      );
    const buffer = await res.arrayBuffer();
    const { base64 } = await getPlaiceholder(Buffer.from(buffer), {
      brightness: 0.4,
      format: ['webp'],
    });

    return base64;
  } catch (error) {
    // eslint-disable-next-line no-console
    if (error instanceof Error) console.log(error.stack);

    return rgbDataURL(249, 115, 22);
  }
}

export async function getImagesBase64(urls: string[]) {
  const base64Results = await Promise.all(urls.map((url) => getBase64(url)));

  return base64Results;
}
