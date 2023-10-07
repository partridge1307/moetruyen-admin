import '@/styles/zoom.css';
import {
  DndContext,
  DragEndEvent,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, arrayMove, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Edit, Maximize2, X } from 'lucide-react';
import Image from 'next/image';
import type { Dispatch, FC, RefObject, SetStateAction } from 'react';
import { memo, useCallback, useMemo, useRef, useState } from 'react';
import { Controlled as ControlledZoom } from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';

interface indexProps {
  items: { src: string; name: string }[];
  isUpload: boolean;
  setItems: Dispatch<SetStateAction<{ src: string; name: string }[]>>;
}

const DnDChapterImage: FC<indexProps> = ({ items, setItems, isUpload }) => {
  const sensors = useSensors(
    useSensor(TouchSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10,
      },
    })
  );
  const itemIds = useMemo(() => items.map((item) => item.src), [items]);
  const editImageRef = useRef<HTMLInputElement>(null);
  const [currentIdx, setCurrentIdx] = useState<number>(-1);

  const onDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (active.id !== over?.id) {
        setItems((items) => {
          const oldIndex = items.findIndex((item) => item.src === active.id);
          const newIndex = items.findIndex((item) => item.src === over?.id);

          return arrayMove(items, oldIndex, newIndex);
        });
      }
    },
    [setItems]
  );

  const onEditImage = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.length) {
        const target = e.target.files[0];
        const src = URL.createObjectURL(target);
        items[currentIdx] = { src, name: target.name };
        setItems([...items]);
      }
    },
    [currentIdx, items, setItems]
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
    >
      <SortableContext disabled={isUpload} items={itemIds}>
        <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-6 gap-6">
          {items.map((item, idx) => (
            <SortableItem
              isUpload={isUpload}
              key={idx}
              index={idx}
              editImageRef={editImageRef}
              setCurrentIdx={setCurrentIdx}
              setItems={setItems}
              img={item}
            />
          ))}
        </div>
      </SortableContext>
      <input
        id="edit-image"
        ref={editImageRef}
        type="file"
        accept=".jpg, .png, .jpeg"
        className="hidden"
        onChange={onEditImage}
      />
    </DndContext>
  );
};

export default DnDChapterImage;

const SortableItem = memo(function SortableItem({
  img,
  index,
  isUpload,
  editImageRef,
  setCurrentIdx,
  setItems,
}: {
  img: { src: string; name: string };
  index: number;
  isUpload: boolean;
  editImageRef: RefObject<HTMLInputElement>;
  setCurrentIdx: Dispatch<SetStateAction<number>>;
  setItems: Dispatch<SetStateAction<{ src: string; name: string }[]>>;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    isDragging,
    transform,
    transition,
  } = useSortable({ id: img.src });
  const [isZoomed, setZoom] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <ControlledZoom
        isZoomed={isZoomed}
        onZoomChange={setZoom}
        wrapElement="div"
        classDialog="custom-zoom"
      >
        <div className="relative w-28 h-44 md:w-32 md:h-48">
          <Image
            fill
            sizes="(max-width: 640px) 50vw, 40vw"
            priority
            src={img.src}
            alt={`${img.name} Image`}
            className="object-cover rounded-md"
          />

          {!isUpload && !isDragging && (
            <button
              type="button"
              className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 p-1 rounded-full dark:bg-zinc-800/80"
              onClick={() => {
                editImageRef.current?.click();
                setCurrentIdx(index);
              }}
            >
              <Edit className="w-4 h-4 opacity-70" />
            </button>
          )}

          {!isUpload && !isDragging && (
            <button
              type="button"
              className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 p-1 rounded-full dark:bg-zinc-800/80"
              onClick={() => {
                setItems((items) =>
                  items.filter((item) => item.src !== img.src)
                );
              }}
            >
              <X className="w-4 h-4 opacity-70" />
            </button>
          )}

          {!isUpload && !isDragging && (
            <button
              type="button"
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-2 rounded-full dark:bg-zinc-800/80"
              onClick={() => {
                setZoom(true);
              }}
            >
              <Maximize2 className="w-5 h-5 opacity-80" />
            </button>
          )}

          <p className="absolute bottom-0 inset-x-1 p-1 text-xs text-center rounded-full line-clamp-1 dark:bg-zinc-800/80">
            {img.name}
          </p>
        </div>
      </ControlledZoom>
    </div>
  );
});
