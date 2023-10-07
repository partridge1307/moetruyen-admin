'use client';

import { Button } from '@/components/ui/Button';
import { Form } from '@/components/ui/Form';
import { useCustomToast } from '@/hooks/use-custom-toast';
import { BadgePayload, BadgeValidator } from '@/lib/validators/badge';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Badge } from '@prisma/client';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import { FC } from 'react';
import { useForm } from 'react-hook-form';
import BadgeColorFormField from './BadgeColorFormField';
import BadgeDescFormField from './BadgeDescFormField';
import BadgeNameFormField from './BadgeNameFormField';
import dynamic from 'next/dynamic';

const BadgeImageFormField = dynamic(() => import('./BadgeImageFormField'), {
  ssr: false,
});

interface EditProps {
  badge: Badge;
}

const Edit: FC<EditProps> = ({ badge }) => {
  const router = useRouter();
  const { loginToast, notFoundToast, serverErrorToast, successToast } =
    useCustomToast();

  const form = useForm<BadgePayload>({
    resolver: zodResolver(BadgeValidator),
    defaultValues: {
      icon: badge.image,
      name: badge.name,
      description: badge.description,
      // @ts-expect-error
      type: !!badge.color.color ? 'COLOR' : 'GRADIENT',
      color: badge.color as { color: string } | { from: string; to: string },
    },
  });

  const { mutate: Edit, isLoading: isEditting } = useMutation({
    mutationKey: ['upload-badge'],
    mutationFn: async (values: BadgePayload) => {
      const { icon, name, description, type, color } = values;

      const form = new FormData();
      if (icon.startsWith('blob')) {
        const blob = await fetch(icon).then((res) => res.blob());
        form.append('icon', blob, blob.name);
      } else {
        form.append('icon', icon);
      }

      form.append('name', name);
      form.append('description', description);
      form.append('type', type);
      type === 'COLOR'
        ? form.append('color', JSON.stringify({ color }))
        : form.append(
            'color',
            // @ts-expect-error
            JSON.stringify({ from: color.from, to: color.to })
          );

      await axios.patch(`/api/badge/${badge.id}`, form);
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) return loginToast();
        if (err.response?.status === 404) return notFoundToast();
      }

      return serverErrorToast();
    },
    onSuccess: () => {
      router.push('/badge');
      router.refresh();

      return successToast();
    },
  });

  function onSubmitHandler(values: BadgePayload) {
    // @ts-expect-error
    if (values.type === 'COLOR' && !values.color.color)
      return form.setError('color.color', { message: 'Phải có màu' });
    if (
      values.type === 'GRADIENT' &&
      // @ts-expect-error
      (!values.color.from || !values.color.to)
    ) {
      form.setError('color.from', { message: 'Phải có màu' });
      form.setError('color.to', { message: 'Phải có màu' });
      return;
    }

    Edit(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmitHandler)} className="space-y-6">
        <BadgeImageFormField form={form} />
        <BadgeNameFormField form={form} />
        <BadgeDescFormField form={form} />
        <BadgeColorFormField form={form} />

        <div className="flex justify-end items-center gap-4">
          <Button type="button" disabled={isEditting} variant={'destructive'}>
            Hủy
          </Button>
          <Button type="submit" disabled={isEditting} isLoading={isEditting}>
            Tạo
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default Edit;
