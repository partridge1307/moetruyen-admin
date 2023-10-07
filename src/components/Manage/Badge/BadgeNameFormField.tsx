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

interface BadgeNameFormFieldProps {
  form: UseFormReturn<BadgePayload>;
}

const BadgeNameFormField: FC<BadgeNameFormFieldProps> = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="name"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Tên</FormLabel>
          <FormMessage />
          <FormControl>
            <Input placeholder="Tên Badge" {...field} />
          </FormControl>
        </FormItem>
      )}
    />
  );
};

export default BadgeNameFormField;
