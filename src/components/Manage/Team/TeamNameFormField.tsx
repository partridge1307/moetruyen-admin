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

interface TeamNameFormFieldProps {
  form: UseFormReturn<TeamPayload>;
}

const TeamNameFormField: FC<TeamNameFormFieldProps> = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="name"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Tên</FormLabel>
          <FormMessage />
          <FormControl>
            <Input
              placeholder="Tên Team của bạn"
              autoComplete="off"
              {...field}
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
};

export default TeamNameFormField;
