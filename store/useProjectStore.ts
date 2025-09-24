import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ProjectState, SelectedShape, Material, EdgeStyle, RoomType, ShapeSpecification, LeadInfo } from '@/types';
import { PreloadedData } from '@/services/dataPreloader';
import { CalculationEngine } from '@/utils/calculations';

interface ProjectStore extends ProjectState {
  // Preloaded data
  preloadedData: PreloadedData | null;
  
  // Actions
  setPreloadedData: (data: PreloadedData) => void;
  setSelectedEnvironments: (environments: ('kitchen' | 'bathroom')[]) => void;
  toggleEnvironment: (environment: 'kitchen' | 'bathroom') => void;
  addSelectedShape: (shape: SelectedShape) => void;
  removeSelectedShape: (index: number) => void;
  updateShapeMeasurements: (shapeIndex: number, measurements: Record<string, number>) => void;
  updateShapeWallToggles: (shapeIndex: number, wallToggles: Record<string, boolean>) => void;
  setShapeBacksplash: (shapeIndex: number, hasBacksplash: boolean, height?: number) => void;
  updateShapeSpecification: (shapeIndex: number, specification: Partial<ShapeSpecification>) => void;
  updateShapeCutoutQuantity: (shapeIndex: number, cutoutId: string, quantity: number) => void;
  updateShapeSinkQuantity: (shapeIndex: number, sinkId: string, quantity: number) => void;
  setSelectedMaterial: (material: Material) => void;
  setSelectedEdgeStyle: (edgeStyle: EdgeStyle) => void;
  setLeadInfo: (leadInfo: LeadInfo) => void;
  updateLeadInfo: (updates: Partial<LeadInfo>) => void;
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  previousStep: () => void;
  resetProject: () => void;
  calculateTotalPrice: () => number;
  calculatePriceByEnvironment: () => { kitchen: number; bathroom: number; total: number };
}

