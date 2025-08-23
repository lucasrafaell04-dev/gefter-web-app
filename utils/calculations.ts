import { Layout, LayoutField, AutoCalculationRule, WallToggles, EdgeCalculation, MaterialCalculation, Material, EdgeStyle } from '@/types';
import { AutoCalculationRules } from './autoCalculationRules';

export class CalculationEngine {
  /**
   * Calcula a área em pés quadrados para um layout específico
   * @param layout - Layout da peça
   * @param measurements - Medidas da peça
   * @returns Área em pés quadrados
   */
  static calculateSquareFeet(layout: Layout, measurements: Record<string, number>): number {
    let mainArea = 0;
    
    // Calculate main layout area
    switch (layout.name) {
      case 'SingleWall':
        mainArea = this.calculateSingleWallArea(measurements);
        break;
      case 'LShape':
        mainArea = this.calculateLShapeArea(measurements);
        break;
      case 'UShape':
        mainArea = this.calculateUShapeArea(measurements);
        break;
      case 'Island':
        mainArea = this.calculateIslandArea(measurements);
        break;
      case 'L-Shaped-Island':
        mainArea = this.calculateLShapeArea(measurements); // Use L-Shape calculation for main area
        break;
      case 'Angled-shaped':
        mainArea = this.calculateAngledShapeArea(measurements);
        break;
      case 'Angled-shaped-Island':
        mainArea = this.calculateAngledShapeArea(measurements); // Use Angled-shape calculation for main area
        break;
      default:
        mainArea = 0;
    }
    
    // Add sink area for Island layouts
    if (this.isIslandLayout(layout.name)) {
      const sinkArea = this.calculateSinkArea(measurements);
      const totalArea = mainArea + sinkArea;
      console.log(`${layout.name} Total Area: Main (${mainArea.toFixed(3)}) + Sink (${sinkArea.toFixed(3)}) = ${totalArea.toFixed(3)} sq ft`);
      return totalArea;
    }
    
    return mainArea;
  }

  /**
   * Verifica se o layout é do tipo Island (contém sink)
   * @param layoutName - Nome do layout
   * @returns true se for um layout Island
   */
  private static isIslandLayout(layoutName: string): boolean {
    return layoutName.includes('Island') || layoutName.includes('sink');
  }

  /**
   * Calcula a área do sink/Island: Sink Width A x Sink Depth A / 144
   * @param measurements - Medidas da peça
   * @returns Área do sink em pés quadrados
   */
  private static calculateSinkArea(measurements: Record<string, number>): number {
    const sinkWidthA = measurements['sinkWidthA'] || measurements['sink_width_a'] || 0;
    const sinkDepthA = measurements['sinkDepthA'] || measurements['sink_depth_a'] || 0;
    const sinkArea = (sinkWidthA * sinkDepthA) / 144;
    console.log(`Sink Area: ${sinkWidthA} x ${sinkDepthA} = ${sinkArea.toFixed(3)} sq ft`);
    return sinkArea;
  }

