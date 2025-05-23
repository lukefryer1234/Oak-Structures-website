// src/types/configurator.ts

// Base for all configuration options
export interface ConfigOptionBase {
  id: string; // Will be keyof SpecificConfigState
  label: string;
  type: 'select' | 'slider' | 'radio' | 'checkbox' | 'dimensions' | 'area';
  defaultValue?: any; // Needs to be specific in concrete types
  dataAiHint?: string;
}

export interface SelectOptionChoice {
  value: string;
  label: string;
  image?: string;
  dataAiHint?: string;
}

export interface SelectConfigOption extends ConfigOptionBase {
  type: 'select';
  options: SelectOptionChoice[];
  defaultValue: string;
  id: string; // keyof SpecificConfigState
}

export interface RadioConfigOption extends ConfigOptionBase {
  type: 'radio';
  options: SelectOptionChoice[];
  defaultValue: string;
  id: string; // keyof SpecificConfigState
}

export interface SliderConfigOption extends ConfigOptionBase {
  type: 'slider';
  min: number;
  max: number;
  step: number;
  defaultValue: number[]; // Slider value is an array
  id: string; // keyof SpecificConfigState
}

export interface CheckboxConfigOption extends ConfigOptionBase {
  type: 'checkbox';
  defaultValue: boolean;
  id: string; // keyof SpecificConfigState
}

export interface DimensionValue {
  length: number;
  width: number;
  thickness: number;
}
export interface DimensionConfigOption extends ConfigOptionBase {
  type: 'dimensions';
  unit: string;
  defaultValue: DimensionValue;
  id: string; // keyof SpecificConfigState
}

export interface AreaValue {
  area: number; // Direct area input
  length: string; // For L x W calculation, store as string from input
  width: string;  // For L x W calculation, store as string from input
}
export interface AreaConfigOption extends ConfigOptionBase {
  type: 'area';
  unit: string;
  defaultValue: AreaValue;
  id: string; // keyof SpecificConfigState
}

// Union type for all possible config options
export type ConfigOption =
  | SelectConfigOption
  | RadioConfigOption
  | SliderConfigOption
  | CheckboxConfigOption
  | DimensionConfigOption
  | AreaConfigOption;

// General Category Configuration Structure
export interface CategoryConfig {
  title: string;
  options: ConfigOption[]; // Array of specific option types
  image?: string;
  dataAiHint?: string;
}
