type SpinnerProps = { size?: 'sm' | 'md' | 'lg' };

const sizeClasses = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' };

export const Spinner = ({ size = 'md' }: SpinnerProps) => {
  return (
    <div
      className={`${sizeClasses[size]} animate-spin rounded-full border-4 border-current border-t-transparent text-blue-600`}
      role="status"
      aria-label="読み込み中"
    />
  );
}
