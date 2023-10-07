'use client';

import '@/styles/mteditor.css';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import { ListItemNode, ListNode } from '@lexical/list';
import {
  LexicalComposer,
  type InitialConfigType,
} from '@lexical/react/LexicalComposer';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { QuoteNode } from '@lexical/rich-text';
import type { Prisma } from '@prisma/client';
import { FC } from 'react';
import { theme } from '../Editor/Theme';
import { ImageNode } from './nodes/Image';
import { MentionNode } from './nodes/Mention';
import { TiktokNode } from './nodes/Tiktok';
import { YouTubeNode } from './nodes/Youtube';

function onError(err: Error): void {
  // eslint-disable-next-line no-console
  console.log(err);
}

interface MoetruyenEditorOutputProps {
  id: number;
  content: Prisma.JsonValue;
}

const MoetruyenEditorOutput: FC<MoetruyenEditorOutputProps> = ({
  id,
  content,
}) => {
  const initialConfig: InitialConfigType = {
    namespace: `MTEditorOutput-${id}`,
    onError,
    theme,
    editable: false,
    editorState: JSON.stringify(content),
    nodes: [
      AutoLinkNode,
      ListNode,
      ListItemNode,
      MentionNode,
      QuoteNode,
      ImageNode,
      TiktokNode,
      YouTubeNode,
      LinkNode,
    ],
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <RichTextPlugin
        contentEditable={<ContentEditable aria-label="Comment content" />}
        placeholder={null}
        ErrorBoundary={LexicalErrorBoundary}
      />
    </LexicalComposer>
  );
};

export default MoetruyenEditorOutput;
