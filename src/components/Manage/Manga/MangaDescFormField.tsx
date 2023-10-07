import EditorSkeleton from '@/components/Skeleton/EditorSkeleton';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/Form';
import { MangaUploadPayload } from '@/lib/validators/manga';
import type { Prisma } from '@prisma/client';
import dynamic from 'next/dynamic';
import { FC } from 'react';
import { UseFormReturn } from 'react-hook-form';

const MTEditor = dynamic(() => import('@/components/Editor/MoetruyenEditor'), {
  ssr: false,
  loading: () => <EditorSkeleton />,
});

interface MangaDescFormProps {
  form: UseFormReturn<MangaUploadPayload>;
  initialContent?: Prisma.JsonValue;
}

const MangaDescForm: FC<MangaDescFormProps> = ({ form, initialContent }) => {
  return (
    <FormField
      control={form.control}
      name="description"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Mô tả</FormLabel>
          <FormMessage />
          <FormControl>
            <MTEditor
              placeholder="Nhập mô tả"
              initialContent={initialContent}
              onChange={(editorState) => field.onChange(editorState.toJSON())}
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
};

export default MangaDescForm;
