import { cn } from '@legalhub/utils';

export interface AvatarProps {
  src?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'offline' | 'busy';
  className?: string;
}

export function Avatar({ src, name, size = 'md', status, className }: AvatarProps) {
  const sizeStyles = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-16 w-16 text-lg',
  };

  const statusDotSizes = {
    sm: 'h-2 w-2 ring-1',
    md: 'h-2.5 w-2.5 ring-2',
    lg: 'h-3 w-3 ring-2',
    xl: 'h-4 w-4 ring-2',
  };

  const statusColors = {
    online: 'bg-emerald-500',
    offline: 'bg-slate-400',
    busy: 'bg-amber-500',
  };

  const getInitials = (fullName?: string) => {
    if (!fullName) return 'LH';
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) return parts[0]?.slice(0, 2).toUpperCase() || 'LH';
    return `${parts[0]?.[0] || ''}${parts[parts.length - 1]?.[0] || ''}`.toUpperCase();
  };

  return (
    <div className={cn('relative inline-flex shrink-0 select-none items-center justify-center rounded-full bg-slate-100 font-semibold text-slate-700 overflow-hidden border border-slate-200', sizeStyles[size], className)}>
      {src ? (
        <img src={src} alt={name || 'User avatar'} className="h-full w-full object-cover" />
      ) : (
        <span>{getInitials(name)}</span>
      )}
      {status && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full ring-white',
            statusDotSizes[size],
            statusColors[status],
          )}
        />
      )}
    </div>
  );
}
