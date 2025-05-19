import clsx from 'clsx';

interface LoadingSpinnerProps {
  className?: string;
}

export default function LoadingSpinner({ className }: LoadingSpinnerProps) {
  return (
    <div className={clsx('flex flex-col items-center justify-center p-12', className)}>
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
      <span className="mt-4 text-lg font-medium text-blue-900">Analyzing Resumes...</span>
      <p className="text-sm text-blue-600 mt-2">This may take a few moments</p>
    </div>
  );
}