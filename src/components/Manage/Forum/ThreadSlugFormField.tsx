import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/Form';
import { Input } from '@/components/ui/Input';
import { CreateThreadPayload, EditThreadPayload } from '@/lib/validators/forum';
import { FC } from 'react';
import { UseFormReturn } from 'react-hook-form';

type ThreadSlugFormFieldProps = { form: UseFormReturn<EditThreadPayload> };

const ThreadSlugFormField: FC<ThreadSlugFormFieldProps> = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="slug"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Slug</FormLabel>
          <FormMessage />
          <FormControl>
            <Input placeholder="Slug" {...field} />
          </FormControl>
        </FormItem>
      )}
    />
  );
};

export default ThreadSlugFormField;
