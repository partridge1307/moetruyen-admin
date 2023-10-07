import type sharp from 'sharp';
import { sleep } from '../utils';

const sendCommand = async <T>(
  func: () => Promise<T>,
  retry = 5
): Promise<T> => {
  try {
    return await func();
  } catch (error) {
    if (retry || retry > 0) {
      await sleep(1.5);

      return await sendCommand(func, retry - 1);
    } else throw error;
  }
};

const resizeImage = (
  image: sharp.Sharp,
  originalWidth?: number,
  originalHeight?: number
) => {
  let optimizedImage;
  if (originalWidth && originalHeight) {
    if (originalWidth < originalHeight) {
      originalWidth > 1100
        ? (optimizedImage = image.resize(1100))
        : (optimizedImage = image);
    } else {
      originalWidth > 1600
        ? (optimizedImage = image.resize(1600))
        : (optimizedImage = image);
    }
  } else {
    optimizedImage = image;
  }

  return optimizedImage;
};

const generateKey = (key: string, prevImage: string | null) => {
  let Key;

  if (prevImage) {
    const idParam = new URL(prevImage).searchParams.get('id');
    if (idParam) {
      Key = `${key}?id=${Number(idParam) + 1}`;
    } else {
      Key = `${key}?id=1`;
    }
  } else {
    Key = key;
  }

  return Key;
};

const generateName = (
  currentName: string,
  existingImages: string[],
  start: number,
  templateString: string
): string => {
  let newName: string, num;

  if (isNaN(start)) {
    num = 1;
    newName = `${currentName}_${num}`;
  } else {
    num = start;
    newName = `${currentName}_${num}`;
  }

  const existImage = existingImages.some((img) =>
    img.startsWith(`${templateString}/${newName}.webp`)
  );

  if (existImage) {
    return generateName(currentName, existingImages, num + 1, templateString);
  } else {
    return newName;
  }
};

export { generateKey, generateName, resizeImage, sendCommand };
