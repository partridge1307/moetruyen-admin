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
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import type { ChapterUploadPayload } from '@/lib/validators/chapter';
import { FC, useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';

interface ChapterIndexFormFieldProps {
  form: UseFormReturn<ChapterUploadPayload>;
}

const ChapterIndexFormField: FC<ChapterIndexFormFieldProps> = ({ form }) => {
  const [disaleChapterIndex, setDisableChapterIndex] = useState<boolean>(
    form.getValues('chapterIndex') > 0 ? false : true
  );

  return (
    <FormField
      control={form.control}
      name="chapterIndex"
      render={({ field }) => (
        <FormItem>
          <FormLabel>STT chapter</FormLabel>
          <FormMessage />
          <FormControl>
            <div>
              <Select
                onValueChange={(value) => {
                  if (value === 'custom') setDisableChapterIndex(false);
                  else if (value === 'append') {
                    field.onChange(0);
                    setDisableChapterIndex(true);
                  }
                }}
                defaultValue="append"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="append">Sau chapter mới nhất</SelectItem>
                    <SelectItem value="custom">Tự điền</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Input
                ref={field.ref}
                disabled={disaleChapterIndex}
                type="number"
                min={0}
                step={0.1}
                value={field.value}
                onChange={(e) => field.onChange(e.target.valueAsNumber)}
                onBlur={field.onBlur}
              />
            </div>
          </FormControl>
        </FormItem>
      )}
    />
  );
};

export default ChapterIndexFormField;
