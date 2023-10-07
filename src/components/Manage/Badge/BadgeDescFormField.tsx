import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/Form';
import { Input } from '@/components/ui/Input';
import { BadgePayload } from '@/lib/validators/badge';
import { FC } from 'react';
import { UseFormReturn } from 'react-hook-form';

interface BadgeDescFormFieldProps {
  form: UseFormReturn<BadgePayload>;
}

const BadgeDescFormField: FC<BadgeDescFormFieldProps> = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="description"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Mô tả</FormLabel>
          <FormMessage />
          <FormControl>
            <Input placeholder="Mô tả Badge" {...field} />
          </FormControl>
        </FormItem>
      )}
    />
  );
};

export default BadgeDescFormField;
