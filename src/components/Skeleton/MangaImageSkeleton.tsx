const MangaImageSkeleton = () => {
  return (
    <div className="space-y-2">
      <p className="after:content-['*'] after:text-red-500 after:pl-0.5">
        Ảnh bìa
      </p>
      <div
        className="rounded-md animate-pulse dark:bg-zinc-900"
        style={{ aspectRatio: 4 / 3 }}
      />
    </div>
  );
};

export default MangaImageSkeleton;
