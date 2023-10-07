import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/Form';
import { Label } from '@/components/ui/Label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/RadioGroup';
import {
  type CreateThreadPayload,
  type EditThreadPayload,
} from '@/lib/validators/forum';
import { FC } from 'react';
import { type UseFormReturn } from 'react-hook-form';

type ThreadCanSendFieldProps = {
  form: UseFormReturn<EditThreadPayload>;
};

const ThreadCanSendField: FC<ThreadCanSendFieldProps> = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="canSend"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Cho phép người khác đăng bài</FormLabel>
          <FormControl>
            <RadioGroup
              className="flex flex-wrap items-center gap-10"
              defaultValue={field.value ? 'true' : 'false'}
              onValueChange={(value) =>
                value === 'true' ? field.onChange(true) : field.onChange(false)
              }
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem id="true" value="true" />
                <Label htmlFor="true">Có</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem id="false" value="false" />
                <Label htmlFor="false">Không</Label>
              </div>
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default ThreadCanSendField;
