import sharp from 'sharp';
import { generateKey, resizeImage, sendCommand } from '../utils';
import { contabo } from '../client';
import { PutObjectCommand } from '@aws-sdk/client-s3';

const UploadTeamImage = async (
  image: Blob,
  teamId: number,
  prevImage: string | null
) => {
  const arrayBuffer = await new Blob([image]).arrayBuffer();
  const sharpImage = sharp(arrayBuffer).toFormat('png').png({ quality: 40 });

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
        Key: `team/${teamId}.png`,
      })
    )
  );

  const Key = generateKey(
    `${process.env.IMG_DOMAIN}/team/${teamId}.png`,
    prevImage
  );

  return Key;
};

export default UploadTeamImage;
