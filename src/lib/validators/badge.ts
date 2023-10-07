import { z } from 'zod';
import { vieRegex } from '../utils';
import { zfd } from 'zod-form-data';

export const BadgeColorEnum = z.enum(['COLOR', 'GRADIENT']);

export const BadgeValidator = z.object({
  icon: z
    .string()
    .refine(
      (value) =>
        value.startsWith('blob') || value.startsWith('https://i.moetruyen.net'),
      'Ảnh không hợp lệ'
    ),
  name: z
    .string()
    .max(64, 'Tối đa 64 kí tự')
    .refine(
      (value) => vieRegex.test(value),
      'Tên chỉ chấp nhận kí tự in hoa, in thường, gạch dưới, khoảng cách hoặc số'
    ),
  description: z.string().max(128, 'Tối đa 128 kí tự'),
  type: BadgeColorEnum,
  color: z
    .object({ color: z.string() })
    .or(z.object({ from: z.string(), to: z.string() })),
});
export type BadgePayload = z.infer<typeof BadgeValidator>;

export const BadgeFormValidator = zfd.formData({
  icon: zfd
    .file()
    .refine((file) => file.size < 1 * 1000 * 1000, 'Tối đa 1MB')
    .refine(
      (file) => ['image/jpeg', 'image/png', 'image/jpg'].includes(file.type),
      'Định dạng JPG, PNG, JPEG'
    )
    .or(
      zfd.text(
        z
          .string()
          .refine(
            (value) => value.startsWith('https://i.moetruyen.net'),
            'Định dạng không hợp lệ'
          )
      )
    ),
  name: zfd.text(
    z
      .string()
      .max(64, 'Tối đa 64 kí tự')
      .refine(
        (value) => vieRegex.test(value),
        'Tên chỉ chấp nhận kí tự in hoa, in thường, gạch dưới, khoảng cách hoặc số'
      )
  ),
  description: zfd.text(z.string().max(128, 'Tối đa 128 kí tự')),
  color: zfd.json(
    z
      .object({ color: z.string() })
      .or(z.object({ from: z.string(), to: z.string() }))
  ),
});
