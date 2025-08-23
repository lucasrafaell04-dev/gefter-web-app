// Core types based on database schema

export interface Layout {
  id: string;
  name: string;
  description?: string;
  layout_image: string;
  layout_type: string;
  svg_template_name?: string;
  is_active: boolean;
  sort_order: number;
  supports_backsplash: boolean;
  supports_sink: boolean;
  supports_wall_toggle: boolean;
}

export interface LayoutField {
  id: string;
  layout_id: string;
  field_name: string;
  field_label: string;
  svg_id?: string;
  field_type: 'manual' | 'auto_calculated' | 'sink' | 'backsplash';
  data_type: 'measurement' | 'text' | 'number';
  unit_type: 'feet' | 'inches' | 'both';
  is_required: boolean;
  is_visible: boolean;
  sort_order: number;
  validation_rules?: any;
}

export interface AutoCalculationRule {
  id: string;
  layout_id: string;
  target_field_name: string;
  formula: string;
  description?: string;
  is_active: boolean;
  sort_order: number;
}

export interface FieldDependency {
  id: string;
  rule_id: string;
  source_field_name: string;
  dependency_type: 'input' | 'trigger';
}

export interface LayoutFieldGroup {
  id: string;
  layout_id: string;
  group_name: string;
  group_label: string;
  sort_order: number;
  is_visible: boolean;
}

export interface FieldGroupAssignment {
  id: string;
  field_id: string;
  group_id: string;
  sort_order: number;
}

export interface Material {
  id: string;
  supplier_id: string;
  name: string;
  brand: string;
  color: string;
  variation: string;
  thickness: number;
  price_per_sqft: number;
  created_at?: string;
  image: string;
  desc_Curta: string;
  desc_Longa: string;
  product: string;
  Seamns: string;
  Variation: string;
  Surface: string;
  Finish: string;
  Care: string;
  Seal: string;
  Warranty: string;
  Vendor: string;
}

export interface EdgeStyle {
  id: string;
  name: string;
  description: string;
  image: string;
  price_per_linear_ft: number;
  thickness: string;
  is_active: boolean;
}

export interface Quote {
  id: string;
  lead_id: string;
  total_price: number;
  layout_id: string;
  material_id: string;
}

export interface QuoteItem {
  id: string;
  quote_id: string;
  material_id: string;
  width_ft: number;
  length_ft: number;
  area_sqft: number;
  subtotal: number;
  layout_id: string;
}

// Specification types for the new step
export interface CutoutOption {
  id: string;
  name: string;
  description: string;
  image: string;
  included: boolean;
  price?: number;
}

export interface SinkOption {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  included: boolean;
}

export interface ShapeSpecification {
  keepCurrentCabinets?: 'yes' | 'no';
  countertopToRemove?: string;
  hasHolesOrCuts?: 'yes' | 'no';
  cutouts?: {
    [cutoutId: string]: number; // cutoutId -> quantity
  };
  sinks?: {
    [sinkId: string]: number; // sinkId -> quantity
  };
}

// Lead information types
export interface LeadInfo {
  fullName: string;
  email: string;
  confirmEmail: string;
  phone: string;
  streetAddress: string;
  zipCode: string;
  city: string;
  state: string;
}

// Application state types
export interface WallToggles {
  // Standard wall toggles for all layouts
  [fieldName: string]: boolean | undefined;
  // Special wall toggles for Island and SingleWall
  wallOnLeft?: boolean;
  wallOnRight?: boolean;
}

export interface SelectedShape {
  layout: Layout;
  measurements: Record<string, number>;
  wallToggles: WallToggles;
  hasBacksplash: boolean;
  backsplashHeight?: number;
  specification?: ShapeSpecification;
}

export interface EdgeCalculation {
  linearFeet: number;
  edgePrice: number;
  totalEdgeCost: number;
  excludedWalls: string[];
}

export interface MaterialCalculation {
  squareFeet: number;
  materialPrice: number;
  totalMaterialCost: number;
}

export interface ProjectState {
  selectedRoom: 'kitchen' | 'bathroom' | null;
  selectedShapes: SelectedShape[];
  selectedMaterial: Material | null;
  selectedEdgeStyle: EdgeStyle | null;
  leadInfo: LeadInfo | null;
  currentStep: number;
  totalSteps: number;
}

export interface MeasurementField {
  name: string;
  label: string;
  value: number;
  unit: string;
  isWall: boolean;
  hasWallToggle: boolean;
}

// Room types
export type RoomType = 'kitchen' | 'bathroom';

// Shape types
export type ShapeType = 'L-shape' | 'U-shape' | 'Straight' | 'Island' | 'Angled'; 