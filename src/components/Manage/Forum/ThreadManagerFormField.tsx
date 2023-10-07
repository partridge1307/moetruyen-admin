'use client';

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/Form';
import { Input } from '@/components/ui/Input';
import { EditThreadPayload } from '@/lib/validators/forum';
import { useDebouncedValue } from '@mantine/hooks';
import { X } from 'lucide-react';
import { FC, useEffect, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';

interface ThreadManagerFormFieldProps {
  form: UseFormReturn<EditThreadPayload>;
  subForumId: number;
}

const userCached = new Map<string, { id: string; name: string }[] | null>(null);

const userLookUpService = {
  search: async (
    query: string,
    subForumId: number,
    callback: (results: { id: string; name: string }[]) => void
  ): Promise<void> => {
    fetch(`/api/search/user/${subForumId}?q=${query}`, { method: 'GET' })
      .then((res) => res.json())
      .then((data) => callback(data));
  },
};

const ThreadManagerFormField: FC<ThreadManagerFormFieldProps> = ({
  form,
  subForumId,
}) => {
  const [userInput, setUserInput] = useState('');
  const [debouncedValue] = useDebouncedValue(userInput, 300);

  const [userResults, setUserResults] = useState<
    { id: string; name: string }[]
  >([]);

  useEffect(() => {
    if (debouncedValue.length) {
      const cachedResults = userCached.get(debouncedValue);

      if (cachedResults === null) {
        return;
      }

      if (cachedResults !== undefined) {
        setUserResults(cachedResults);
        return;
      }

      userCached.set(debouncedValue, null);
      userLookUpService.search(debouncedValue, subForumId, (results) => {
        userCached.set(debouncedValue, results);
        setUserResults(results);
      });
    }
  }, [debouncedValue, subForumId]);

  return (
    <FormField
      control={form.control}
      name="managers"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Quản lý</FormLabel>
          <FormMessage />
          <FormControl>
            <div className="p-1 space-y-1 rounded-md bg-background">
              {!!field.value.length && (
                <ul className="flex flex-wrap items-center gap-4">
                  {field.value.map((user) => (
                    <li
                      key={user.id}
                      className="flex items-center gap-2 p-1 rounded-md dark:bg-zinc-800"
                    >
                      {user.name}
                      <X
                        aria-label="remove user button"
                        className="w-6 h-6 hover:cursor-pointer text-red-500"
                        onClick={() =>
                          field.onChange(
                            field.value.filter((usr) => usr.id !== user.id)
                          )
                        }
                      />
                    </li>
                  ))}
                </ul>
              )}
              <Input
                placeholder="Nhập tên người dùng"
                autoComplete="off"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                className="p-1 border-none focus-visible:ring-transparent ring-offset-transparent"
              />
            </div>
          </FormControl>
          {!!userResults.length && !!debouncedValue.length && (
            <ul className="pt-2 flex flex-wrap items-center gap-4">
              {userResults
                .filter(
                  (user) => !field.value.some((usr) => user.id === usr.id)
                )
                .map((user) => (
                  <li
                    role="button"
                    key={user.id}
                    className="p-1 rounded-md dark:bg-zinc-800"
                    onClick={(e) => {
                      e.preventDefault();

                      !field.value.some((usr) => user.id === usr.id) &&
                        field.onChange([...field.value, user]);
                    }}
                  >
                    {user.name}
                  </li>
                ))}
            </ul>
          )}
        </FormItem>
      )}
    />
  );
};

export default ThreadManagerFormField;
