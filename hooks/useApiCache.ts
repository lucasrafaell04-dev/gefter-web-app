import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/services/apiService';
import { Layout, Material, EdgeStyle, LayoutField, AutoCalculationRule, LayoutFieldGroup } from '@/types';

// Query Keys para organização do cache
export const queryKeys = {
  layouts: ['layouts'] as const,
  materials: ['materials'] as const,
  edgeStyles: ['edgeStyles'] as const,
  layoutFields: (layoutId: string) => ['layoutFields', layoutId] as const,
  autoCalculationRules: (layoutId: string) => ['autoCalculationRules', layoutId] as const,
  layoutFieldGroups: (layoutId: string) => ['layoutFieldGroups', layoutId] as const,
};

// Hook para layouts
export function useLayouts() {
  return useQuery({
    queryKey: queryKeys.layouts,
    queryFn: apiService.getLayouts,
    staleTime: 1000 * 60 * 60, // 1 hora
    gcTime: 1000 * 60 * 60 * 24, // 24 horas
  });
}

// Hook para materiais
export function useMaterials() {
  return useQuery({
    queryKey: queryKeys.materials,
    queryFn: apiService.getMaterials,
    staleTime: 1000 * 60 * 60 * 2, // 2 horas (materiais mudam menos)
    gcTime: 1000 * 60 * 60 * 24, // 24 horas
  });
}

// Hook para edge styles
export function useEdgeStyles() {
  return useQuery({
    queryKey: queryKeys.edgeStyles,
    queryFn: apiService.getEdgeStyles,
    staleTime: 1000 * 60 * 60 * 2, // 2 horas
    gcTime: 1000 * 60 * 60 * 24, // 24 horas
  });
}

// Hook para layout fields
export function useLayoutFields(layoutId: string) {
  return useQuery({
    queryKey: queryKeys.layoutFields(layoutId),
    queryFn: () => apiService.getLayoutFields(layoutId),
    staleTime: 1000 * 60 * 60, // 1 hora
    gcTime: 1000 * 60 * 60 * 24, // 24 horas
    enabled: !!layoutId, // Só executa se layoutId existir
  });
}

// Hook para auto-calculation rules
export function useAutoCalculationRules(layoutId: string) {
  return useQuery({
    queryKey: queryKeys.autoCalculationRules(layoutId),
    queryFn: () => apiService.getAutoCalculationRules(layoutId),
    staleTime: 1000 * 60 * 60, // 1 hora
    gcTime: 1000 * 60 * 60 * 24, // 24 horas
    enabled: !!layoutId,
  });
}

// Hook para layout field groups
export function useLayoutFieldGroups(layoutId: string) {
  return useQuery({
    queryKey: queryKeys.layoutFieldGroups(layoutId),
    queryFn: () => apiService.getLayoutFieldGroups(layoutId),
    staleTime: 1000 * 60 * 60, // 1 hora
    gcTime: 1000 * 60 * 60 * 24, // 24 horas
    enabled: !!layoutId,
  });
}

// Hook combinado para todos os dados de um layout
export function useLayoutData(layoutId: string) {
  const fields = useLayoutFields(layoutId);
  const rules = useAutoCalculationRules(layoutId);
  const groups = useLayoutFieldGroups(layoutId);

  return {
    fields,
    rules,
    groups,
    isLoading: fields.isLoading || rules.isLoading || groups.isLoading,
    error: fields.error || rules.error || groups.error,
  };
} 