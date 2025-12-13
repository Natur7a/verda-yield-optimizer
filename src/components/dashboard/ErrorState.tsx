/**
 * ErrorState Component
 * 
 * Display error message with retry option for failed AI predictions.
 */

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface ErrorStateProps {
  error: string;
  onRetry?: () => void;
  showCachedDataMessage?: boolean;
}

export function ErrorState({ error, onRetry, showCachedDataMessage = true }: ErrorStateProps) {
  return (
    <Alert variant="destructive" className="my-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Unable to Load AI Predictions</AlertTitle>
      <AlertDescription className="mt-2 space-y-2">
        <p>{error}</p>
        {showCachedDataMessage && (
          <p className="text-sm">Displaying cached data if available.</p>
        )}
        {onRetry && (
          <Button
            onClick={onRetry}
            variant="outline"
            size="sm"
            className="mt-2"
          >
            Try Again
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}
