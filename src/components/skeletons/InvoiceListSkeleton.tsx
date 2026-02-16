import { Skeleton } from '@/components/ui/skeleton';

export function InvoiceListSkeleton() {
  return (
    <div className="space-y-4">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between p-4 border rounded-lg bg-white">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Table Skeleton */}
      <div className="border rounded-lg bg-white">
        {/* Table Header */}
        <div className="border-b bg-gray-50">
          <div className="flex items-center px-4 py-3 space-x-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>

        {/* Table Rows */}
        {[...Array(5)].map((_, i) => (
          <div key={i} className="border-b hover:bg-gray-50 px-4 py-3">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
