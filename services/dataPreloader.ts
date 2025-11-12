import { apiService } from './api';
import { Layout, Material, EdgeStyle, LayoutField, AutoCalculationRule, SinkOption } from '@/types';

export interface PreloadedData {
  layouts: Layout[];
  materials: Material[];
  edgeStyles: EdgeStyle[];
  layoutFields: { [layoutId: string]: LayoutField[] };
  autoCalculationRules: { [layoutId: string]: AutoCalculationRule[] };
  layoutFieldGroups: { [layoutId: string]: any[] };
  sinksByEnvironment: {
    kitchen: SinkOption[];
    bathroom: SinkOption[];
  };
  sinkMap: Record<string, SinkOption>;
}

export class DataPreloader {
  private static instance: DataPreloader;
  private preloadedData: PreloadedData | null = null;
  private isLoading = false;
  private loadPromise: Promise<PreloadedData> | null = null;
  private onDataReadyCallback: ((data: PreloadedData) => void) | null = null;

  static getInstance(): DataPreloader {
    if (!DataPreloader.instance) {
      DataPreloader.instance = new DataPreloader();
    }
    return DataPreloader.instance;
  }

  async preloadAllData(): Promise<PreloadedData> {
    // If already loading, return the existing promise
    if (this.isLoading && this.loadPromise) {
      return this.loadPromise;
    }

    // If already loaded, return cached data
    if (this.preloadedData) {
      return this.preloadedData;
    }

    this.isLoading = true;
    this.loadPromise = this.performPreload();
    
    try {
      this.preloadedData = await this.loadPromise;
      
      // Notify callback if set
      if (this.onDataReadyCallback) {
        this.onDataReadyCallback(this.preloadedData);
      }
      
      return this.preloadedData;
    } finally {
      this.isLoading = false;
      this.loadPromise = null;
    }
  }

  private async performPreload(): Promise<PreloadedData> {
    console.log('🚀 Starting data preload...');
    
    try {
      // Fetch all layouts
      const layouts = await apiService.getLayouts();
      console.log(`✅ Loaded ${layouts.length} layouts`);

      // Fetch all materials
      const materials = await apiService.getMaterials();
      console.log(`✅ Loaded ${materials.length} materials`);

      // Fetch all edge styles
      const edgeStyles = await apiService.getEdgeStyles();
      console.log(`✅ Loaded ${edgeStyles.length} edge styles`);

      // Fetch layout fields for all layouts
      const layoutFields: { [layoutId: string]: LayoutField[] } = {};
      const autoCalculationRules: { [layoutId: string]: AutoCalculationRule[] } = {};
      const layoutFieldGroups: { [layoutId: string]: any[] } = {};

      // Fetch data for each layout in parallel
      const layoutDataPromises = layouts.map(async (layout) => {
        const [fields, rules, groups] = await Promise.all([
          apiService.getLayoutFields(layout.id),
          apiService.getAutoCalculationRules(layout.id),
          apiService.getLayoutFieldGroups(layout.id)
        ]);

        layoutFields[layout.id] = fields;
        autoCalculationRules[layout.id] = rules;
        layoutFieldGroups[layout.id] = groups;
      });

      await Promise.all(layoutDataPromises);
      console.log(`✅ Loaded data for ${layouts.length} layouts`);

      // Fetch sinks for both environments
      const [kitchenSinks, bathroomSinks] = await Promise.all([
        apiService.getSinks('kitchen'),
        apiService.getSinks('bathroom'),
      ]);
      console.log(`✅ Loaded ${kitchenSinks.length} kitchen sinks and ${bathroomSinks.length} bathroom sinks`);

      const sinkMap = [...kitchenSinks, ...bathroomSinks].reduce<Record<string, SinkOption>>((acc, sink) => {
        acc[sink.id] = sink;
        return acc;
      }, {});

      // Preload SVG images for all layouts
      await this.preloadSvgImages(layouts);
      console.log('✅ Preloaded SVG images');

      const preloadedData: PreloadedData = {
        layouts,
        materials,
        edgeStyles,
        layoutFields,
        autoCalculationRules,
        layoutFieldGroups,
        sinksByEnvironment: {
          kitchen: kitchenSinks,
          bathroom: bathroomSinks,
        },
        sinkMap,
      };

      console.log('🎉 Data preload completed successfully!');
      return preloadedData;

    } catch (error) {
      console.error('❌ Error during data preload:', error);
      throw error;
    }
  }

  private async preloadSvgImages(layouts: Layout[]): Promise<void> {
    const svgPromises = layouts.map(async (layout) => {
      try {
        if (layout.layout_image) {
          const response = await fetch(layout.layout_image);
          if (!response.ok) {
            console.warn(`⚠️ Failed to preload SVG for ${layout.name}`);
          }
        }
      } catch (error) {
        console.warn(`⚠️ Error preloading SVG for ${layout.name}:`, error);
      }
    });

    await Promise.all(svgPromises);
  }

  getPreloadedData(): PreloadedData | null {
    return this.preloadedData;
  }

  isDataLoaded(): boolean {
    return this.preloadedData !== null;
  }

  isLoadingData(): boolean {
    return this.isLoading;
  }

  setOnDataReadyCallback(callback: (data: PreloadedData) => void): void {
    this.onDataReadyCallback = callback;
  }

  clearCache(): void {
    this.preloadedData = null;
  }
}

// Export singleton instance
export const dataPreloader = DataPreloader.getInstance(); 