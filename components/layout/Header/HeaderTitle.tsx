import Link from 'next/link';
import { routes } from '@/lib/routes';

export const HeaderTitle = () => {
  return (
    <Link
      href={routes.home()}
      className="shrink-0 text-lg font-bold text-primary hover:text-primary-hover"
    >
      🍶 sake-db
    </Link>
  );
};
