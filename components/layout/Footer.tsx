import Link from 'next/link';

export const Footer = () => {
  return (
    <footer className="mt-auto border-t bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex flex-col items-center gap-4 text-sm text-gray-500 md:flex-row md:justify-between">
          <p>© {new Date().getFullYear()} sake-db. All rights reserved.</p>
          <nav className="flex gap-4">
            <Link href="/discovery/category" className="hover:text-gray-700">カテゴリ</Link>
            <Link href="/discovery/search" className="hover:text-gray-700">検索</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
