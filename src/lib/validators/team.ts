import { z } from 'zod';
import { vieRegex } from '../utils';
import { zfd } from 'zod-form-data';

export const TeamFormValidator = zfd.formData({
  image: zfd
    .file()
    .refine((file) => file.size < 4 * 1000 * 1000, 'Ảnh phải nhỏ hơn 4MB')
    .refine(
      (file) => ['image/png', 'image/jpeg', 'image/jpg'].includes(file.type),
      'Ảnh phải là định dạng JPG, PNG, JPEG'
    ),
  name: zfd.text(
    z
      .string()
      .min(3, 'Tối thiểu 3 kí tự')
      .max(64, 'Tối đa 64 kí tự')
      .refine(
        (value) => vieRegex.test(value),
        'Chỉ nhận kí tự tiếng Việt, Alphanumeric, khoảng trống'
      )
  ),
  description: zfd.text(
    z.string().min(5, 'Tối thiểu 5 kí tự').max(255, 'Tối đa 255 kí tự')
  ),
});

export const TeamValidator = z.object({
  image: z
    .string()
    .refine(
      (value) =>
        value.startsWith('blob') || value.startsWith('http://i.moetruyen.net'),
      'Ảnh không hợp lệ'
    ),
  name: z
    .string()
    .min(3, 'Tối thiểu 3 kí tự')
    .max(64, 'Tối đa 64 kí tự')
    .refine(
      (value) => vieRegex.test(value),
      'Chỉ nhận kí tự tiếng Việt, Alphanumeric, khoảng trống'
    ),
  description: z
    .string()
    .min(5, 'Tối thiểu 5 kí tự')
    .max(255, 'Tối đa 255 kí tự'),
});
export type TeamPayload = z.infer<typeof TeamValidator>;
