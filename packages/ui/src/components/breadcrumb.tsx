import { cn } from '@legalhub/utils';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  isCurrent?: boolean;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center text-xs text-slate-500', className)}>
      <ol className="flex items-center space-x-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={`crumb-${index}`} className="flex items-center space-x-2">
              {item.href && !isLast ? (
                <a href={item.href} className="hover:text-blue-700 hover:underline transition-colors">
                  {item.label}
                </a>
              ) : (
                <span className={cn(isLast && 'font-semibold text-slate-900', 'truncate max-w-[200px]')}>
                  {item.label}
                </span>
              )}
              {!isLast && <ChevronRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
