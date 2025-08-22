import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ProjectState, SelectedShape, Material, EdgeStyle, RoomType, ShapeSpecification } from '@/types';

interface ProjectStore extends ProjectState {
  // Actions
  setSelectedRoom: (room: RoomType) => void;
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
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  previousStep: () => void;
  resetProject: () => void;
  calculateTotalPrice: () => number;
}

const initialState: ProjectState = {
  selectedRoom: null,
  selectedShapes: [],
  selectedMaterial: null,
  selectedEdgeStyle: null,
  currentStep: 1,
  totalSteps: 8, // Updated to include specification step
};

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setSelectedRoom: (room) => set({ selectedRoom: room }),

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
          // Calculate area for each shape
          const measurements = shape.measurements;
          let area = 0;

          // Convert inches to feet for area calculations (inputs are in inches)
          const inchesToFeet = (value: number) => value / 12;

          // Basic area calculation (values provided in inches)
          if (shape.layout.layout_type === 'L-shape') {
            const widthA = inchesToFeet(measurements['width_a'] || 0);
            const widthB = inchesToFeet(measurements['width_b'] || 0);
            const depthA = inchesToFeet(measurements['depth_a'] || 0);
            const depthB = inchesToFeet(measurements['depth_b'] || 0);
            area = (widthA * depthA) + (widthB * depthB);
          } else if (shape.layout.layout_type === 'U-shape') {
            const widthA = inchesToFeet(measurements['width_a'] || 0);
            const widthB = inchesToFeet(measurements['width_b'] || 0);
            const widthC = inchesToFeet(measurements['width_c'] || 0);
            const depth = inchesToFeet(measurements['depth'] || 0);
            area = (widthA + widthB + widthC) * depth;
          }

          // Add backsplash area if enabled
          if (shape.hasBacksplash && shape.backsplashHeight) {
            const perimeterInFeet = Object.values(measurements).reduce((sum, val) => sum + (val || 0), 0) / 12;
            area += perimeterInFeet * (shape.backsplashHeight / 12); // Convert inches to feet
          }

          // Calculate material cost
          if (selectedMaterial) {
            total += area * selectedMaterial.price_per_sqft;
          }

          // Calculate edge cost (only for non-wall measurements)
          if (selectedEdgeStyle) {
            let edgeLength = 0;
            Object.entries(shape.wallToggles).forEach(([field, isWall]) => {
              if (!isWall && measurements[field]) {
                edgeLength += (measurements[field] || 0) / 12; // inches to feet
              }
            });
            total += edgeLength * selectedEdgeStyle.price_per_linear_ft;
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