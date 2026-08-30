import { Breadcrumb } from '@/components/ui/Breadcrumb/Breadcrumb';
import { routes } from '@/lib/routes';
import type { CategoryBreadcrumbItem } from '@/lib/server/categories/fetch';

type Props = {
  categoryPath: CategoryBreadcrumbItem[];
  liquorName: string;
};

export function LiquorBreadcrumb({ categoryPath, liquorName }: Props) {
  const items = [
    { label: 'ホーム', href: routes.home() },
    ...categoryPath.map((cat) => ({ label: cat.name, href: routes.discovery.category(cat.id) })),
    { label: liquorName },
  ];

  return <Breadcrumb items={items} />;
}
