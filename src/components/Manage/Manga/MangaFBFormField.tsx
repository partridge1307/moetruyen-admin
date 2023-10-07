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

interface MangaFBFormProps {
  form: UseFormReturn<MangaUploadPayload>;
}

const MangaFBForm: FC<MangaFBFormProps> = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="facebookLink"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Link Facebook (nếu có)</FormLabel>
          <FormMessage />
          <FormControl>
            <Input placeholder="https://facebook.com/" {...field} />
          </FormControl>
        </FormItem>
      )}
    />
  );
};

export default MangaFBForm;
