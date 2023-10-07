import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/Form';
import { Input } from '@/components/ui/Input';
import { TeamPayload } from '@/lib/validators/team';
import { FC } from 'react';
import { UseFormReturn } from 'react-hook-form';

interface TeamDescFormFieldProps {
  form: UseFormReturn<TeamPayload>;
}

const TeamDescFormField: FC<TeamDescFormFieldProps> = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="description"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Mô tả</FormLabel>
          <FormMessage />
          <FormControl>
            <Input placeholder="Mô tả Team của bạn" {...field} />
          </FormControl>
        </FormItem>
      )}
    />
  );
};

export default TeamDescFormField;
