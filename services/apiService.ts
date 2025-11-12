import { Layout, Material, EdgeStyle, LayoutField, AutoCalculationRule, LayoutFieldGroup, SinkOption } from '@/types';

export const apiService = {
  // Fetch all active layouts
  async getLayouts(): Promise<Layout[]> {
    try {
      const response = await fetch('/api/layouts');
      if (!response.ok) {
        throw new Error('Failed to fetch layouts');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching layouts:', error);
      return [];
    }
  },

  // Fetch all materials
  async getMaterials(): Promise<Material[]> {
    try {
      const response = await fetch('/api/materials');
      if (!response.ok) {
        throw new Error('Failed to fetch materials');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching materials:', error);
      return [];
    }
  },

  // Fetch all active edge styles
  async getEdgeStyles(): Promise<EdgeStyle[]> {
    try {
      const response = await fetch('/api/edge-styles');
      if (!response.ok) {
        throw new Error('Failed to fetch edge styles');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching edge styles:', error);
      return [];
    }
  },

  // Fetch layout fields for a specific layout
  async getLayoutFields(layoutId: string): Promise<LayoutField[]> {
    try {
      const response = await fetch(`/api/layout-fields/${layoutId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch layout fields');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching layout fields:', error);
      return [];
    }
  },

  // Fetch auto-calculation rules for a layout
  async getAutoCalculationRules(layoutId: string): Promise<AutoCalculationRule[]> {
    try {
      const response = await fetch(`/api/auto-calculation-rules/${layoutId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch auto-calculation rules');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching auto-calculation rules:', error);
      return [];
    }
  },

  // Fetch field groups for a layout
  async getLayoutFieldGroups(layoutId: string): Promise<LayoutFieldGroup[]> {
    try {
      const response = await fetch(`/api/layout-field-groups/${layoutId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch layout field groups');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching layout field groups:', error);
      return [];
    }
  },

  // Fetch sinks filtered by environment when provided
  async getSinks(environment?: 'kitchen' | 'bathroom'): Promise<SinkOption[]> {
    try {
      const queryString = environment ? `?environment=${encodeURIComponent(environment)}` : '';
      const response = await fetch(`/api/sinks${queryString}`);
      if (!response.ok) {
        throw new Error('Failed to fetch sinks');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching sinks:', error);
      return [];
    }
  },
}; 