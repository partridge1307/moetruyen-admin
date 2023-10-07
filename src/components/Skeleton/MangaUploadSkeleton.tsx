import EditorSkeleton from './EditorSkeleton';
import MangaAuthorSkeleton from './MangaAuthorSkeleton';
import MangaImageSkeleton from './MangaImageSkeleton';
import MangaTagSkeleton from './MangaTagSkeleton';

const MangaUploadSkeleton = () => {
  return (
    <div className="space-y-6 text-sm">
      <MangaImageSkeleton />

      <div className="space-y-2">
        <p>Tên truyện</p>
        <div className="h-10 rounded-md animate-pulse dark:bg-zinc-900" />
      </div>

      <div className="space-y-2">
        <p>Slug</p>
        <div className="h-10 rounded-md animate-pulse dark:bg-zinc-900" />
      </div>

      <div className="space-y-2">
        <p>Tên khác (nếu có)</p>
        <div className="h-10 rounded-md animate-pulse dark:bg-zinc-900" />
      </div>

      <MangaAuthorSkeleton />

      <MangaTagSkeleton />

      <div className="space-y-2">
        <p>Mô tả</p>
        <EditorSkeleton />
      </div>

      <div className="space-y-2">
        <p className="after:content-['*'] after:text-red-500 after:pl-0.5">
          Sơ lược
        </p>
        <div className="h-10 rounded-md animate-pulse dark:bg-zinc-900" />
      </div>

      <div className="space-y-2">
        <p>Link Facebook (Nếu có)</p>
        <div className="h-10 rounded-md animate-pulse dark:bg-zinc-900" />
      </div>

      <div className="space-y-2">
        <p>Link Discord (Nếu có)</p>
        <div className="h-10 rounded-md animate-pulse dark:bg-zinc-900" />
      </div>

      <div className="h-10 rounded-md animate-pulse dark:bg-zinc-900" />
    </div>
  );
};

export default MangaUploadSkeleton;
