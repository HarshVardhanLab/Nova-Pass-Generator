interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
}

/** Single shimmer block */
export function SkeletonBlock({ className = '', width = '100%', height = '14px' }: SkeletonProps) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ width, height }}
    />
  );
}

/** Stat card skeleton (used on Dashboard) */
export function SkeletonStatCard() {
  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1 space-y-3">
          <SkeletonBlock width="60%" height="12px" />
          <SkeletonBlock width="40%" height="32px" />
        </div>
        <div className="skeleton skeleton-avatar w-12 h-12 rounded-xl ml-4" />
      </div>
    </div>
  );
}

/** Event card skeleton */
export function SkeletonEventCard() {
  return (
    <div className="glass-card p-6 space-y-4">
      <div className="flex items-start justify-between">
        <SkeletonBlock width="55%" height="20px" />
        <div className="skeleton w-6 h-6 rounded" />
      </div>
      <SkeletonBlock width="90%" height="12px" />
      <SkeletonBlock width="70%" height="12px" />
      <div className="flex gap-3 pt-1">
        <SkeletonBlock width="80px" height="10px" />
        <SkeletonBlock width="100px" height="10px" />
      </div>
    </div>
  );
}

/** Table row skeleton */
export function SkeletonTableRow({ cols = 4 }: { cols?: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <SkeletonBlock width={`${60 + Math.random() * 30}%`} height="12px" />
        </td>
      ))}
    </tr>
  );
}

/** Full list skeleton (multiple cards) */
export function SkeletonCardGrid({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonEventCard key={i} />
      ))}
    </div>
  );
}

/** Stat grid skeleton (4 cards) */
export function SkeletonStatGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <SkeletonStatCard key={i} />
      ))}
    </div>
  );
}

/** Page header skeleton */
export function SkeletonPageHeader() {
  return (
    <div className="space-y-2">
      <SkeletonBlock width="200px" height="30px" />
      <SkeletonBlock width="300px" height="14px" />
    </div>
  );
}
