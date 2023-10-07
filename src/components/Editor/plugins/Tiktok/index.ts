import {
  $createTiktokNode,
  TiktokNode,
} from '@/components/Editor/nodes/Tiktok';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $insertNodeToNearestRoot } from '@lexical/utils';
import {
  COMMAND_PRIORITY_EDITOR,
  createCommand,
  type LexicalCommand,
} from 'lexical';
import { useEffect } from 'react';

export const INSERT_TIKTOK_COMMAND: LexicalCommand<string> = createCommand(
  'INSERT_TIKTOK_COMMAND'
);

export default function TiktokPlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor.hasNodes([TiktokNode])) {
      throw new Error('TiktokPlugin: TiktokNode not registered on editor');
    }

    return editor.registerCommand<string>(
      INSERT_TIKTOK_COMMAND,
      (payload) => {
        const tiktokNode = $createTiktokNode(payload);
        $insertNodeToNearestRoot(tiktokNode);

        return true;
      },
      COMMAND_PRIORITY_EDITOR
    );
  }, [editor]);

  return null;
}
