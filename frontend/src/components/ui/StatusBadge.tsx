import clsx from 'clsx';

const statusConfig = {
  PENDING:   { label: 'Pending',   class: 'bg-yellow-100 text-yellow-700' },
  CONFIRMED: { label: 'Confirmed', class: 'bg-green-100 text-green-700' },
  CANCELLED: { label: 'Cancelled', class: 'bg-red-100 text-red-700' },
  COMPLETED: { label: 'Completed', class: 'bg-blue-100 text-blue-700' },
  NO_SHOW:   { label: 'No Show',   class: 'bg-gray-100 text-gray-600' },
  PAID:      { label: 'Paid',      class: 'bg-green-100 text-green-700' },
  FAILED:    { label: 'Failed',    class: 'bg-red-100 text-red-700' },
  REFUNDED:  { label: 'Refunded',  class: 'bg-purple-100 text-purple-700' },
};

export default function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status as keyof typeof statusConfig] || { label: status, class: 'bg-gray-100 text-gray-600' };
  return (
    <span className={clsx('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', cfg.class)}>
      {cfg.label}
    </span>
  );
}
