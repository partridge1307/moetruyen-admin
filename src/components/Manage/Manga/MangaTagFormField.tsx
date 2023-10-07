import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/Command';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/Form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/Popover';
import { cn } from '@/lib/utils';
import type { MangaUploadPayload, tagInfoProps } from '@/lib/validators/manga';
import { Check, X } from 'lucide-react';
import { FC, useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';

type Tags = {
  category: string;
  data: {
    id: number;
    name: string;
    description: string;
  }[];
};

interface MangaTagFormProps {
  form: UseFormReturn<MangaUploadPayload>;
  tag: Tags[];
  existTags?: tagInfoProps[];
}

const MangaTagForm: FC<MangaTagFormProps> = ({ form, tag, existTags }) => {
  const tagCopy = tag.flatMap((t) => t.data);
  const [tagSelect, setTagSelect] = useState<tagInfoProps[]>(existTags ?? []);

  return (
    <FormField
      control={form.control}
      name="tag"
      render={() => (
        <FormItem>
          <FormLabel>Thể loại</FormLabel>
          <FormMessage />
          <Popover>
            <ul className="flex flex-wrap items-center gap-x-2">
              {tagSelect.map((t, i) => (
                <li
                  key={i}
                  className="flex items-center gap-x-1 rounded-md bg-zinc-800 p-1"
                >
                  {t.name}
                  <span
                    onClick={() => {
                      const tagValue = [
                        ...tagSelect.filter((ta) => ta.name !== t.name),
                      ];
                      form.setValue('tag', tagValue);
                      setTagSelect(tagValue);
                    }}
                  >
                    <X className="h-5 w-5 cursor-pointer text-red-500" />
                  </span>
                </li>
              ))}
            </ul>
            <PopoverTrigger className="w-full">
              <FormControl>
                <div className="relative h-10 rounded-md bg-background">
                  <span className="absolute text-sm top-1/2 -translate-y-1/2 left-3 opacity-70">
                    Thể loại
                  </span>
                </div>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent>
              <Command>
                <CommandInput placeholder="Tìm thể loại" />
                <CommandEmpty>Không tìm thấy</CommandEmpty>
                <CommandList>
                  {!!tag.length &&
                    tag.map((t, idx) => (
                      <CommandGroup key={`${idx}`} heading={t.category}>
                        {t.data.map((d, i) => (
                          <CommandItem
                            key={`${i}`}
                            title={d.description}
                            className="cursor-pointer"
                            onSelect={(currVal) => {
                              if (
                                !tagSelect.some(
                                  (d) => d.name.toLocaleLowerCase() === currVal
                                )
                              ) {
                                const tagValue = [
                                  ...tagSelect,
                                  ...tagCopy.filter(
                                    (T) => T.name.toLowerCase() === currVal
                                  ),
                                ];
                                form.setValue('tag', tagValue);
                                setTagSelect(tagValue);
                              } else {
                                const tagValue = [
                                  ...tagSelect.filter(
                                    (T) => T.name.toLowerCase() !== currVal
                                  ),
                                ];
                                form.setValue('tag', tagValue);
                                setTagSelect(tagValue);
                              }
                            }}
                          >
                            <div
                              className={cn(
                                'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                                tagSelect.includes(d)
                                  ? 'bg-primary text-primary-foreground'
                                  : 'opacity-50 [&_svg]:invisible'
                              )}
                            >
                              <Check className="h-4 w-4" />
                            </div>
                            {d.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    ))}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </FormItem>
      )}
    />
  );
};

export default MangaTagForm;
