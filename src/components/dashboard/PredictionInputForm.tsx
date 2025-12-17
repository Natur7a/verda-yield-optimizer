/**
 * PredictionInputForm Component
 * 
 * Interactive form for entering custom AI prediction parameters
 * with validation, presets, and responsive tabs layout
 */

import { useState } from 'react';
import { Brain, RotateCcw, Beaker, TrendingUp, Leaf, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { FormField } from './FormField';
import { PredictionInput } from '@/lib/api';
import {
  validationRules,
  defaultValues,
  presets,
  validateForm,
} from '@/lib/predictionPresets';

interface PredictionInputFormProps {
  onSubmit: (input: PredictionInput) => Promise<void>;
  isLoading: boolean;
  initialValues?: PredictionInput;
}

export function PredictionInputForm({
  onSubmit,
  isLoading,
  initialValues = defaultValues,
}: PredictionInputFormProps) {
  const [formData, setFormData] = useState<PredictionInput>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: keyof PredictionInput, value: number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors = validateForm(formData);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }
    await onSubmit(formData);
  };

  const resetToDefaults = () => {
    setFormData(defaultValues);
    setErrors({});
  };

  const loadPreset = (presetKey: string) => {
    const preset = presets[presetKey];
    if (preset) {
      setFormData(preset.values);
      setErrors({});
    }
  };

  const isValid = Object.keys(errors).length === 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Brain className="h-6 w-6 text-verda-primary" />
          <CardTitle>Custom Prediction Input</CardTitle>
        </div>
        <CardDescription>
          Enter your mill's specific parameters for a tailored AI prediction
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Presets */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Quick Presets:</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(presets).map(([key, preset]) => (
              <Button
                key={key}
                size="sm"
                variant="outline"
                onClick={() => loadPreset(key)}
                disabled={isLoading}
                className="gap-2"
              >
                {key === 'high-production' && <TrendingUp className="h-3 w-3" />}
                {key === 'eco-friendly' && <Leaf className="h-3 w-3" />}
                {key === 'revenue-max' && <DollarSign className="h-3 w-3" />}
                {preset.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Form Tabs */}
        <Tabs defaultValue="production" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="production">Mill Production</TabsTrigger>
            <TabsTrigger value="market">Market Conditions</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          {/* Production Parameters */}
          <TabsContent value="production" className="space-y-4 mt-4">
            <FormField
              label={validationRules.ffb.label}
              value={formData.ffb}
              onChange={(value) => handleChange('ffb', value)}
              min={validationRules.ffb.min}
              max={validationRules.ffb.max}
              step={1}
              unit={validationRules.ffb.unit}
              tooltip={validationRules.ffb.tooltip}
              error={errors.ffb}
            />
            <FormField
              label={validationRules.cpo.label}
              value={formData.cpo}
              onChange={(value) => handleChange('cpo', value)}
              min={validationRules.cpo.min}
              max={validationRules.cpo.max}
              step={0.1}
              unit={validationRules.cpo.unit}
              tooltip={validationRules.cpo.tooltip}
              error={errors.cpo}
            />
            <FormField
              label={validationRules.moisture.label}
              value={formData.moisture}
              onChange={(value) => handleChange('moisture', value)}
              min={validationRules.moisture.min}
              max={validationRules.moisture.max}
              step={0.1}
              unit={validationRules.moisture.unit}
              tooltip={validationRules.moisture.tooltip}
              error={errors.moisture}
            />
            <FormField
              label={validationRules.cv.label}
              value={formData.cv}
              onChange={(value) => handleChange('cv', value)}
              min={validationRules.cv.min}
              max={validationRules.cv.max}
              step={0.1}
              unit={validationRules.cv.unit}
              tooltip={validationRules.cv.tooltip}
              error={errors.cv}
            />
            <FormField
              label={validationRules.eff.label}
              value={formData.eff}
              onChange={(value) => handleChange('eff', value)}
              min={validationRules.eff.min}
              max={validationRules.eff.max}
              step={0.01}
              unit={validationRules.eff.unit}
              tooltip={validationRules.eff.tooltip}
              error={errors.eff}
            />
          </TabsContent>

          {/* Market Conditions */}
          <TabsContent value="market" className="space-y-4 mt-4">
            <FormField
              label={validationRules.oil_price.label}
              value={formData.oil_price}
              onChange={(value) => handleChange('oil_price', value)}
              min={validationRules.oil_price.min}
              max={validationRules.oil_price.max}
              step={1}
              unit={validationRules.oil_price.unit}
              tooltip={validationRules.oil_price.tooltip}
              error={errors.oil_price}
            />
            <FormField
              label={validationRules.demand_bio.label}
              value={formData.demand_bio}
              onChange={(value) => handleChange('demand_bio', value)}
              min={validationRules.demand_bio.min}
              max={validationRules.demand_bio.max}
              step={0.01}
              unit={validationRules.demand_bio.unit}
              tooltip={validationRules.demand_bio.tooltip}
              error={errors.demand_bio}
            />
            <FormField
              label={validationRules.carbon_tax.label}
              value={formData.carbon_tax}
              onChange={(value) => handleChange('carbon_tax', value)}
              min={validationRules.carbon_tax.min}
              max={validationRules.carbon_tax.max}
              step={0.1}
              unit={validationRules.carbon_tax.unit}
              tooltip={validationRules.carbon_tax.tooltip}
              error={errors.carbon_tax}
            />
            <FormField
              label={validationRules.demand_feed.label}
              value={formData.demand_feed}
              onChange={(value) => handleChange('demand_feed', value)}
              min={validationRules.demand_feed.min}
              max={validationRules.demand_feed.max}
              step={0.01}
              unit={validationRules.demand_feed.unit}
              tooltip={validationRules.demand_feed.tooltip}
              error={errors.demand_feed}
            />
          </TabsContent>

          {/* Advanced Parameters */}
          <TabsContent value="advanced" className="space-y-4 mt-4">
            <FormField
              label={validationRules.protein_score.label}
              value={formData.protein_score}
              onChange={(value) => handleChange('protein_score', value)}
              min={validationRules.protein_score.min}
              max={validationRules.protein_score.max}
              step={0.01}
              unit={validationRules.protein_score.unit}
              tooltip={validationRules.protein_score.tooltip}
              error={errors.protein_score}
            />
            <FormField
              label={validationRules.supply_factor.label}
              value={formData.supply_factor}
              onChange={(value) => handleChange('supply_factor', value)}
              min={validationRules.supply_factor.min}
              max={validationRules.supply_factor.max}
              step={0.01}
              unit={validationRules.supply_factor.unit}
              tooltip={validationRules.supply_factor.tooltip}
              error={errors.supply_factor}
            />
            <FormField
              label={validationRules.compost_base.label}
              value={formData.compost_base}
              onChange={(value) => handleChange('compost_base', value)}
              min={validationRules.compost_base.min}
              max={validationRules.compost_base.max}
              step={1}
              unit={validationRules.compost_base.unit}
              tooltip={validationRules.compost_base.tooltip}
              error={errors.compost_base}
            />
            <FormField
              label={validationRules.nutrient_score.label}
              value={formData.nutrient_score}
              onChange={(value) => handleChange('nutrient_score', value)}
              min={validationRules.nutrient_score.min}
              max={validationRules.nutrient_score.max}
              step={0.01}
              unit={validationRules.nutrient_score.unit}
              tooltip={validationRules.nutrient_score.tooltip}
              error={errors.nutrient_score}
            />
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
          <Button 
            onClick={handleSubmit} 
            disabled={!isValid || isLoading}
            className="flex-1 sm:flex-none"
          >
            {isLoading ? (
              <>
                <Brain className="mr-2 h-4 w-4 animate-pulse" />
                Analyzing...
              </>
            ) : (
              <>
                <Brain className="mr-2 h-4 w-4" />
                Run Prediction
              </>
            )}
          </Button>
          <Button 
            variant="outline" 
            onClick={resetToDefaults}
            disabled={isLoading}
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset to Defaults
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => loadPreset('high-production')}
            disabled={isLoading}
            className="gap-2"
          >
            <Beaker className="h-4 w-4" />
            Use Sample Data
          </Button>
        </div>

        {/* Validation Status */}
        {Object.keys(errors).length > 0 && (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <Badge variant="destructive">
              {Object.keys(errors).length} validation error{Object.keys(errors).length > 1 ? 's' : ''}
            </Badge>
            <span>Please correct the highlighted fields</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
