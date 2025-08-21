import { supabase } from '@/lib/supabase';
import { Layout, Material, EdgeStyle, LayoutField, AutoCalculationRule, LayoutFieldGroup } from '@/types';

export const apiService = {
  // Fetch all active layouts
  async getLayouts(): Promise<Layout[]> {
    const { data, error } = await supabase
      .from('layouts')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching layouts:', error);
      return [];
    }

    return data || [];
  },

  // Fetch all materials
  async getMaterials(): Promise<Material[]> {
    const { data, error } = await supabase
      .from('materials')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching materials:', error);
      return [];
    }

    return data || [];
  },

  // Fetch all active edge styles
  async getEdgeStyles(): Promise<EdgeStyle[]> {
    const { data, error } = await supabase
      .from('edge_styles')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching edge styles:', error);
      return [];
    }

    return data || [];
  },

  // Fetch layout fields for a specific layout
  async getLayoutFields(layoutId: string): Promise<LayoutField[]> {
    const { data, error } = await supabase
      .from('layout_fields')
      .select('*')
      .eq('layout_id', layoutId)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching layout fields:', error);
      return [];
    }

    return data || [];
  },

  // Fetch layout fields with auto-calculation info using the database function
  async getLayoutFieldsWithCalculations(layoutName: string) {
    const { data, error } = await supabase
      .rpc('get_layout_fields_with_calculations', { layout_name: layoutName });

    if (error) {
      console.error('Error fetching layout fields with calculations:', error);
      return [];
    }

    return data || [];
  },

  // Fetch auto-calculation rules for a layout
  async getAutoCalculationRules(layoutId: string): Promise<AutoCalculationRule[]> {
    const { data, error } = await supabase
      .from('auto_calculation_rules')
      .select('*')
      .eq('layout_id', layoutId)
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching auto-calculation rules:', error);
      return [];
    }

    return data || [];
  },

  // Fetch field groups for a layout
  async getLayoutFieldGroups(layoutId: string): Promise<LayoutFieldGroup[]> {
    const { data, error } = await supabase
      .from('layout_field_groups')
      .select('*')
      .eq('layout_id', layoutId)
      .eq('is_visible', true)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching layout field groups:', error);
      return [];
    }

    return data || [];
  },

  // Fetch field group assignments
  async getFieldGroupAssignments(fieldIds: string[]) {
    if (fieldIds.length === 0) return [];
    
    const { data, error } = await supabase
      .from('field_group_assignments')
      .select(`
        *,
        layout_field_groups!inner(*)
      `)
      .in('field_id', fieldIds)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching field group assignments:', error);
      return [];
    }

    return data || [];
  },

  // Create a new quote
  async createQuote(quoteData: any) {
    const { data, error } = await supabase
      .from('quotes')
      .insert([quoteData])
      .select();

    if (error) {
      console.error('Error creating quote:', error);
      throw error;
    }

    return data?.[0];
  },

  // Create quote items
  async createQuoteItems(quoteItems: any[]) {
    const { data, error } = await supabase
      .from('quote_items')
      .insert(quoteItems)
      .select();

    if (error) {
      console.error('Error creating quote items:', error);
      throw error;
    }

    return data;
  }
}; 