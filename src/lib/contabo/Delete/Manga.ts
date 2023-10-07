import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { contabo } from '../client';
import { sendCommand } from '../utils';

const DeleteMangaImage = async (mangaId: number) => {
  const command = new DeleteObjectCommand({
    Bucket: process.env.CB_BUCKET,
    Key: `manga/${mangaId}/thumbnail.png`,
  });

  return await sendCommand(() => contabo.send(command));
};

export default DeleteMangaImage;
