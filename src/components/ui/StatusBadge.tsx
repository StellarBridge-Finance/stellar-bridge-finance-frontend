import clsx from 'clsx';

const variants: Record<string, string> = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Approved: 'bg-blue-100 text-blue-800',
  Executed: 'bg-green-100 text-green-800',
  Cancelled: 'bg-red-100 text-red-800',
  Whitelisted: 'bg-green-100 text-green-800',
  Revoked: 'bg-red-100 text-red-800',
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variants[status] ?? 'bg-gray-100 text-gray-800'
      )}
    >
      {status}
    </span>
  );
}
