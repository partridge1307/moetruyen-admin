import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { contabo } from '../client';
import { sendCommand } from '../utils';

const DeleteBadgeImage = async (badgeId: number) => {
  sendCommand(() =>
    contabo.send(
      new DeleteObjectCommand({
        Bucket: process.env.CB_BUCKET,
        Key: `badge/${badgeId}/icon.webp`,
      })
    )
  );
};

export default DeleteBadgeImage;
