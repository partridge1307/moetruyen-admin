import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { contabo } from '../client';
import { sendCommand } from '../utils';

const DeleteSubForumImage = async (subForumId: number) => {
  return await sendCommand(() =>
    contabo.send(
      new DeleteObjectCommand({
        Bucket: process.env.CB_BUCKET,
        Key: `forum/${subForumId}/thumbnail.png`,
      })
    )
  );
};

export default DeleteSubForumImage;
