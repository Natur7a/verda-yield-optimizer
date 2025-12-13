/**
 * RefreshButton Component
 * 
 * Button for manually refreshing AI prediction data with loading state
 * and last updated timestamp display.
 */

import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface RefreshButtonProps {
  onRefresh: () => void | Promise<void>;
  isLoading: boolean;
  lastUpdated: Date | null;
}

export function RefreshButton({ onRefresh, isLoading, lastUpdated }: RefreshButtonProps) {
  const lastUpdatedText = lastUpdated 
    ? `Updated ${formatDistanceToNow(lastUpdated, { addSuffix: true })}`
    : 'Never updated';

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-muted-foreground hidden sm:inline">
        {lastUpdatedText}
      </span>
      <Button
        onClick={onRefresh}
        disabled={isLoading}
        variant="outline"
        size="sm"
        className="gap-2"
      >
        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        <span className="hidden sm:inline">Refresh</span>
      </Button>
    </div>
  );
}
