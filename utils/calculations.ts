import { Layout, LayoutField, AutoCalculationRule } from '@/types';

export class CalculationEngine {
  /**
   * Calcula a área em pés quadrados para um layout específico
   * @param layout - Layout da peça
   * @param measurements - Medidas da peça
   * @returns Área em pés quadrados
   */
  static calculateSquareFeet(layout: Layout, measurements: Record<string, number>): number {
    switch (layout.name) {
      case 'SingleWall':
        return this.calculateSingleWallArea(measurements);
      case 'LShape':
        return this.calculateLShapeArea(measurements);
      case 'UShape':
        return this.calculateUShapeArea(measurements);
      case 'Island':
        return this.calculateIslandArea(measurements);
      case 'L-Shaped-Island':
        return this.calculateLShapedIslandArea(measurements);
      case 'Angled-shaped':
        return this.calculateAngledShapeArea(measurements);
      case 'Angled-shaped-Island':
        return this.calculateAngledShapeIslandArea(measurements);
      default:
        return 0;
    }
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
   * Calcula área para UShape: (Width A + Width B + Width C) x Depth / 144
   * @param measurements - Medidas da peça
   * @returns Área em pés quadrados
   */
  private static calculateUShapeArea(measurements: Record<string, number>): number {
    const widthA = measurements['widthA'] || measurements['width_a'] || 0;
    const widthB = measurements['widthB'] || measurements['width_b'] || 0;
    const widthC = measurements['widthC'] || measurements['width_c'] || 0;
    const depth = measurements['depthA'] || measurements['depth_a'] || 0;
    
    // Três seções retangulares
    return ((widthA + widthB + widthC) * depth) / 144;
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
   * Calcula área para L-Shaped-Island: (Width A x Depth A) + (Width B x Depth B) / 144
   * @param measurements - Medidas da peça
   * @returns Área em pés quadrados
   */
  private static calculateLShapedIslandArea(measurements: Record<string, number>): number {
    const widthA = measurements['widthA'] || measurements['width_a'] || 0;
    const depthA = measurements['depthA'] || measurements['depth_a'] || 0;
    const widthB = measurements['widthB'] || measurements['width_b'] || 0;
    const depthB = measurements['depthB'] || measurements['depth_b'] || 0;
    
    // Duas seções retangulares (igual ao LShape)
    return ((widthA * depthA) + (widthB * depthB)) / 144;
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
   * Calcula área para Angled-shaped-Island: Soma de todas as seções / 144
   * @param measurements - Medidas da peça
   * @returns Área em pés quadrados
   */
  private static calculateAngledShapeIslandArea(measurements: Record<string, number>): number {
    const widthA = measurements['widthA'] || measurements['width_a'] || 0;
    const widthB = measurements['widthB'] || measurements['width_b'] || 0;
    const widthC = measurements['widthC'] || measurements['width_c'] || 0;
    const depthA = measurements['depthA'] || measurements['depth_a'] || 0;
    const depthB = measurements['depthB'] || measurements['depth_b'] || 0;
    const depthC = measurements['depthC'] || measurements['depth_c'] || 0;
    
    // Soma de todas as seções
    const totalArea = (widthA * depthA) + (widthB * depthB) + (widthC * depthC);
    return totalArea / 144;
  }

  /**
   * Calcula campos auto-calculados baseados nas regras do banco de dados
   * @param rules - Regras de auto-cálculo
   * @param measurements - Medidas atuais
   * @returns Medidas com campos auto-calculados
   */
  static calculateAutoFields(rules: AutoCalculationRule[], measurements: Record<string, number>): Record<string, number> {
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
    
    // Aplicar regras específicas para L-Shape e L-Shape Island
    this.applyLShapeSpecificRules(calculatedFields, measurements);
    
    return calculatedFields;
  }

  /**
   * Aplica regras específicas para L-Shape e L-Shape Island
   * @param calculatedFields - Campos já calculados
   * @param measurements - Medidas atuais
   */
  private static applyLShapeSpecificRules(calculatedFields: Record<string, number>, measurements: Record<string, number>): void {
    // Regra para Width D: Width A - Depth B
    const widthA = measurements['widthA'] || measurements['width_a'];
    const depthB = measurements['depthB'] || measurements['depth_b'];
    if (widthA !== undefined && depthB !== undefined) {
      calculatedFields['widthD'] = widthA - depthB;
      calculatedFields['width_d'] = widthA - depthB; // Also set snake_case for compatibility
    }
    
    // Regra para Width C: Width B - Depth A
    const widthB = measurements['widthB'] || measurements['width_b'];
    const depthA = measurements['depthA'] || measurements['depth_a'];
    if (widthB !== undefined && depthA !== undefined) {
      calculatedFields['widthC'] = widthB - depthA;
      calculatedFields['width_c'] = widthB - depthA; // Also set snake_case for compatibility
    }
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

export function calculateAutoFields(rules: AutoCalculationRule[], measurements: Record<string, number>): Record<string, number> {
  return CalculationEngine.calculateAutoFields(rules, measurements);
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