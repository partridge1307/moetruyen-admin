import {
  DeleteObjectsCommand,
  DeleteObjectsCommandInput,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import sharp from 'sharp';
import { contabo } from '../client';
import { generateKey, generateName, resizeImage, sendCommand } from '../utils';

const EditChapterImage = async (
  newImages: (Blob | string)[],
  existingImages: string[],
  mangaId: number,
  chapterId: number
) => {
  const serializedNewImages = newImages.map((image, index) => ({
      index,
      image,
    })),
    serializedExistImages = existingImages.map((image, index) => ({
      index,
      image,
    }));

  const blobImages = serializedNewImages.filter(
      (image) => image.image instanceof File
    ) as {
      index: number;
      image: File;
    }[],
    linkImages = serializedNewImages.filter(
      (image) => typeof image.image === 'string'
    ) as {
      index: number;
      image: string;
    }[],
    deletedImages = serializedExistImages.filter(
      (img) => !linkImages.some((image) => image.image === img.image)
    );

  const blobImagesHandler = await Promise.all(
    blobImages.map(async ({ image, index }) => {
      const arrayBuffer = await new Blob([image]).arrayBuffer();
      const sharpImage = sharp(arrayBuffer)
        .toFormat('webp')
        .webp({ quality: 40 });

      const { width, height } = await sharpImage.metadata();

      const optimizedImage = await resizeImage(
        sharpImage,
        width,
        height
      ).toBuffer();

      const key = `${
        process.env.IMG_DOMAIN
      }/chapter/${mangaId}/${chapterId}/${image.name.split('.').shift()}.webp`;

      let command, generatedKey;

      const existImage = serializedExistImages.find(
        (exist) => exist.index === index && exist.image.startsWith(key)
      );
      if (existImage) {
        command = new PutObjectCommand({
          Body: optimizedImage,
          Bucket: process.env.CB_BUCKET,
          Key: `chapter/${mangaId}/${chapterId}/${image.name
            .split('.')
            .shift()}.webp`,
        });

        generatedKey = generateKey(
          `${
            process.env.IMG_DOMAIN
          }/chapter/${mangaId}/${chapterId}/${image.name
            .split('.')
            .shift()}.webp`,
          existImage.image
        );
      } else {
        const name = image.name.split('.').shift()!;
        const newName = generateName(
          name,
          existingImages,
          Number(name.split('_').pop()),
          `${process.env.IMG_DOMAIN}/chapter/${mangaId}/${chapterId}`
        );

        command = new PutObjectCommand({
          Body: optimizedImage,
          Bucket: process.env.CB_BUCKET,
          Key: `chapter/${mangaId}/${chapterId}/${newName}.webp`,
        });

        generatedKey = generateKey(
          `${process.env.IMG_DOMAIN}/chapter/${mangaId}/${chapterId}/${newName}.webp`,
          null
        );
      }

      return {
        index: index,
        image: generatedKey,
        command: command,
      };
    })
  );

  const uploadedNewImages = await Promise.all(
    blobImagesHandler.map(async (blobImage) => {
      await sendCommand(() => contabo.send(blobImage.command));

      return { index: blobImage.index, image: blobImage.image };
    })
  );

  const deleteInput: DeleteObjectsCommandInput = {
    Bucket: process.env.CB_BUCKET,
    Delete: {
      Objects: deletedImages.map((deleteImage) => {
        const image = new URL(deleteImage.image).pathname.split('/').pop();

        return { Key: `chapter/${mangaId}/${chapterId}/${image}` };
      }),
    },
  };

  await sendCommand(() => contabo.send(new DeleteObjectsCommand(deleteInput)));

  return [...linkImages, ...uploadedNewImages];
};

export default EditChapterImage;
