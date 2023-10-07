import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/Form';
import { Input } from '@/components/ui/Input';
import { MangaUploadPayload } from '@/lib/validators/manga';
import { FC } from 'react';
import { UseFormReturn } from 'react-hook-form';

interface MangaSlugFormFieldProps {
  form: UseFormReturn<MangaUploadPayload>;
}

const MangaSlugFormField: FC<MangaSlugFormFieldProps> = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="slug"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Slug</FormLabel>
          <FormMessage />
          <FormControl>
            <Input placeholder="Slug" autoComplete="off" {...field} />
          </FormControl>
        </FormItem>
      )}
    />
  );
};

export default MangaSlugFormField;
