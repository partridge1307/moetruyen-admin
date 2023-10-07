'use client';

import { Button } from '@/components/ui/Button';
import { Form } from '@/components/ui/Form';
import { useCustomToast } from '@/hooks/use-custom-toast';
import { BadgePayload, BadgeValidator } from '@/lib/validators/badge';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import BadgeColorFormField from './BadgeColorFormField';
import BadgeDescFormField from './BadgeDescFormField';
import BadgeNameFormField from './BadgeNameFormField';

const BadgeImageFormField = dynamic(() => import('./BadgeImageFormField'), {
  ssr: false,
});

const Create = () => {
  const router = useRouter();
  const { loginToast, notFoundToast, serverErrorToast, successToast } =
    useCustomToast();

  const form = useForm<BadgePayload>({
    resolver: zodResolver(BadgeValidator),
    defaultValues: {
      icon: '',
      name: '',
      description: '',
      type: 'COLOR',
      color: undefined,
    },
  });

  const { mutate: Create, isLoading: isCreating } = useMutation({
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
      type === 'COLOR'
        ? form.append('color', JSON.stringify({ color }))
        : form.append(
            'color',
            // @ts-expect-error
            JSON.stringify({ from: color.from, to: color.to })
          );

      await axios.post('/api/badge', form);
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

    Create(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmitHandler)} className="space-y-6">
        <BadgeImageFormField form={form} />
        <BadgeNameFormField form={form} />
        <BadgeDescFormField form={form} />
        <BadgeColorFormField form={form} />

        <div className="flex justify-end items-center gap-4">
          <Button type="button" disabled={isCreating} variant={'destructive'}>
            Hủy
          </Button>
          <Button type="submit" disabled={isCreating} isLoading={isCreating}>
            Tạo
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default Create;
