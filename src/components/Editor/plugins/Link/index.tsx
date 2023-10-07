import { Input } from '@/components/ui/Input';
import { $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link';
import { $isAtNodeEnd } from '@lexical/selection';
import { mergeRegister } from '@lexical/utils';
import {
  $getSelection,
  $isRangeSelection,
  SELECTION_CHANGE_COMMAND,
  type GridSelection,
  type LexicalEditor,
  type NodeSelection,
  type RangeSelection,
} from 'lexical';
import { Check, ExternalLink, Pencil, Unlink, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

const lowPriority = 1;

export function getSelectedNode(selection: RangeSelection) {
  const anchor = selection.anchor;
  const focus = selection.focus;
  const anchorNode = selection.anchor.getNode();
  const focusNode = selection.focus.getNode();
  if (anchorNode === focusNode) {
    return anchorNode;
  }
  const isBackward = selection.isBackward();
  if (isBackward) {
    return $isAtNodeEnd(focus) ? anchorNode : focusNode;
  } else {
    return $isAtNodeEnd(anchor) ? focusNode : anchorNode;
  }
}

function positionEditorElement(
  editor: HTMLDivElement,
  rect: DOMRect | undefined | null
) {
  if (rect === null || typeof rect === 'undefined') {
    editor.style.display = 'none';
  } else {
    editor.style.display = 'block';

    editor.style.top = `${rect.top + rect.height + window.scrollY + 10}px`;

    const bodyClientDivided = document.body.clientWidth / 3;
    const editorMarginLeftDivided = rect.left / 3 + editor.offsetWidth;

    bodyClientDivided > editorMarginLeftDivided
      ? (editor.style.left = `${
          rect.left + window.scrollX - editor.offsetWidth / 2 + rect.width / 2
        }px`)
      : (editor.style.left = `${
          rect.left - editor.offsetWidth + rect.width + window.scrollX
        }px`);
  }
}

export function FloatingLinkEditor({
  editor,
}: {
  editor: LexicalEditor;
}): JSX.Element {
  const editorRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mouseDownRef = useRef(false);
  const [linkUrl, setLinkUrl] = useState<string>('');
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [lastSelection, setLastSelection] = useState<
    RangeSelection | GridSelection | NodeSelection | null
  >(null);

  const updateLinkEditor = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const node = getSelectedNode(selection);
      const parent = node.getParent();
      if ($isLinkNode(parent)) {
        setLinkUrl(parent.getURL());
      } else if ($isLinkNode(node)) {
        setLinkUrl(node.getURL());
      } else {
        setLinkUrl('');
      }
    }
    const editorElement = editorRef.current;
    const nativeSelection = window.getSelection();
    const activeElement = document.activeElement;

    if (editorElement === null) {
      return;
    }
    const rootElement = editor.getRootElement();
    if (
      selection !== null &&
      !nativeSelection?.isCollapsed &&
      rootElement !== null &&
      rootElement.contains(nativeSelection?.anchorNode!)
    ) {
      const domRange = nativeSelection?.getRangeAt(0);
      let rect;
      if (nativeSelection?.anchorNode === rootElement) {
        let inner = rootElement;
        while (inner.firstElementChild != null) {
          // @ts-ignore
          inner = inner.firstElementChild;
        }
        rect = inner.getBoundingClientRect();
      } else {
        rect = domRange?.getBoundingClientRect();
      }

      if (!mouseDownRef.current) {
        positionEditorElement(editorElement, rect);
      }
      setLastSelection(selection);
    } else if (
      !activeElement ||
      activeElement.className !== 'moetruyen-link-input'
    ) {
      positionEditorElement(editorElement, null);
      setLastSelection(null);
      setIsEditMode(false);
      setLinkUrl('');
    }
    return true;
  }, [editor]);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateLinkEditor();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updateLinkEditor();
          return true;
        },
        lowPriority
      )
    );
  }, [editor, updateLinkEditor]);

  useEffect(() => {
    editor.getEditorState().read(() => {
      updateLinkEditor();
    });
  }, [editor, updateLinkEditor]);

  useEffect(() => {
    if (isEditMode && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditMode]);

  return (
    <div
      ref={editorRef}
      className="absolute z-10 -mt-1 w-fit transition-opacity rounded-md dark:bg-zinc-800 p-1 px-2"
    >
      {isEditMode ? (
        <div className="flex items-center gap-2">
          <Input
            ref={inputRef}
            className="focus-visible:ring-transparent focus-visible:ring-offset-0 md:w-36 lg:w-48 dark:bg-zinc-700"
            value={linkUrl}
            onChange={(e) => {
              setLinkUrl(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                if (lastSelection !== null) {
                  if (linkUrl !== '') {
                    editor.dispatchCommand(TOGGLE_LINK_COMMAND, linkUrl);
                  }
                  setIsEditMode(false);
                }
              } else if (e.key === 'Escape') {
                e.preventDefault();
                setIsEditMode(false);
              }
            }}
          />
          <div className="flex items-center gap-2">
            <div
              className="p-1 dark:bg-zinc-700 rounded-full transition-colors hover:dark:bg-zinc-600"
              onClick={() => {
                if (lastSelection !== null) {
                  if (linkUrl !== '') {
                    editor.dispatchCommand(TOGGLE_LINK_COMMAND, linkUrl);
                  }
                  setIsEditMode(false);
                }
              }}
            >
              <Check className="w-5 h-5 cursor-pointer text-green-400" />
            </div>
            <div
              className="p-1 dark:bg-zinc-700 rounded-full transition-colors hover:dark:bg-zinc-600"
              onClick={() => {
                setIsEditMode(false);
              }}
            >
              <X className="w-5 h-5 cursor-pointer text-red-500" />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex max-sm:flex-col items-center gap-3 p-2">
          <a href={linkUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-5 h-5" />
          </a>

          <div
            role="button"
            tabIndex={0}
            onClick={() => {
              setIsEditMode(true);
            }}
          >
            <Pencil className="w-5 h-5" />
          </div>

          <div
            role="button"
            tabIndex={1}
            onClick={() => editor.dispatchCommand(TOGGLE_LINK_COMMAND, null)}
          >
            <Unlink className="w-5 h-5" />
          </div>
        </div>
      )}
    </div>
  );
}
