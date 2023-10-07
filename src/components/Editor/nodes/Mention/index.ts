import { mainURL } from '@/config';
import type {
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  LexicalNode,
  SerializedTextNode,
  Spread,
} from 'lexical';
import { $applyNodeReplacement, TextNode } from 'lexical';

export type SerializedMentionNode = Spread<
  {
    user: { id: string; name: string };
    mentionName: string;
    type: 'mention';
    verison: 1;
  },
  SerializedTextNode
>;

const convertMentionElement = (
  domNode: HTMLElement
): DOMConversionOutput | null => {
  const textContent = domNode.textContent;

  if (textContent !== null) {
    const node = $createMentionNode(
      { name: textContent, id: '1234' },
      textContent
    );
    return {
      node,
    };
  }

  return null;
};

export class MentionNode extends TextNode {
  _user: { id: string; name: string };
  _mention: string;

  constructor(
    user: { id: string; name: string },
    mentionName: string,
    text?: string,
    key?: string
  ) {
    super(text ?? mentionName, key);

    this._user = user;
    this._mention = mentionName;
  }

  static getType(): string {
    return 'mention';
  }

  isInline() {
    return true;
  }

  static clone(node: MentionNode): MentionNode {
    return new MentionNode(node._user, node._mention, node.__text, node.__key);
  }

  static importJSON(serializedNode: SerializedMentionNode): MentionNode {
    const node = $createMentionNode(
      serializedNode.user,
      serializedNode.mentionName
    );

    node.setTextContent(serializedNode.text);
    node.setFormat(serializedNode.format);
    node.setDetail(serializedNode.detail);
    node.setMode(serializedNode.mode);
    node.setStyle(serializedNode.style);

    return node;
  }

  exportJSON(): SerializedMentionNode {
    return {
      ...super.exportJSON(),
      user: this._user,
      mentionName: this._mention,
      type: 'mention',
      verison: 1,
    };
  }

  createDOM(config: EditorConfig): HTMLElement {
    const domOuter = document.createElement('a');
    domOuter.contentEditable = 'false';

    const domChild = super.createDOM(config);
    domChild.className = 'mention';
    domChild.contentEditable = 'false';

    !!domChild.textContent &&
      (domOuter.href = `${mainURL}/user/${domChild.textContent
        .split(' ')
        .join('-')}`);
    domOuter.target = '_blank';

    domChild.textContent = `@${domChild.textContent}`;

    const spacer = document.createElement('span');
    spacer.setAttribute('data-lexical-text', 'true');

    domOuter.appendChild(domChild);
    domOuter.appendChild(spacer);

    return domOuter;
  }

  static importDOM(): DOMConversionMap | null {
    return {
      span: (domNode: HTMLElement) => {
        if (!domNode.classList.contains('user-tag')) {
          return null;
        }

        return {
          conversion: convertMentionElement,
          priority: 1,
        };
      },
    };
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('span');
    element.className = 'user-tag';

    const elementOne = document.createElement('span');
    elementOne.setAttribute('contentEditable', 'false');

    element.appendChild(elementOne);
    elementOne.textContent = this.__text;

    return { element };
  }

  isTextEntity(): true {
    return true;
  }

  canInsertTextBefore(): boolean {
    return false;
  }

  canInsertTextAfter(): boolean {
    return false;
  }
}

export const $createMentionNode = (
  user: { name: string; id: string },
  mentionName: string
): MentionNode => {
  const mentionNode = new MentionNode(user, mentionName);

  mentionNode.setMode('segmented').toggleDirectionless();
  return $applyNodeReplacement(mentionNode);
};

export const $isMentionNode = (
  node: LexicalNode | null | undefined
): node is MentionNode => {
  return node instanceof MentionNode;
};
