import Link from 'next/link';

type Props = {
  categoryId: string | null;
};

export const PostButton = ({ categoryId }: Props) => {
  const href = categoryId ? `/liquor/create/${categoryId}` : '/liquor/create';

  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 rounded-md px-2 sm:px-4 py-1.5 text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
      <span className="hidden sm:inline">投稿</span>
    </Link>
  );
};