  /**
   * Calcula linear feet para edge, excluindo medidas que são walls
   * @param measurements - Medidas da peça
   * @param wallToggles - Toggles de wall para cada medida
   * @param layoutName - Nome do layout
   * @returns Cálculo de edge com linear feet e custo
   */
  static calculateEdgeLinearFeet(
    measurements: Record<string, number>,
    wallToggles: WallToggles,
    layoutName: string
  ): EdgeCalculation {
    let linearFeet = 0;
    const excludedWalls: string[] = [];

    // Debug logging
    console.log('🔧 Edge calculation for layout:', layoutName, {
      measurementFieldsCount: this.getMeasurementFieldsForLayout(layoutName).length,
      availableMeasurementKeys: Object.keys(measurements),
      availableWallToggleKeys: Object.keys(wallToggles)
    });

    // Get all measurement fields for the layout
    const measurementFields = this.getMeasurementFieldsForLayout(layoutName);
    
    // If no hardcoded fields found, use all measurement keys as fallback
    if (measurementFields.length === 0) {
      console.log('🔧 No hardcoded fields found, using all measurement keys as fallback');
      Object.keys(measurements).forEach(fieldName => {
        const value = measurements[fieldName] || 0;
        const isWall = wallToggles[fieldName] || false;
        
        console.log(`🔧 Processing fallback field: ${fieldName}`, { value, isWall });
        
        if (value > 0) {
          if (isWall) {
            excludedWalls.push(fieldName);
            console.log(`Excluding wall measurement: ${fieldName} (${value} in)`);
          } else {
            // Convert inches to feet and add to linear feet
            const feet = value / 12;
            linearFeet += feet;
            console.log(`Adding to linear feet: ${fieldName} (${value} in = ${feet.toFixed(3)} ft)`);
          }
        } else {
          console.log(`Skipping fallback field ${fieldName} - no value (${value})`);
        }
      });
    } else {
      measurementFields.forEach(field => {
        // Try different field name formats to be more flexible
        const value = measurements[field.field_name] || measurements[field.field_name.toLowerCase()] || 0;
        let isWall = wallToggles[field.field_name] || wallToggles[field.field_name.toLowerCase()] || false;
        
        console.log(`🔧 Processing field: ${field.field_name} (${field.field_label})`, { value, isWall });
        
        // Special handling for Island and SingleWall Depth A field
        if ((layoutName === 'Island' || layoutName === 'SingleWall') && field.field_name === 'depthA') {
          const wallOnLeft = wallToggles.wallOnLeft || false;
          const wallOnRight = wallToggles.wallOnRight || false;
          
          // If either side is a wall, exclude from edge calculation
          if (wallOnLeft || wallOnRight) {
            isWall = true;
            const wallSides = [];
            if (wallOnLeft) wallSides.push('left');
            if (wallOnRight) wallSides.push('right');
            console.log(`Excluding Depth A from edge calculation - wall on: ${wallSides.join(', ')}`);
          }
        }
        
        if (value > 0) {
          if (isWall) {
            excludedWalls.push(field.field_label);
            console.log(`Excluding wall measurement: ${field.field_label} (${value} in)`);
          } else {
            // Convert inches to feet and add to linear feet
            const feet = value / 12;
            linearFeet += feet;
            console.log(`Adding to linear feet: ${field.field_label} (${value} in = ${feet.toFixed(3)} ft)`);
          }
        } else {
          console.log(`Skipping field ${field.field_name} - no value (${value})`);
        }
      });
    }

    console.log('🔧 Final edge calculation:', { linearFeet, excludedWalls });

    return {
      linearFeet,
      edgePrice: 0, // Will be set by caller
      totalEdgeCost: 0, // Will be calculated by caller
      excludedWalls
    };
  }

  /**
   * Calcula custo total do edge
   * @param edgeCalculation - Cálculo de edge
   * @param edgeStyle - Estilo do edge selecionado
   * @returns Cálculo atualizado com custo total
   */
  static calculateEdgeCost(edgeCalculation: EdgeCalculation, edgeStyle: EdgeStyle): EdgeCalculation {
    const totalEdgeCost = edgeCalculation.linearFeet * edgeStyle.price_per_linear_ft;
    return {
      ...edgeCalculation,
      edgePrice: edgeStyle.price_per_linear_ft,
      totalEdgeCost
    };
  }

  /**
   * Calcula custo do material baseado na área
   * @param squareFeet - Área em pés quadrados
   * @param material - Material selecionado
   * @returns Cálculo do material
   */
  static calculateMaterialCost(squareFeet: number, material: Material): MaterialCalculation {
    const totalMaterialCost = squareFeet * material.price_per_sqft;
    return {
      squareFeet,
      materialPrice: material.price_per_sqft,
      totalMaterialCost
    };
  }

