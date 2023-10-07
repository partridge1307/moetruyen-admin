'use client';

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/Form';
import { Input } from '@/components/ui/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import { BadgeColorEnum, BadgePayload } from '@/lib/validators/badge';
import { FC, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';

interface BadgeColorFormFieldProps {
  form: UseFormReturn<BadgePayload>;
}

const BadgeColorFormField: FC<BadgeColorFormFieldProps> = ({ form }) => {
  const [isGradient, setGradient] = useState(
    form.getValues('type') !== 'COLOR'
  );

  return (
    <>
      <Select
        defaultValue={
          !isGradient ? BadgeColorEnum.Enum.COLOR : BadgeColorEnum.Enum.GRADIENT
        }
        onValueChange={(value) => {
          if (value === BadgeColorEnum.Enum.COLOR) {
            setGradient(false);
            form.setValue('type', 'COLOR');
          } else {
            setGradient(true);
            form.setValue('type', 'GRADIENT');
          }
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder="Chọn kiểu màu" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem
            ref={(ref) => {
              if (!ref) return;
              ref.ontouchstart = (e) => {
                e.preventDefault();
              };
            }}
            value={BadgeColorEnum.Enum.COLOR}
          >
            Đơn
          </SelectItem>
          <SelectItem
            ref={(ref) => {
              if (!ref) return;
              ref.ontouchstart = (e) => {
                e.preventDefault();
              };
            }}
            value={BadgeColorEnum.Enum.GRADIENT}
          >
            Gradient
          </SelectItem>
        </SelectContent>
      </Select>

      {!isGradient ? (
        <FormField
          control={form.control}
          name="color.color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Màu</FormLabel>
              <FormMessage />
              <FormControl>
                <Input
                  ref={field.ref}
                  type="color"
                  value={field.value}
                  onChange={(e) => {
                    field.onChange(e.target.value);
                  }}
                />
              </FormControl>
            </FormItem>
          )}
        />
      ) : (
        <>
          <FormField
            control={form.control}
            name="color.from"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Màu (from)</FormLabel>
                <FormMessage />
                <FormControl>
                  <Input
                    ref={field.ref}
                    type="color"
                    value={field.value}
                    onChange={(e) => {
                      field.onChange(e.target.value);
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="color.to"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Màu (to)</FormLabel>
                <FormMessage />
                <FormControl>
                  <Input
                    ref={field.ref}
                    type="color"
                    value={field.value}
                    onChange={(e) => {
                      field.onChange(e.target.value);
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </>
      )}
    </>
  );
};

export default BadgeColorFormField;
