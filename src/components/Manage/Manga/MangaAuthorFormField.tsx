'use client';

import type {
  MangaUploadPayload,
  authorInfoProps,
} from '@/lib/validators/manga';
import { useDebouncedValue } from '@mantine/hooks';
import { X } from 'lucide-react';
import { FC, useEffect, useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../ui/Form';
import { Input } from '../../ui/Input';

interface MangaAuthorFormProps {
  form: UseFormReturn<MangaUploadPayload>;
  existAuthors?: authorInfoProps[];
}

const authorCache = new Map<string, authorInfoProps[] | null>();

const authorLookUpService = {
  search: async (
    query: string,
    // eslint-disable-next-line no-unused-vars
    callback: (results: authorInfoProps[]) => void
  ) => {
    fetch(`/api/manga/author?q=${query}`, { method: 'GET' })
      .then((res) => res.json())
      .then((res) => callback(res));
  },
};

const MangaAuthorForm: FC<MangaAuthorFormProps> = ({ form, existAuthors }) => {
  const [authorInput, setAuthorInput] = useState('');
  const [debouncedValue] = useDebouncedValue(authorInput, 300);
  const [authorSelected, setAuthorSelected] = useState<authorInfoProps[]>(
    existAuthors ?? []
  );
  const [authorsResult, setAuthorsResult] = useState<authorInfoProps[]>([]);

  useEffect(() => {
    if (debouncedValue.length) {
      const cachedResults = authorCache.get(debouncedValue);

      if (cachedResults === null) {
        return;
      }
      if (cachedResults !== undefined) {
        setAuthorsResult(cachedResults);
        return;
      }

      authorCache.set(debouncedValue, null);
      authorLookUpService.search(debouncedValue, (results) => {
        authorCache.set(debouncedValue, results);
        setAuthorsResult(results);
      });
    }
  }, [debouncedValue, debouncedValue.length]);

  return (
    <FormField
      control={form.control}
      name="author"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Tác giả</FormLabel>
          <FormMessage />
          <FormControl>
            <div className="rounded-lg space-y-2">
              <ul className="flex gap-x-2">
                {authorSelected.map((auth) => (
                  <li
                    key={auth.id}
                    className="flex flex-wrap items-center gap-x-1 rounded-md bg-zinc-800 p-1"
                  >
                    <span>{auth.name}</span>
                    <X
                      className="h-5 w-5 cursor-pointer text-red-500"
                      onClick={() => {
                        const authorVal = [
                          ...authorSelected.filter((a) => a.name !== auth.name),
                        ];
                        setAuthorSelected(authorVal);
                        form.setValue('author', authorVal);
                      }}
                    />
                  </li>
                ))}
              </ul>
              <Input
                ref={field.ref}
                placeholder="Tác giả"
                value={authorInput}
                onChange={(e) => {
                  setAuthorInput(e.target.value.trim());
                }}
                className="border-none focus:ring-0 focus-visible:ring-transparent ring-offset-transparent"
              />
            </div>
          </FormControl>
          <ul className="flex flex-wrap items-center gap-2">
            {!!authorInput.length && (
              <li
                className={`flex items-center gap-x-2 ${
                  authorSelected.some((a) => a.name === authorInput) && 'hidden'
                }`}
              >
                Thêm:{' '}
                <span
                  className="cursor-pointer p-1 rounded-md dark:bg-zinc-800"
                  onClick={() => {
                    if (!authorSelected.some((a) => a.name === authorInput)) {
                      form.setValue('author', [
                        ...authorSelected,
                        { id: -1, name: authorInput },
                      ]);
                      setAuthorSelected([
                        ...authorSelected,
                        { id: -1, name: authorInput },
                      ]);
                      setAuthorInput('');
                    }
                  }}
                >
                  {authorInput}
                </span>
              </li>
            )}

            {!!authorsResult?.length &&
              !!authorInput.length &&
              authorsResult.map((auth) => (
                <li
                  key={auth.id}
                  className={`cursor-pointer rounded-md bg-zinc-800 p-1 ${
                    authorSelected.some((a) => a.name === auth.name) && 'hidden'
                  }`}
                  onClick={() => {
                    if (!authorSelected.includes(auth)) {
                      form.setValue('author', [...authorSelected, auth]);
                      setAuthorSelected([...authorSelected, auth]);
                      setAuthorInput('');
                    }
                  }}
                >
                  {auth.name}
                </li>
              ))}
          </ul>
        </FormItem>
      )}
    />
  );
};

export default MangaAuthorForm;