  /**
   * Obtém campos de medida para um layout específico
   * @param layoutName - Nome do layout
   * @returns Lista de campos de medida
   */
  private static getMeasurementFieldsForLayout(layoutName: string): Array<{field_name: string, field_label: string}> {
    // Define measurement fields for each layout
    // Note: These field names should match what's actually stored in the database
    const layoutFields: Record<string, Array<{field_name: string, field_label: string}>> = {
      'SingleWall': [
        { field_name: 'widthA', field_label: 'Width A' },
        { field_name: 'depthA', field_label: 'Depth A' }
      ],
      'Island': [
        { field_name: 'widthA', field_label: 'Width A' },
        { field_name: 'depthA', field_label: 'Depth A' }
      ],
      'LShape': [
        { field_name: 'widthA', field_label: 'Width A' },
        { field_name: 'widthB', field_label: 'Width B' },
        { field_name: 'depthA', field_label: 'Depth A' },
        { field_name: 'depthB', field_label: 'Depth B' }
      ],
      'L-Shaped-Island': [
        { field_name: 'widthA', field_label: 'Width A' },
        { field_name: 'widthB', field_label: 'Width B' },
        { field_name: 'depthA', field_label: 'Depth A' },
        { field_name: 'depthB', field_label: 'Depth B' }
      ],
      'UShape': [
        { field_name: 'widthA', field_label: 'Width A' },
        { field_name: 'widthB', field_label: 'Width B' },
        { field_name: 'widthC', field_label: 'Width C' },
        { field_name: 'depthA', field_label: 'Depth A' },
        { field_name: 'depthB', field_label: 'Depth B' },
        { field_name: 'depthC', field_label: 'Depth C' }
      ],
      'Angled-shaped': [
        { field_name: 'widthA', field_label: 'Width A' },
        { field_name: 'widthB', field_label: 'Width B' },
        { field_name: 'widthC', field_label: 'Width C' },
        { field_name: 'depthA', field_label: 'Depth A' },
        { field_name: 'depthB', field_label: 'Depth B' },
        { field_name: 'depthC', field_label: 'Depth C' }
      ],
      'Angled-shaped-Island': [
        { field_name: 'widthA', field_label: 'Width A' },
        { field_name: 'widthB', field_label: 'Width B' },
        { field_name: 'widthC', field_label: 'Width C' },
        { field_name: 'depthA', field_label: 'Depth A' },
        { field_name: 'depthB', field_label: 'Depth B' },
        { field_name: 'depthC', field_label: 'Depth C' }
      ]
    };

    const fields = layoutFields[layoutName] || [];
    console.log(`🔧 Layout fields for ${layoutName}:`, fields.length, 'fields');
    return fields;
  }

  /**
   * Calcula área para SingleWall: Width A x Depth A / 144
   * @param measurements - Medidas da peça
   * @returns Área em pés quadrados
   */
  private static calculateSingleWallArea(measurements: Record<string, number>): number {
    const widthA = measurements['widthA'] || measurements['width_a'] || 0;
    const depthA = measurements['depthA'] || measurements['depth_a'] || 0;
    
    // Converte de polegadas para pés quadrados
    // (Width A x Depth A) / 144 = pés quadrados
    return (widthA * depthA) / 144;
  }

  /**
   * Calcula área para LShape: (Width A x Depth A) + (Width B x Depth B) / 144
   * @param measurements - Medidas da peça
   * @returns Área em pés quadrados
   */
  private static calculateLShapeArea(measurements: Record<string, number>): number {
    const widthA = measurements['widthA'] || measurements['width_a'] || 0;
    const depthA = measurements['depthA'] || measurements['depth_a'] || 0;
    const widthB = measurements['widthB'] || measurements['width_b'] || 0;
    const depthB = measurements['depthB'] || measurements['depth_b'] || 0;
    
    // Duas seções retangulares
    return ((widthA * depthA) + (widthB * depthB)) / 144;
  }

  /**
   * Calcula área para UShape: ((depthB * widthE) + (depthA * widthD) + (widthA * depthC)) / 144
   * @param measurements - Medidas da peça
   * @returns Área em pés quadrados
   */
  private static calculateUShapeArea(measurements: Record<string, number>): number {
    const widthA = measurements['widthA'] || measurements['width_a'] || 0;
    const widthD = measurements['widthD'] || measurements['width_d'] || 0;
    const widthE = measurements['widthE'] || measurements['width_e'] || 0;
    const depthA = measurements['depthA'] || measurements['depth_a'] || 0;
    const depthB = measurements['depthB'] || measurements['depth_b'] || 0;
    const depthC = measurements['depthC'] || measurements['depth_c'] || 0;
    
    // Três seções retangulares: (depthB * widthE) + (depthA * widthD) + (widthA * depthC)
    const area = ((depthB * widthE) + (depthA * widthD) + (widthA * depthC)) / 144;
    console.log(`U-Shape Area: (${depthB} * ${widthE}) + (${depthA} * ${widthD}) + (${widthA} * ${depthC}) = ${area} sq ft`);
    return area;
  }

  /**
   * Calcula área para Island: Width A x Depth A / 144
   * @param measurements - Medidas da peça
   * @returns Área em pés quadrados
   */
  private static calculateIslandArea(measurements: Record<string, number>): number {
    const widthA = measurements['widthA'] || measurements['width_a'] || 0;
    const depthA = measurements['depthA'] || measurements['depth_a'] || 0;
    
    // Seção retangular única
    return (widthA * depthA) / 144;
  }



