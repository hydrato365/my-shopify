// components/ProductCardSkeleton.tsx

export default function ProductCardSkeleton() {
  return (
    <div className="flex flex-col h-full overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
      {/* Image Skeleton */}
      <div className="relative w-full aspect-square bg-gray-200 dark:bg-gray-800 animate-pulse" />
      
      {/* Text Skeleton */}
      <div className="flex flex-1 flex-col p-3 sm:p-4 border-t border-gray-100 dark:border-gray-800">
        <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded mt-2 animate-pulse" />
      </div>
    </div>
  );
}