import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/Form';
import { Input } from '@/components/ui/Input';
import type { MangaUploadPayload } from '@/lib/validators/manga';
import { FC } from 'react';
import { UseFormReturn } from 'react-hook-form';

interface MangaNameFormFieldProps {
  form: UseFormReturn<MangaUploadPayload>;
}

const MangaNameFormField: FC<MangaNameFormFieldProps> = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="name"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Tên truyện</FormLabel>
          <FormMessage />
          <FormControl>
            <Input placeholder="Tên truyện" autoComplete="off" {...field} />
          </FormControl>
        </FormItem>
      )}
    />
  );
};

export default MangaNameFormField;
