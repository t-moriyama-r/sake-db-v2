import Link from 'next/link';

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

type Props = {
  items: BreadcrumbItem[];
  className?: string;
};

export function Breadcrumb({ items, className }: Props) {
  return (
    <nav className={`flex flex-wrap items-center gap-1 text-sm ${className ?? ''}`}>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <span className="text-muted-foreground">›</span>}
          {item.href ? (
            <Link href={item.href} className="text-link hover:underline">
              {item.label}
            </Link>
          ) : (
            <span className="font-medium text-foreground-secondary">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

