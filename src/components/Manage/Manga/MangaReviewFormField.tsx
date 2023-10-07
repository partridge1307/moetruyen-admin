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

interface MangaReviewFormProps {
  form: UseFormReturn<MangaUploadPayload>;
}

const MangaReviewForm: FC<MangaReviewFormProps> = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="review"
      render={({ field }) => (
        <FormItem>
          <FormLabel
            className="after:content-['*'] after:text-red-500 after:ml-0.5"
            title="Nội dung này sẽ được hiển thị bên ngoài trang chủ"
          >
            Sơ lược
          </FormLabel>
          <FormMessage />
          <FormControl>
            <Input placeholder="Nhập nội dung..." {...field} />
          </FormControl>
        </FormItem>
      )}
    />
  );
};

export default MangaReviewForm;
