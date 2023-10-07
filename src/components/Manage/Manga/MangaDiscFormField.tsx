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

interface MangaDiscFormProps {
  form: UseFormReturn<MangaUploadPayload>;
}

const MangaDiscForm: FC<MangaDiscFormProps> = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="discordLink"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Link Discord (nếu có)</FormLabel>
          <FormMessage />
          <FormControl>
            <Input placeholder="https://discord.gg/" {...field} />
          </FormControl>
        </FormItem>
      )}
    />
  );
};

export default MangaDiscForm;