  /**
   * Calcula área para Angled-shaped: Soma de todas as seções / 144
   * @param measurements - Medidas da peça
   * @returns Área em pés quadrados
   */
  private static calculateAngledShapeArea(measurements: Record<string, number>): number {
    const widthA = measurements['widthA'] || measurements['width_a'] || 0;
    const widthB = measurements['widthB'] || measurements['width_b'] || 0;
    const widthC = measurements['widthC'] || measurements['width_c'] || 0;
    const widthD = measurements['widthD'] || measurements['width_d'] || 0;
    const depthA = measurements['depthA'] || measurements['depth_a'] || 0;
    const depthB = measurements['depthB'] || measurements['depth_b'] || 0;
    const depthC = measurements['depthC'] || measurements['depth_c'] || 0;
    
    // Soma de todas as seções
    const totalArea = (widthA * depthA) + (widthB * depthB) + (widthC * depthC) + (widthD * depthA);
    return totalArea / 144;
  }



  /**
   * Calcula campos auto-calculados baseados nas regras do banco de dados
   * @param rules - Regras de auto-cálculo
   * @param measurements - Medidas atuais
   * @param layoutName - Nome do layout para aplicar regras específicas
   * @returns Medidas com campos auto-calculados
   */
  static calculateAutoFields(
    rules: AutoCalculationRule[], 
    measurements: Record<string, number>,
    layoutName?: string
  ): Record<string, number> {
    const calculatedFields: Record<string, number> = {};
    
    // Aplicar regras do banco de dados
    rules.forEach(rule => {
      if (rule.is_active) {
        try {
          const result = this.evaluateFormula(rule.formula, measurements);
          calculatedFields[rule.target_field_name] = result;
        } catch (error) {
          console.error(`Error calculating field ${rule.target_field_name}:`, error);
          calculatedFields[rule.target_field_name] = 0;
        }
      }
    });
    
    // Aplicar regras específicas baseadas no layout
    if (layoutName) {
      AutoCalculationRules.applyLayoutSpecificRules(layoutName, calculatedFields, measurements);
    }
    
    return calculatedFields;
  }



  /**
   * Avalia uma fórmula matemática de forma segura
   * @param formula - Fórmula matemática (ex: "widthB - depthA")
   * @param measurements - Medidas disponíveis
   * @returns Resultado da fórmula
   */
  static evaluateFormula(formula: string, measurements: Record<string, number>): number {
    try {
      // Substitui nomes de campos pelos valores
      let processedFormula = formula;
      
      // Substitui nomes de campos pelos valores correspondentes
      Object.keys(measurements).forEach(fieldName => {
        const value = measurements[fieldName] || 0;
        const regex = new RegExp(`\\b${fieldName}\\b`, 'g');
        processedFormula = processedFormula.replace(regex, value.toString());
      });
      
      // Avalia a fórmula de forma segura
      // Usa Function constructor para evitar eval() direto
      const result = new Function(`return ${processedFormula}`)();
      
      return typeof result === 'number' ? result : 0;
    } catch (error) {
      console.error('Error evaluating formula:', formula, error);
      return 0;
    }
  }
}

// Função de compatibilidade para manter código existente
export function evaluateFormula(formula: string, measurements: Record<string, number>): number {
  return CalculationEngine.evaluateFormula(formula, measurements);
}

export function calculateAutoFields(
  rules: AutoCalculationRule[], 
  measurements: Record<string, number>,
  layoutName?: string
): Record<string, number> {
  return CalculationEngine.calculateAutoFields(rules, measurements, layoutName);
}

// Function to check if a field can be calculated (all dependencies are available)
export function canCalculateField(
  rule: AutoCalculationRule,
  availableFields: string[]
): boolean {
  // Extract field names from formula (simple regex for field names)
  const fieldRegex = /\b[a-zA-Z_][a-zA-Z0-9_]*\b/g;
  const matches = rule.formula.match(fieldRegex) || [];
  
  // Check if all required fields are available
  return matches.every(field => availableFields.includes(field));
}

// Function to get field dependencies from formula
export function getFieldDependencies(formula: string): string[] {
  const fieldRegex = /\b[a-zA-Z_][a-zA-Z0-9_]*\b/g;
  const matches = formula.match(fieldRegex) || [];
  
  // Filter out mathematical operators and constants
  const operators = ['width', 'depth', 'height', 'length', 'area', 'perimeter'];
  return matches.filter(field => !operators.includes(field));
} 