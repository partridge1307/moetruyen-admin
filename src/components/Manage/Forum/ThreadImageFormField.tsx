'use client';

import ImageCropModal from '@/components/ImageCropModal';
import { buttonVariants } from '@/components/ui/Button';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/Form';
import { cn } from '@/lib/utils';
import type {
  CreateThreadPayload,
  EditThreadPayload,
} from '@/lib/validators/forum';
import { ImagePlus, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { FC, useRef } from 'react';
import type { UseFormReturn } from 'react-hook-form';

type ThreadThumbnailFieldProps = {
  form: UseFormReturn<EditThreadPayload>;
};

const ThreadThumbnailField: FC<ThreadThumbnailFieldProps> = ({ form }) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <FormField
      control={form.control}
      name="thumbnail"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Ảnh bìa (Nếu có)</FormLabel>
          <FormMessage />
          <FormControl>
            {field.value?.length ? (
              <div className="relative w-full pt-[56.25%] rounded-md border-2 border-dashed">
                <Image
                  fill
                  sizes="70vw"
                  quality={40}
                  priority
                  src={field.value}
                  alt="Preview Sub Forum Banner Image"
                  className="rounded-md object-top object-cover"
                  aria-label="change thumbnail button"
                  role="button"
                  onClick={(e) => {
                    e.preventDefault();

                    inputRef.current?.click();
                  }}
                />
                <button
                  type="button"
                  className={cn(
                    buttonVariants({ variant: 'destructive', size: 'sm' }),
                    'absolute right-0 top-0'
                  )}
                  onClick={(e) => {
                    e.preventDefault();
                    field.onChange('');
                  }}
                >
                  <Trash2
                    aria-label="delete thumbnail button"
                    className="w-5 h-5"
                  />
                </button>
              </div>
            ) : (
              <div
                role="button"
                className="relative w-full pt-[56.25%] rounded-md border-2 border-dashed bg-background"
                aria-label="add image button"
                onClick={(e) => {
                  e.preventDefault();

                  inputRef.current?.click();
                }}
              >
                <ImagePlus className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-20 h-20 opacity-70" />
              </div>
            )}
          </FormControl>
          <input
            ref={inputRef}
            className="hidden"
            type="file"
            accept=".jpg, .jpeg, .png"
            onChange={(e) => {
              if (
                e.target.files?.length &&
                e.target.files[0].size < 4 * 1000 * 1000
              ) {
                field.onChange(URL.createObjectURL(e.target.files[0]));

                buttonRef.current?.click();
                e.target.value = '';
              }
            }}
          />
          <ImageCropModal
            ref={buttonRef}
            image={field.value ?? ''}
            aspect={16 / 9}
            setImageCropped={(value) => field.onChange(value)}
          />
        </FormItem>
      )}
    />
  );
};

export default ThreadThumbnailField;
