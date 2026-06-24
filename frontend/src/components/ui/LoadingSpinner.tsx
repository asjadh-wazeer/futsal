import clsx from 'clsx';

interface Props {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function LoadingSpinner({ size = 'md', className }: Props) {
  return (
    <div className={clsx('flex items-center justify-center', className)}>
      <div className={clsx(
        'animate-spin rounded-full border-2 border-brand-600 border-t-transparent',
        size === 'sm' && 'w-4 h-4',
        size === 'md' && 'w-8 h-8',
        size === 'lg' && 'w-12 h-12',
      )} />
    </div>
  );
}
