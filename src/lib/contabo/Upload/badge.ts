import sharp from 'sharp';
import { generateKey, resizeImage, sendCommand } from '../utils';
import { contabo } from '../client';
import { PutObjectCommand } from '@aws-sdk/client-s3';

const UploadBadgeImage = async (
  image: Blob,
  badgeId: number,
  prevImage: string | null
) => {
  const arrayBuffer = await new Blob([image]).arrayBuffer();
  const sharpImage = sharp(arrayBuffer).toFormat('webp').webp({ quality: 40 });

  const { width, height } = await sharpImage.metadata();

  const optimizedImage = await resizeImage(
    sharpImage,
    width,
    height
  ).toBuffer();

  await sendCommand(() =>
    contabo.send(
      new PutObjectCommand({
        Body: optimizedImage,
        Bucket: process.env.CB_BUCKET,
        Key: `badge/${badgeId}/icon.webp`,
      })
    )
  );

  const Key = generateKey(
    `${process.env.IMG_DOMAIN}/badge/${badgeId}/icon.webp`,
    prevImage
  );
  return Key;
};

export default UploadBadgeImage;
