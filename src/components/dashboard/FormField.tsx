/**
 * FormField Component
 * 
 * Reusable input field with label, validation, tooltip, and optional slider
 */

import { Info } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface FormFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  tooltip?: string;
  error?: string;
  showSlider?: boolean;
}

export function FormField({
  label,
  value,
  onChange,
  min,
  max,
  step = 0.01,
  unit,
  tooltip,
  error,
  showSlider = true,
}: FormFieldProps) {
  const hasError = !!error;
  const isValid = !hasError && value >= min && value <= max;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    if (!isNaN(newValue)) {
      onChange(newValue);
    }
  };

  const handleSliderChange = (values: number[]) => {
    onChange(values[0]);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Label className={cn(hasError && 'text-destructive')}>
            {label}
          </Label>
          {tooltip && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-sm">{tooltip}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Range: {min} - {max}{unit ? ` ${unit}` : ''}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={value}
            onChange={handleInputChange}
            min={min}
            max={max}
            step={step}
            className={cn(
              'w-28 text-right',
              hasError && 'border-destructive focus-visible:ring-destructive',
              isValid && 'border-verda-mint focus-visible:ring-verda-mint'
            )}
          />
          {unit && (
            <span className="text-sm text-muted-foreground min-w-[60px]">
              {unit}
            </span>
          )}
        </div>
      </div>

      {showSlider && (
        <div className="space-y-1">
          <Slider
            min={min}
            max={max}
            step={step}
            value={[value]}
            onValueChange={handleSliderChange}
            className={cn(hasError && 'opacity-50')}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{min}</span>
            <span>{max}</span>
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