const initialState: ProjectState = {
  selectedEnvironments: [],
  selectedShapes: [],
  selectedMaterial: null,
  selectedEdgeStyle: null,
  leadInfo: null,
  currentStep: 1,
  totalSteps: 10, // Updated to include lead insertion steps
};

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      preloadedData: null,

      setPreloadedData: (data) => set({ preloadedData: data }),

      setSelectedEnvironments: (environments) => set({ selectedEnvironments: environments }),

      toggleEnvironment: (environment) => set((state) => {
        const currentEnvironments = state.selectedEnvironments;
        const isSelected = currentEnvironments.includes(environment);
        
        if (isSelected) {
          return { 
            selectedEnvironments: currentEnvironments.filter(env => env !== environment),
            selectedShapes: state.selectedShapes.filter(shape => shape.environment !== environment)
          };
        } else {
          return { 
            selectedEnvironments: [...currentEnvironments, environment]
          };
        }
      }),

      addSelectedShape: (shape) => 
        set((state) => ({ 
          selectedShapes: [...state.selectedShapes, shape] 
        })),

      removeSelectedShape: (index) =>
        set((state) => ({
          selectedShapes: state.selectedShapes.filter((_, i) => i !== index)
        })),

      updateShapeMeasurements: (shapeIndex, measurements) =>
        set((state) => {
          const newShapes = [...state.selectedShapes];
          const currentShape = newShapes[shapeIndex];
          
          // Only update if measurements actually changed
          const hasChanges = Object.keys(measurements).some(
            key => currentShape.measurements[key] !== measurements[key]
          );
          
          if (!hasChanges) return state; // No changes, don't update
          
          newShapes[shapeIndex] = {
            ...currentShape,
            measurements: { ...currentShape.measurements, ...measurements }
          };
          
          return { selectedShapes: newShapes };
        }),

      updateShapeWallToggles: (shapeIndex, wallToggles) =>
        set((state) => {
          const newShapes = [...state.selectedShapes];
          const currentShape = newShapes[shapeIndex];
          
          // Only update if wall toggles actually changed
          const hasChanges = Object.keys(wallToggles).some(
            key => currentShape.wallToggles[key] !== wallToggles[key]
          );
          
          if (!hasChanges) return state; // No changes, don't update
          
          newShapes[shapeIndex] = {
            ...currentShape,
            wallToggles: { ...currentShape.wallToggles, ...wallToggles }
          };
          
          return { selectedShapes: newShapes };
        }),

      setShapeBacksplash: (shapeIndex, hasBacksplash, height) =>
        set((state) => {
          const newShapes = [...state.selectedShapes];
          const currentShape = newShapes[shapeIndex];
          
          // Only update if backsplash settings actually changed
          if (currentShape.hasBacksplash === hasBacksplash && 
              currentShape.backsplashHeight === height) {
            return state; // No changes, don't update
          }
          
          newShapes[shapeIndex] = {
            ...currentShape,
            hasBacksplash,
            backsplashHeight: height
          };
          
          return { selectedShapes: newShapes };
        }),

      updateShapeSpecification: (shapeIndex, specification) =>
        set((state) => {
          const newShapes = [...state.selectedShapes];
          const currentShape = newShapes[shapeIndex];
          
          newShapes[shapeIndex] = {
            ...currentShape,
            specification: {
              ...currentShape.specification,
              ...specification
            }
          };
          
          return { selectedShapes: newShapes };
        }),

      updateShapeCutoutQuantity: (shapeIndex, cutoutId, quantity) =>
        set((state) => {
          const newShapes = [...state.selectedShapes];
          const currentShape = newShapes[shapeIndex];
          
          newShapes[shapeIndex] = {
            ...currentShape,
            specification: {
              ...currentShape.specification,
              cutouts: {
                ...currentShape.specification?.cutouts,
                [cutoutId]: quantity
              }
            }
          };
          
          return { selectedShapes: newShapes };
        }),

      updateShapeSinkQuantity: (shapeIndex, sinkId, quantity) =>
        set((state) => {
          const newShapes = [...state.selectedShapes];
          const currentShape = newShapes[shapeIndex];
          
          newShapes[shapeIndex] = {
            ...currentShape,
            specification: {
              ...currentShape.specification,
              sinks: {
                ...currentShape.specification?.sinks,
                [sinkId]: quantity
              }
            }
          };
          
          return { selectedShapes: newShapes };
        }),

      setSelectedMaterial: (material) => set({ selectedMaterial: material }),

      setSelectedEdgeStyle: (edgeStyle) => set({ selectedEdgeStyle: edgeStyle }),

      setLeadInfo: (leadInfo) => set({ leadInfo }),

      updateLeadInfo: (updates) =>
        set((state) => ({
          leadInfo: state.leadInfo ? { ...state.leadInfo, ...updates } : updates as LeadInfo
        })),

      setCurrentStep: (step) => set({ currentStep: step }),

      nextStep: () => {
        const { currentStep, totalSteps } = get();
        if (currentStep < totalSteps) {
          set({ currentStep: currentStep + 1 });
        }
      },

      previousStep: () => {
        const { currentStep } = get();
        if (currentStep > 1) {
          set({ currentStep: currentStep - 1 });
        }
      },

      resetProject: () => set(initialState),

      calculateTotalPrice: () => {
        const { selectedShapes, selectedMaterial, selectedEdgeStyle } = get();
        let total = 0;

        selectedShapes.forEach((shape) => {
          // Use the CalculationEngine for consistent calculations
          const squareFeet = CalculationEngine.calculateSquareFeet(shape.layout, shape.measurements);
          
          // Calculate material cost
          if (selectedMaterial) {
            total += squareFeet * selectedMaterial.price_per_sqft;
          }

          // Calculate edge cost using the same logic as ProjectSummary
          if (selectedEdgeStyle) {
            const edgeCalculation = CalculationEngine.calculateEdgeLinearFeet(
              shape.measurements, 
              shape.wallToggles, 
              shape.layout.name
            );
            const finalEdgeCalculation = CalculationEngine.calculateEdgeCost(edgeCalculation, selectedEdgeStyle);
            total += finalEdgeCalculation.totalEdgeCost;
          }

          // Add specification costs (cutouts, sinks, etc.)
          if (shape.specification) {
            // Add cutout costs
            Object.entries(shape.specification.cutouts || {}).forEach(([cutoutId, quantity]) => {
              // This would be calculated based on actual cutout pricing
              // For now, we'll add a placeholder cost
              total += quantity * 50; // $50 per cutout
            });

            // Add sink costs
            Object.entries(shape.specification.sinks || {}).forEach(([sinkId, quantity]) => {
              // This would be calculated based on actual sink pricing
              // For now, we'll add a placeholder cost
              total += quantity * 200; // $200 per sink
            });
          }
        });

        return total;
      },

      // New method to calculate price by environment
      calculatePriceByEnvironment: () => {
        const { selectedShapes, selectedMaterial, selectedEdgeStyle } = get();
        const kitchenShapes = selectedShapes.filter(shape => shape.environment === 'kitchen');
        const bathroomShapes = selectedShapes.filter(shape => shape.environment === 'bathroom');
        
        const calculateEnvironmentTotal = (shapes: SelectedShape[]) => {
          let total = 0;
          shapes.forEach((shape) => {
            const squareFeet = CalculationEngine.calculateSquareFeet(shape.layout, shape.measurements);
            
            if (selectedMaterial) {
              total += squareFeet * selectedMaterial.price_per_sqft;
            }

            if (selectedEdgeStyle) {
              const edgeCalculation = CalculationEngine.calculateEdgeLinearFeet(
                shape.measurements, 
                shape.wallToggles, 
                shape.layout.name
              );
              const finalEdgeCalculation = CalculationEngine.calculateEdgeCost(edgeCalculation, selectedEdgeStyle);
              total += finalEdgeCalculation.totalEdgeCost;
            }

            if (shape.specification) {
              Object.entries(shape.specification.cutouts || {}).forEach(([cutoutId, quantity]) => {
                total += quantity * 50;
              });
              Object.entries(shape.specification.sinks || {}).forEach(([sinkId, quantity]) => {
                total += quantity * 200;
              });
            }
          });
          return total;
        };

        return {
          kitchen: calculateEnvironmentTotal(kitchenShapes),
          bathroom: calculateEnvironmentTotal(bathroomShapes),
          total: calculateEnvironmentTotal(selectedShapes)
        };
      },
    }),
    {
      name: 'gefter-project-storage',
      storage: {
        getItem: (name) => {
          const str = sessionStorage.getItem(name);
          if (!str) return null;
          try {
            return JSON.parse(str);
          } catch {
            return null;
          }
        },
        setItem: (name, value) => {
          sessionStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          sessionStorage.removeItem(name);
        },
      },
    }
  )
); 