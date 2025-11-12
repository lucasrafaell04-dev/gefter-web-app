import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { Layout, Material, EdgeStyle, LayoutField, AutoCalculationRule, LayoutFieldGroup, SinkOption } from '@/types';

export const prismaService = {
  // Fetch all active layouts
  async getLayouts(): Promise<Layout[]> {
    try {
      const layouts = await prisma.layouts.findMany({
        where: {
          is_active: true,
        },
        orderBy: {
          sort_order: 'asc',
        },
      });

      return layouts.map(layout => ({
        id: layout.id,
        name: layout.name,
        description: layout.description || '',
        layout_image: layout.layout_image,
        layout_type: layout.layout_type,
        svg_template_name: layout.svg_template_name || '',
        is_active: layout.is_active,
        sort_order: layout.sort_order,
        supports_backsplash: layout.supports_backsplash,
        supports_sink: layout.supports_sink,
        supports_wall_toggle: layout.supports_wall_toggle,
      }));
    } catch (error) {
      console.error('Error fetching layouts:', error);
      return [];
    }
  },

  // Fetch all materials
  async getMaterials(): Promise<Material[]> {
    try {
      const materials = await prisma.materials.findMany({
        orderBy: {
          name: 'asc',
        },
      });

      return materials.map(material => ({
        id: material.id,
        supplier_id: material.supplier_id || '',
        name: material.name,
        brand: material.brand,
        color: material.color,
        variation: material.variation,
        thickness: material.thickness,
        price_per_sqft: material.price_per_sqft,
        created_at: material.created_at?.toISOString(),
        image: material.image || '',
        desc_Curta: material.desc_Curta || '',
        desc_Longa: material.desc_Longa || '',
        product: material.product || '',
        Seamns: material.Seamns || '',
        Variation: material.Variation || '',
        Surface: material.Surface || '',
        Finish: material.Finish || '',
        Care: material.Care || '',
        Seal: material.Seal || '',
        Warranty: material.Warranty || '',
        Vendor: material.Vendor || '',
      }));
    } catch (error) {
      console.error('Error fetching materials:', error);
      return [];
    }
  },

  // Fetch all active edge styles
  async getEdgeStyles(): Promise<EdgeStyle[]> {
    try {
      const edgeStyles = await prisma.edge_styles.findMany({
        where: {
          is_active: true,
        },
        orderBy: {
          sort_order: 'asc',
        },
      });

      return edgeStyles.map(edgeStyle => ({
        id: edgeStyle.id,
        name: edgeStyle.name,
        description: edgeStyle.description || '',
        image: edgeStyle.image || '',
        price_per_linear_ft: parseFloat(edgeStyle.price_per_linear_ft.toString()),
        thickness: edgeStyle.thickness,
        is_active: edgeStyle.is_active,
      }));
    } catch (error) {
      console.error('Error fetching edge styles:', error);
      return [];
    }
  },

  // Fetch layout fields for a specific layout
  async getLayoutFields(layoutId: string): Promise<LayoutField[]> {
    try {
      const fields = await prisma.layout_fields.findMany({
        where: {
          layout_id: layoutId,
        },
        orderBy: {
          sort_order: 'asc',
        },
      });

      return fields.map(field => ({
        id: field.id,
        layout_id: field.layout_id,
        field_name: field.field_name,
        field_label: field.field_label,
        svg_id: field.svg_id || '',
        field_type: field.field_type as 'manual' | 'auto_calculated' | 'sink' | 'backsplash',
        data_type: field.data_type as 'measurement' | 'text' | 'number',
        unit_type: field.unit_type as 'feet' | 'inches' | 'both',
        is_required: field.is_required,
        is_visible: field.is_visible,
        sort_order: field.sort_order,
        validation_rules: field.validation_rules,
      }));
    } catch (error) {
      console.error('Error fetching layout fields:', error);
      return [];
    }
  },

  // Fetch auto-calculation rules for a layout
  async getAutoCalculationRules(layoutId: string): Promise<AutoCalculationRule[]> {
    try {
      const rules = await prisma.auto_calculation_rules.findMany({
        where: {
          layout_id: layoutId,
          is_active: true,
        },
        orderBy: {
          sort_order: 'asc',
        },
      });

      return rules.map(rule => ({
        id: rule.id,
        layout_id: rule.layout_id,
        target_field_name: rule.target_field_name,
        formula: rule.formula,
        description: rule.description || '',
        is_active: rule.is_active,
        sort_order: rule.sort_order,
      }));
    } catch (error) {
      console.error('Error fetching auto-calculation rules:', error);
      return [];
    }
  },

  // Fetch field groups for a layout
  async getLayoutFieldGroups(layoutId: string): Promise<LayoutFieldGroup[]> {
    try {
      const groups = await prisma.layout_field_groups.findMany({
        where: {
          layout_id: layoutId,
          is_visible: true,
        },
        orderBy: {
          sort_order: 'asc',
        },
      });

      return groups.map(group => ({
        id: group.id,
        layout_id: group.layout_id,
        group_name: group.group_name,
        group_label: group.group_label,
        sort_order: group.sort_order,
        is_visible: group.is_visible,
      }));
    } catch (error) {
      console.error('Error fetching layout field groups:', error);
      return [];
    }
  },

  // Fetch sinks filtered by environment when provided
  async getSinks(environment?: 'kitchen' | 'bathroom'): Promise<SinkOption[]> {
    try {
      const sinks = await (prisma as unknown as {
        sinks: {
          findMany: (args: any) => Promise<Array<{
            id: string;
            name: string | null;
            price: Prisma.Decimal | number | null;
            environment: string | null;
            asset_url: string | null;
          }>>;
        };
      }).sinks.findMany({
        where: environment ? { environment: environment.toUpperCase() } : undefined,
        orderBy: {
          name: 'asc',
        },
      });

      return sinks.map((sink) => ({
        id: sink.id,
        name: sink.name || 'Sink',
        description: '',
        assetUrl: sink.asset_url || '',
        price: sink.price ? Number(sink.price) : 0,
        environment: (sink.environment || 'kitchen') as 'kitchen' | 'bathroom',
        included: Number(sink.price || 0) === 0,
      }));
    } catch (error) {
      console.error('Error fetching sinks:', error);
      return [];
    }
  },
}; 