'use client';

import { Button } from '@/components/ui/Button';
import { useRouter, useSearchParams } from 'next/navigation';

const Controll = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderBy = searchParams.get('order') ?? 'asc';
  const page = searchParams.get('page') ?? '1';

  return (
    <div className="flex flex-wrap items-center gap-4">
      {orderBy === 'asc' ? (
        <Button onClick={() => router.push(`/log?order=desc&page=${page}`)}>
          Giảm dần
        </Button>
      ) : (
        <Button onClick={() => router.push(`/log?order=asc&page=${page}`)}>
          Tăng dần
        </Button>
      )}
    </div>
  );
};

export default Controll;
