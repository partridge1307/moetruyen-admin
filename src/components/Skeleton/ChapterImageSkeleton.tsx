const ChapterImageSkeleton = () => {
  return (
    <div className="space-y-2">
      <p className="after:content-['*'] after:pl-0.5 after:text-red-500">Ảnh</p>

      <div className="flex flex-wrap items-center space-x-6">
        <div className="w-28 h-10 rounded-md animate-pulse dark:bg-zinc-900" />
        <div className="w-40 h-10 rounded-md animate-pulse dark:bg-zinc-900" />
      </div>
    </div>
  );
};

export default ChapterImageSkeleton;
