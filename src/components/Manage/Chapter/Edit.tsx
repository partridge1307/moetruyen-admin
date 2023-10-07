'use client';

import ChapterImageSkeleton from '@/components/Skeleton/ChapterImageSkeleton';
import ChapterIndexSkeleton from '@/components/Skeleton/ChapterIndexSkeleton';
import { Button } from '@/components/ui/Button';
import { Form } from '@/components/ui/Form';
import { Progress } from '@/components/ui/Progress';
import { useCustomToast } from '@/hooks/use-custom-toast';
import {
  ChapterUploadPayload,
  ChapterUploadValidator,
} from '@/lib/validators/chapter';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Chapter } from '@prisma/client';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { FC, useState } from 'react';
import { useForm } from 'react-hook-form';
import ChapterNameFormField from './ChapterNameFormField';
import ChapterVolumeFormField from './ChapterVolumeFormField';

const ChapterIndexForm = dynamic(() => import('./ChapterIndexFormField'), {
  ssr: false,
  loading: () => <ChapterIndexSkeleton />,
});
const ChapterImageFormField = dynamic(() => import('./ChapterImageFormField'), {
  ssr: false,
  loading: () => <ChapterImageSkeleton />,
});

interface EditProps {
  chapter: Pick<Chapter, 'id' | 'name' | 'volume' | 'chapterIndex' | 'images'>;
}

const ChapterEdit: FC<EditProps> = ({ chapter }) => {
  const { loginToast, notFoundToast, serverErrorToast, successToast } =
    useCustomToast();
  const [updateProgress, setUpdateProgress] = useState<number | null>(null);
  const router = useRouter();

  const form = useForm<ChapterUploadPayload>({
    resolver: zodResolver(ChapterUploadValidator),
    defaultValues: {
      chapterIndex: chapter.chapterIndex,
      chapterName: chapter.name ?? '',
      volume: chapter.volume,
      image: chapter.images.map((image, idx) => ({
        src: image,
        name: `Tr. ${idx + 1}`,
      })),
    },
  });

  const { mutate: Edit, isLoading: isEditting } = useMutation({
    mutationFn: async (values: ChapterUploadPayload) => {
      const { chapterIndex, chapterName, image, volume } = values;

      const form = new FormData();
      form.append('chapterIndex', `${chapterIndex}`);
      form.append('volume', `${volume}`);
      !!chapterName && form.append('chapterName', chapterName);

      await Promise.all(
        image.map(async (img, idx) => {
          if (!img.src.startsWith('blob')) {
            form.append('images', img.src);
            form.append('order', `${idx}`);
          } else {
            const blob = await fetch(img.src).then((res) => res.blob());
            form.append('images', blob, img.name);
            form.append('order', `${idx}`);
          }
        })
      );

      await axios.patch(`/api/chapter/${chapter.id}`, form, {
        onDownloadProgress(progressEvent) {
          const percentCompleted = Math.floor(
            (progressEvent.loaded * 100) / progressEvent.total!
          );
          setUpdateProgress(percentCompleted);
        },
      });
    },
    onError: (e) => {
      setUpdateProgress(null);

      if (e instanceof AxiosError) {
        if (e.response?.status === 401) return loginToast();
        if (e.response?.status === 404) return notFoundToast();
      }

      return serverErrorToast();
    },
    onSuccess: () => {
      router.push(`/chapter/${chapter.id}`);
      router.refresh();
      setUpdateProgress(null);

      return successToast();
    },
  });

  function onSubmitHandler(values: ChapterUploadPayload) {
    Edit(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmitHandler)} className="space-y-6">
        <ChapterIndexForm form={form} />

        <ChapterNameFormField form={form} />

        <ChapterVolumeFormField form={form} />

        <ChapterImageFormField
          form={form}
          initialImages={chapter.images.map((image, idx) => ({
            name: `Tr. ${idx + 1}`,
            src: image,
          }))}
          isUploading={isEditting}
        />

        {!!updateProgress &&
          (updateProgress >= 100 ? (
            <p className="text-center">Đang gửi đến Server...</p>
          ) : (
            <Progress value={updateProgress} />
          ))}

        <div className="flex flex-wrap justify-end items-center gap-8">
          <Button
            type="button"
            tabIndex={0}
            variant={'destructive'}
            onClick={() => router.back()}
          >
            Quay lại
          </Button>
          <Button
            type="submit"
            tabIndex={1}
            isLoading={isEditting}
            disabled={isEditting}
          >
            Đăng
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ChapterEdit;
