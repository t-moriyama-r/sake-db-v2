import { Breadcrumb } from '@/components/ui/Breadcrumb/Breadcrumb';
import type { CategoryBreadcrumbItem } from '@/lib/server/categories/fetch';

type Props = {
  categoryPath: CategoryBreadcrumbItem[];
  liquorName: string;
};

export function LiquorBreadcrumb({ categoryPath, liquorName }: Props) {
  const items = [
    { label: 'ホーム', href: '/' },
    ...categoryPath.map((cat) => ({ label: cat.name, href: `/discovery/category/${cat.id}` })),
    { label: liquorName },
  ];

  return <Breadcrumb className="mb-4" items={items} />;
}

