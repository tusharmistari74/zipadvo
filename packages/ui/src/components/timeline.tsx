import { cn } from '@legalhub/utils';
import { Check, Clock, AlertCircle } from 'lucide-react';

export interface TimelineEvent {
  id: string;
  title: string;
  description?: string;
  timestamp?: string;
  status: 'completed' | 'current' | 'pending' | 'failed';
}

export interface TimelineProps {
  events: TimelineEvent[];
  className?: string;
}

export function Timeline({ events, className }: TimelineProps) {
  return (
    <div className={cn('relative pl-6 space-y-6', className)}>
      {/* Connecting Vertical Line */}
      <div className="absolute left-[11px] top-3 bottom-3 w-0.5 bg-slate-200" />

      {events.map((event) => {
        const iconStyles = {
          completed: 'bg-emerald-600 text-white border-emerald-600',
          current: 'bg-blue-600 text-white border-blue-600 ring-4 ring-blue-100 animate-pulse',
          pending: 'bg-white text-slate-400 border-slate-300',
          failed: 'bg-rose-600 text-white border-rose-600',
        };

        return (
          <div key={event.id} className="relative flex items-start gap-4">
            {/* Status Dot */}
            <div
              className={cn(
                'absolute -left-6 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold z-10 transition-colors',
                iconStyles[event.status],
              )}
            >
              {event.status === 'completed' && <Check className="h-3.5 w-3.5" />}
              {event.status === 'current' && <Clock className="h-3.5 w-3.5" />}
              {event.status === 'failed' && <AlertCircle className="h-3.5 w-3.5" />}
            </div>

            {/* Event Details */}
            <div className="flex-1 pt-0.5">
              <div className="flex items-center justify-between gap-2">
                <h5 className="text-sm font-semibold text-slate-900">{event.title}</h5>
                {event.timestamp && <time className="text-xs text-slate-400 shrink-0">{event.timestamp}</time>}
              </div>
              {event.description && <p className="text-xs text-slate-600 mt-1">{event.description}</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
