import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogTrigger,
} from '@/components/ui/AlertDialog';
import { buttonVariants } from '@/components/ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import { Input } from '@/components/ui/Input';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $wrapNodeInElement, mergeRegister } from '@lexical/utils';
import {
  $createParagraphNode,
  $getSelection,
  $insertNodes,
  $isNodeSelection,
  $isRootOrShadowRoot,
  COMMAND_PRIORITY_EDITOR,
  COMMAND_PRIORITY_HIGH,
  COMMAND_PRIORITY_LOW,
  DRAGOVER_COMMAND,
  DRAGSTART_COMMAND,
  createCommand,
  type LexicalCommand,
  type LexicalEditor,
} from 'lexical';
import { FileImage, Image as ImageIcon, Link2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  $createImageNode,
  $isImageNode,
  ImageNode,
  ImagePayload,
} from '../../nodes/Image';

export type InsertImagePayload = Readonly<ImagePayload>;
export const INSERT_IMAGE_COMMAND: LexicalCommand<InsertImagePayload> =
  createCommand('INSERT_IMAGE_COMMAND');

declare global {
  interface DragEvent {
    rangeOffset?: number;
    rangeParent?: Node;
  }
}

export function InsertURLImageUploaded({
  onClick,
}: {
  onClick: (payload: ImagePayload) => void;
}): JSX.Element {
  const [src, setSrc] = useState<string>('');
  const isDisabled = src === '';

  return (
    <>
      <Input
        placeholder="Điền Link..."
        value={src}
        onChange={(e) => setSrc(e.target.value)}
      />
      <div className="flex items-stretch justify-end gap-4">
        <AlertDialogCancel
          type="button"
          className={buttonVariants({ variant: 'destructive' })}
        >
          Hủy
        </AlertDialogCancel>
        <AlertDialogAction
          type="button"
          disabled={isDisabled}
          onClick={() => {
            onClick({ src, altText: 'Image' });
          }}
        >
          Xong
        </AlertDialogAction>
      </div>
    </>
  );
}

export function InsertImageUploaded({
  onClick,
}: {
  onClick: (payload: InsertImagePayload) => void;
}): JSX.Element {
  const [src, setSrc] = useState('');

  const isDisabled = src === '';

  const LoadImage = (files: FileList | null) => {
    const reader = new FileReader();
    reader.onload = function () {
      if (typeof reader.result === 'string') {
        setSrc(reader.result);
      }
      return '';
    };
    if (files !== null) {
      reader.readAsDataURL(files[0]);
    }
  };

  return (
    <>
      <Input
        type="file"
        accept=".jpg, .jpeg, .png"
        onChange={(e) => LoadImage(e.target.files)}
      />
      <div className="flex items-stretch justify-end gap-4">
        <AlertDialogCancel
          type="button"
          className={buttonVariants({ variant: 'destructive' })}
        >
          Hủy
        </AlertDialogCancel>
        <AlertDialogAction
          type="button"
          disabled={isDisabled}
          onClick={() => onClick({ src, altText: 'Image' })}
        >
          Xong
        </AlertDialogAction>
      </div>
    </>
  );
}

export default function ImagesPlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor.hasNodes([ImageNode])) {
      throw new Error('ImagesPlugin: ImageNode not registered on editor');
    }

    return mergeRegister(
      editor.registerCommand<InsertImagePayload>(
        INSERT_IMAGE_COMMAND,
        (payload) => {
          const imageNode = $createImageNode(payload);
          $insertNodes([imageNode]);
          if ($isRootOrShadowRoot(imageNode.getParentOrThrow())) {
            $wrapNodeInElement(imageNode, $createParagraphNode).selectEnd();
          }

          return true;
        },
        COMMAND_PRIORITY_EDITOR
      ),
      editor.registerCommand<DragEvent>(
        DRAGSTART_COMMAND,
        (event) => {
          return onDragStart(event);
        },
        COMMAND_PRIORITY_HIGH
      ),
      editor.registerCommand<DragEvent>(
        DRAGOVER_COMMAND,
        (event) => {
          return onDragover(event);
        },
        COMMAND_PRIORITY_LOW
      )
    );
  }, [editor]);

  return null;
}

export function ImageInputBody({
  editor,
}: {
  editor: LexicalEditor;
}): JSX.Element {
  const onClick = (payload: InsertImagePayload) => {
    editor.dispatchCommand(INSERT_IMAGE_COMMAND, payload);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger aria-label="image insert button" type="button">
        <ImageIcon className="w-8 h-8 md:w-5 md:h-5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="flex flex-col items-center gap-3 dark:bg-zinc-900 text-white">
        <AlertDialog>
          <AlertDialogTrigger
            type="button"
            className="flex items-center justify-center gap-1 p-1 rounded-md text-base hover:dark:bg-zinc-800 w-full"
          >
            <FileImage className="w-[1.2rem] h-[1.2rem]" />
            <p>Từ máy</p>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <InsertImageUploaded onClick={onClick} />
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog>
          <AlertDialogTrigger
            type="button"
            className="flex items-center justify-center gap-1 p-1 rounded-md text-base hover:dark:bg-zinc-800 w-full"
          >
            <Link2 className="w-5 h-5" />
            <p>Từ Link</p>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <InsertURLImageUploaded onClick={onClick} />
          </AlertDialogContent>
        </AlertDialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function getImageNodeInSelection(): ImageNode | null {
  const selection = $getSelection();
  if (!$isNodeSelection(selection)) {
    return null;
  }
  const nodes = selection.getNodes();
  const node = nodes[0];
  return $isImageNode(node) ? node : null;
}

function canDropImage(event: DragEvent): boolean {
  const target = event.target;
  return !!(
    target &&
    target instanceof HTMLElement &&
    !target.closest('code, span.editor-image') &&
    target.parentElement &&
    target.parentElement.closest('div.ContentEditable__root')
  );
}

function onDragover(event: DragEvent): boolean {
  const node = getImageNodeInSelection();
  if (!node) {
    return false;
  }
  if (!canDropImage(event)) {
    event.preventDefault();
  }
  return true;
}

function onDragStart(event: DragEvent): boolean {
  const node = getImageNodeInSelection();
  if (!node) {
    return false;
  }
  const dataTransfer = event.dataTransfer;
  if (!dataTransfer) {
    return false;
  }
  dataTransfer.setData('text/plain', '_');
  dataTransfer.setData(
    'application/x-lexical-drag',
    JSON.stringify({
      data: {
        altText: node.__altText,
        height: node.__height,
        key: node.getKey(),
        maxWidth: node.__maxWidth,
        src: node.__src,
        width: node.__width,
      },
      type: 'image',
    })
  );

  return true;
}
