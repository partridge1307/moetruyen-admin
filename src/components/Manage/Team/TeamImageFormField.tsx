'use client';

import ImageCropModal from '@/components/ImageCropModal';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/Form';
import { TeamPayload } from '@/lib/validators/team';
import { ImagePlus } from 'lucide-react';
import Image from 'next/image';
import { FC, useRef } from 'react';
import { UseFormReturn } from 'react-hook-form';

interface TeamImageFormFieldProps {
  form: UseFormReturn<TeamPayload>;
}

const TeamImageFormField: FC<TeamImageFormFieldProps> = ({ form }) => {
  const ref = useRef<HTMLInputElement>(null);
  const imageCropRef = useRef<HTMLButtonElement>(null);

  return (
    <FormField
      control={form.control}
      name="image"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Ảnh</FormLabel>
          <FormMessage />
          <FormControl>
            {field.value ? (
              <div
                role="button"
                className="relative max-w-md aspect-square"
                onClick={() => ref.current?.click()}
              >
                <Image
                  fill
                  sizes="(max-width: 640px) 30vw, 40vw"
                  quality={40}
                  priority
                  src={field.value}
                  alt="Image Team Preview"
                  className="object-cover rounded-full"
                />
              </div>
            ) : (
              <div
                role="button"
                className="max-w-md aspect-square rounded-full bg-background flex justify-center items-center"
                onClick={() => ref.current?.click()}
              >
                <ImagePlus className="w-10 h-10" />
              </div>
            )}
          </FormControl>

          <input
            ref={ref}
            type="file"
            accept="image/png, image/jpg, image/jpeg"
            className="hidden"
            onChange={(e) => {
              if (
                e.target.files?.length &&
                e.target.files[0].size < 4 * 1000 * 1000
              ) {
                field.onChange(URL.createObjectURL(e.target.files[0]));
                e.target.value = '';

                setTimeout(() => imageCropRef.current?.click(), 0);
              }
            }}
          />

          {!!field.value && (
            <ImageCropModal
              ref={imageCropRef}
              image={field.value}
              aspect={1 / 1}
              setImageCropped={field.onChange}
            />
          )}
        </FormItem>
      )}
    />
  );
};

export default TeamImageFormField;
