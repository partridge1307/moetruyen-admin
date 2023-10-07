import ChapterImageSkeleton from './ChapterImageSkeleton';
import ChapterIndexSkeleton from './ChapterIndexSkeleton';

const ChapterUploadSkeleton = () => {
  return (
    <div className="space-y-6 text-sm">
      <ChapterIndexSkeleton />

      <div className="space-y-2">
        <p>Tên chapter (Nếu có)</p>
        <div className="h-10 rounded-md animate-pulse dark:bg-zinc-900" />
      </div>

      <div className="space-y-2">
        <p>Volume</p>
        <div className="h-10 rounded-md animate-pulse dark:bg-zinc-900" />
      </div>

      <ChapterImageSkeleton />

      <div className="h-10 rounded-md animate-pulse dark:bg-zinc-900" />
    </div>
  );
};

export default ChapterUploadSkeleton;
