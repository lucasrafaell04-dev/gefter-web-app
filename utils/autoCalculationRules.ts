/**
 * Auto Calculation Rules Engine
 * Handles layout-specific auto-calculation rules for kitchen countertop measurements
 */
export class AutoCalculationRules {
  /**
   * Apply layout-specific auto-calculation rules
   * @param layoutName - Name of the layout (LShape, UShape, etc.)
   * @param calculatedFields - Fields already calculated from database rules
   * @param measurements - Current measurements
   */
  static applyLayoutSpecificRules(
    layoutName: string,
    calculatedFields: Record<string, number>,
    measurements: Record<string, number>
  ): void {
    switch (layoutName) {
      case 'LShape':
      case 'L-Shaped-Island':
        this.applyLShapeRules(calculatedFields, measurements);
        break;
      case 'UShape':
        this.applyUShapeRules(calculatedFields, measurements);
        break;
      // Add more layout-specific rules here as needed
      default:
        // No specific rules for this layout
        break;
    }
  }

  /**
   * Apply L-Shape and L-Shaped-Island specific rules
   * @param calculatedFields - Fields to be updated with calculated values
   * @param measurements - Current measurements
   */
  private static applyLShapeRules(
    calculatedFields: Record<string, number>,
    measurements: Record<string, number>
  ): void {
    // Rule 1: Width C = Width B - Depth A
    const widthB = this.getFieldValue(measurements, 'widthB');
    const depthA = this.getFieldValue(measurements, 'depthA');
    if (widthB !== undefined && depthA !== undefined) {
      this.setFieldValue(calculatedFields, 'widthC', widthB - depthA);
    }
    
    // Rule 2: Width D = Width A - Depth B
    const widthA = this.getFieldValue(measurements, 'widthA');
    const depthB = this.getFieldValue(measurements, 'depthB');
    if (widthA !== undefined && depthB !== undefined) {
      this.setFieldValue(calculatedFields, 'widthD', widthA - depthB);
    }
    
    // Rule 3: Depth B = Width B - Width E (if Width E is provided)
    const widthE = this.getFieldValue(measurements, 'widthE');
    if (widthB !== undefined && widthE !== undefined) {
      const depthBValue = widthB - widthE;
      this.setFieldValue(calculatedFields, 'depthB', depthBValue);
      console.log(`L-Shape Rule 3: Depth B = Width B (${widthB}) - Width E (${widthE}) = ${depthBValue}`);
    }
  }

  /**
   * Apply U-Shape specific rules
   * @param calculatedFields - Fields to be updated with calculated values
   * @param measurements - Current measurements
   */
  private static applyUShapeRules(
    calculatedFields: Record<string, number>,
    measurements: Record<string, number>
  ): void {
    // Rule 1: Width D = Width C - Depth C
    const widthC = this.getFieldValue(measurements, 'widthC');
    const depthC = this.getFieldValue(measurements, 'depthC');
    if (widthC !== undefined && depthC !== undefined) {
      this.setFieldValue(calculatedFields, 'widthD', widthC - depthC);
    }
    
    // Rule 2: Width E = Width B - Depth C
    const widthB = this.getFieldValue(measurements, 'widthB');
    if (widthB !== undefined && depthC !== undefined) {
      this.setFieldValue(calculatedFields, 'widthE', widthB - depthC);
    }
  }

  /**
   * Get field value supporting both camelCase and snake_case naming conventions
   * @param measurements - Measurements object
   * @param fieldName - Field name in camelCase
   * @returns Field value or undefined if not found
   */
  private static getFieldValue(
    measurements: Record<string, number>,
    fieldName: string
  ): number | undefined {
    // Convert camelCase to snake_case
    const snakeCaseField = fieldName.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    
    return measurements[fieldName] || measurements[snakeCaseField];
  }

  /**
   * Set field value in both camelCase and snake_case formats for compatibility
   * @param calculatedFields - Object to update
   * @param fieldName - Field name in camelCase
   * @param value - Value to set
   */
  private static setFieldValue(
    calculatedFields: Record<string, number>,
    fieldName: string,
    value: number
  ): void {
    // Convert camelCase to snake_case
    const snakeCaseField = fieldName.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    
    // Set both formats for compatibility
    calculatedFields[fieldName] = value;
    calculatedFields[snakeCaseField] = value;
  }

  /**
   * Get all supported layouts with their specific rules
   * @returns Array of layout names that have specific auto-calculation rules
   */
  static getSupportedLayouts(): string[] {
    return [
      'LShape',
      'L-Shaped-Island',
      'UShape'
    ];
  }

  /**
   * Check if a layout has specific auto-calculation rules
   * @param layoutName - Name of the layout
   * @returns True if layout has specific rules
   */
  static hasSpecificRules(layoutName: string): boolean {
    return this.getSupportedLayouts().includes(layoutName);
  }

  /**
   * Get description of rules for a specific layout
   * @param layoutName - Name of the layout
   * @returns Description of the auto-calculation rules
   */
  static getRuleDescription(layoutName: string): string[] {
    switch (layoutName) {
      case 'LShape':
      case 'L-Shaped-Island':
        return [
          'Width D = Width A - Depth B',
          'Width C = Width B - Depth A'
        ];
      case 'UShape':
        return [
          'Width D = Width C - Depth C',
          'Width E = Width B - Depth C'
        ];
      default:
        return [];
    }
  }
}