import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/Form';
import { Input } from '@/components/ui/Input';
import { ChapterUploadPayload } from '@/lib/validators/chapter';
import { FC } from 'react';
import { UseFormReturn } from 'react-hook-form';

interface ChapterNameFormFieldProps {
  form: UseFormReturn<ChapterUploadPayload>;
}

const ChapterNameFormField: FC<ChapterNameFormFieldProps> = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="chapterName"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Tên chap (Nếu có)</FormLabel>
          <FormMessage />
          <FormControl>
            <Input placeholder="Tên chapter" {...field} />
          </FormControl>
        </FormItem>
      )}
    />
  );
};

export default ChapterNameFormField;
