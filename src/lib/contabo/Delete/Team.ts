import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { contabo } from '../client';
import { sendCommand } from '../utils';

const DeleteTeamImage = async (teamId: number) => {
  await sendCommand(() =>
    contabo.send(
      new DeleteObjectCommand({
        Bucket: process.env.CB_BUCKET,
        Key: `team/${teamId}.png`,
      })
    )
  );
};

export default DeleteTeamImage;
