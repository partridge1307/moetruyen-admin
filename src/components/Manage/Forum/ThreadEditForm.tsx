'use client';

import ThreadImageSkeleton from '@/components/Skeleton/ThreadImageSkeleton';
import { Button } from '@/components/ui/Button';
import { Form } from '@/components/ui/Form';
import { useCustomToast } from '@/hooks/use-custom-toast';
import { toast } from '@/hooks/use-toast';
import { EditThreadPayload, EditThreadValidator } from '@/lib/validators/forum';
import { zodResolver } from '@hookform/resolvers/zod';
import type { SubForum, User } from '@prisma/client';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { FC } from 'react';
import { useForm } from 'react-hook-form';
import ThreadCanSendField from './ThreadCanSendFormField';
import ThreadSlugFormField from './ThreadSlugFormField';
import ThreadTitleField from './ThreadTitleFormField';

const ThreadImageForm = dynamic(() => import('./ThreadImageFormField'), {
  ssr: false,
  loading: () => <ThreadImageSkeleton />,
});
const ThreadManagerFormField = dynamic(
  () => import('./ThreadManagerFormField'),
  { ssr: false }
);

interface EditProps {
  subForum: Pick<SubForum, 'id' | 'slug' | 'title' | 'banner' | 'canSend'> & {
    subscriptions: {
      user: Pick<User, 'id' | 'name'>;
    }[];
  };
}

const Edit: FC<EditProps> = ({ subForum }) => {
  const router = useRouter();
  const { loginToast, serverErrorToast, notFoundToast, successToast } =
    useCustomToast();

  const form = useForm<EditThreadPayload>({
    resolver: zodResolver(EditThreadValidator),
    defaultValues: {
      slug: subForum.slug,
      title: subForum.title,
      thumbnail: subForum.banner ?? undefined,
      canSend: subForum.canSend,
      managers: subForum.subscriptions.map((sub) => sub.user),
    },
  });

  const { mutate: Update, isLoading: isUpdating } = useMutation({
    mutationFn: async (values: EditThreadPayload) => {
      const { thumbnail, title, slug, canSend, managers } = values;

      const form = new FormData();

      if (thumbnail) {
        if (thumbnail.startsWith('blob')) {
          const blob = await fetch(thumbnail).then((res) => res.blob());
          form.append('thumbnail', blob);
        } else form.append('thumbnail', thumbnail);
      }

      !!slug && form.append('slug', slug);
      form.append('title', title);
      form.append('canSend', canSend ? 'true' : 'false');

      managers.map((manager) =>
        form.append('managers', JSON.stringify(manager))
      );

      const { data } = await axios.patch(`/api/forum/${subForum.id}`, form);

      return data as string;
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) return loginToast();
        if (err.response?.status === 404) return notFoundToast();
        if (err.response?.status === 400)
          return toast({
            title: 'Slug đã tồn tại',
            description: 'Đã tồn tại Slug này rồi',
            variant: 'destructive',
          });
        if (err.response?.status === 406)
          return toast({
            title: 'Không hợp lệ',
            description: 'Người dùng quản lý không hợp lệ',
            variant: 'destructive',
          });
      }
      return serverErrorToast();
    },
    onSuccess: (data) => {
      router.push(`/forum/${data}`);
      router.refresh();

      return successToast();
    },
  });

  function onSubmitHandler(values: EditThreadPayload) {
    Update(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmitHandler)} className="space-y-6">
        <ThreadImageForm form={form} />
        <ThreadTitleField form={form} />
        <ThreadSlugFormField form={form} />
        <ThreadCanSendField form={form} />
        <ThreadManagerFormField form={form} subForumId={subForum.id} />

        <div className="flex justify-end gap-4">
          <Button
            tabIndex={0}
            type="button"
            disabled={isUpdating}
            variant={'destructive'}
            className="px-6"
            onClick={() => router.back()}
          >
            Hủy
          </Button>
          <Button
            tabIndex={1}
            disabled={isUpdating}
            isLoading={isUpdating}
            type="submit"
            className="px-6"
          >
            Sửa
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default Edit;
