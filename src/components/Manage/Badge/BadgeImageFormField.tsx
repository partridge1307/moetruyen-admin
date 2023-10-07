import ImageCropModal from '@/components/ImageCropModal';
import { Button } from '@/components/ui/Button';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/Form';
import { BadgePayload } from '@/lib/validators/badge';
import { PlusCircle } from 'lucide-react';
import Image from 'next/image';
import { FC, useRef } from 'react';
import { UseFormReturn } from 'react-hook-form';

interface BadgeImageFormFieldProps {
  form: UseFormReturn<BadgePayload>;
}

const BadgeImageFormField: FC<BadgeImageFormFieldProps> = ({ form }) => {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const imageCropRef = useRef<HTMLButtonElement>(null);

  return (
    <FormField
      control={form.control}
      name="icon"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="block">Icon</FormLabel>
          <FormMessage />
          {!!field.value ? (
            <div className="relative aspect-square">
              <Image
                fill
                sizes="(max-width: 640px) 25vw, 30vw"
                quality={40}
                src={field.value}
                alt="Icon Preview"
                className="object-cover"
                role="button"
                onClick={() => imageInputRef.current?.click()}
              />
            </div>
          ) : (
            <Button
              type="button"
              onClick={() => imageInputRef.current?.click()}
            >
              <PlusCircle className="w-5 h-5" />
              <span>Thêm ảnh</span>
            </Button>
          )}
          <FormControl>
            <input
              ref={imageInputRef}
              className="hidden"
              type="file"
              accept="image/jpg, image/jpeg, image/png"
              onChange={(e) => {
                if (
                  e.target.files?.length &&
                  e.target.files[0].size < 1 * 1000 * 1000
                ) {
                  field.onChange(URL.createObjectURL(e.target.files[0]));
                  e.target.value = '';

                  setTimeout(() => imageCropRef.current?.click(), 0);
                }
              }}
            />
          </FormControl>

          {!!field.value && (
            <ImageCropModal
              ref={imageCropRef}
              image={field.value}
              aspect={1 / 1}
              setImageCropped={(value) => field.onChange(value)}
            />
          )}
        </FormItem>
      )}
    />
  );
};

export default BadgeImageFormField;
