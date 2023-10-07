import {
  DeleteObjectsCommand,
  DeleteObjectsCommandInput,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import { contabo } from '../client';
import { sendCommand } from '../utils';

const DeleteChapterImages = async ({
  mangaId,
  chapterId,
}: {
  mangaId: number;
  chapterId: number;
}) => {
  const command = new ListObjectsV2Command({
    Bucket: process.env.CB_BUCKET,
    Delimiter: '/',
    Prefix: `chapter/${mangaId}/${chapterId}/`,
  });

  const listedObjects = await contabo.send(command);
  if (!listedObjects.Contents?.length) return;

  const deleteInput: DeleteObjectsCommandInput = {
    Bucket: process.env.CB_BUCKET,
    Delete: {
      Objects: listedObjects.Contents.map(({ Key }) => ({ Key })),
    },
  };

  return await sendCommand(() =>
    contabo.send(new DeleteObjectsCommand(deleteInput))
  );
};

export { DeleteChapterImages };
