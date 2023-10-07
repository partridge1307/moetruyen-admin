import type {
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  ElementFormatType,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  Spread,
} from 'lexical';

import { BlockWithAlignableContents } from '@lexical/react/LexicalBlockWithAlignableContents';
import {
  DecoratorBlockNode,
  type SerializedDecoratorBlockNode,
} from '@lexical/react/LexicalDecoratorBlockNode';
import * as React from 'react';

type TiktokComponentProps = Readonly<{
  className: Readonly<{
    base: string;
    focus: string;
  }>;
  format: ElementFormatType | null;
  nodeKey: NodeKey;
  tiktokID: string;
}>;

function TiktokComponent({
  className,
  format,
  nodeKey,
  tiktokID,
}: TiktokComponentProps) {
  return (
    <BlockWithAlignableContents
      className={className}
      format={format}
      nodeKey={nodeKey}
    >
      <iframe
        src={`https://www.tiktok.com/embed/v3/${tiktokID}`}
        allow="accelerometer; autoplay; encrypted-media; gyroscope;"
        allowFullScreen
        loading="lazy"
        title="Tiktok Video"
        className="absolute inset-0 w-full h-full rounded-md"
      />
    </BlockWithAlignableContents>
  );
}

export type SerializedTiktokNode = Spread<
  {
    tiktokID: string;
  },
  SerializedDecoratorBlockNode
>;

function convertTiktokElement(
  domNode: HTMLElement
): null | DOMConversionOutput {
  const tiktokID = domNode.getAttribute('data-lexical-tiktok');
  if (tiktokID) {
    const node = $createTiktokNode(tiktokID);
    return { node };
  }
  return null;
}

export class TiktokNode extends DecoratorBlockNode {
  __id: string;

  static getType(): string {
    return 'tiktok';
  }

  static clone(node: TiktokNode): TiktokNode {
    return new TiktokNode(node.__id, node.__format, node.__key);
  }

  static importJSON(serializedNode: SerializedTiktokNode): TiktokNode {
    const node = $createTiktokNode(serializedNode.tiktokID);
    node.setFormat(serializedNode.format);
    return node;
  }

  exportJSON(): SerializedTiktokNode {
    return {
      ...super.exportJSON(),
      type: 'tiktok',
      version: 1,
      tiktokID: this.__id,
    };
  }

  constructor(id: string, format?: ElementFormatType, key?: NodeKey) {
    super(format, key);
    this.__id = id;
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('iframe');
    element.setAttribute('data-lexical-tiktok', this.__id);
    element.setAttribute('src', `https://www.tiktok.com/embed/v3/${this.__id}`);
    element.setAttribute(
      'allow',
      'accelerometer; autoplay; encrypted-media; gyroscope;'
    );
    element.setAttribute('allowfullscreen', 'true');
    element.setAttribute('title', 'Tiktok video');
    element.setAttribute('height', '315');
    element.style.width = '100%';
    return { element };
  }

  static importDOM(): DOMConversionMap | null {
    return {
      iframe: (domNode: HTMLElement) => {
        if (!domNode.hasAttribute('data-lexical-tiktok')) {
          return null;
        }
        return {
          conversion: convertTiktokElement,
          priority: 1,
        };
      },
    };
  }

  updateDOM(): false {
    return false;
  }

  getId(): string {
    return this.__id;
  }

  getTextContent(): string {
    return `https://www.tiktok.com/embed/v3/${this.__id}`;
  }

  decorate(_editor: LexicalEditor, config: EditorConfig): JSX.Element {
    const embedBlockTheme = config.theme.embedBlock || {};
    const className = {
      base: embedBlockTheme.base || '',
      focus: embedBlockTheme.focus || '',
    };
    return (
      <TiktokComponent
        className={className}
        format={this.__format}
        nodeKey={this.getKey()}
        tiktokID={this.__id}
      />
    );
  }
}

export function $createTiktokNode(tiktokID: string): TiktokNode {
  return new TiktokNode(tiktokID);
}

export function $isTiktokNode(
  node: TiktokNode | LexicalNode | null | undefined
): node is TiktokNode {
  return node instanceof TiktokNode;
}
