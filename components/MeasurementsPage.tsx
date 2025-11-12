'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Info, ChevronUp, ChevronDown, Calculator, Eye, EyeOff } from 'lucide-react';
import { useProjectStore } from '@/store/useProjectStore';
import { LayoutField } from '@/types';
import { useState, useMemo, useCallback, useEffect } from 'react';
import { calculateAutoFields, CalculationEngine } from '@/utils/calculations';
import { useLayoutData } from '@/hooks/useApiCache';
import { getLocalSvgImage } from '@/data/shapeImageMap';

const normalizeLabel = (value: string | null) => value?.replace(/\s+/g, ' ').trim() ?? '';

const renderSvgWithMeasurements = (
  baseSvgContent: string,
  manualFields: LayoutField[],
  autoCalculatedFields: LayoutField[] = [],
  measurements: Record<string, number>
) => {
  if (!baseSvgContent) {
    return '';
  }
  if (typeof window === 'undefined' || typeof DOMParser === 'undefined' || typeof XMLSerializer === 'undefined') {
    return baseSvgContent;
  }
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(baseSvgContent, 'image/svg+xml');
    const parserError = doc.querySelector('parsererror');
    if (parserError) {
      console.error('Failed to parse layout SVG:', parserError.textContent);
      return baseSvgContent;
    }
    const svgElement = doc.documentElement;
    if (!svgElement || svgElement.nodeName.toLowerCase() !== 'svg') {
      return baseSvgContent;
    }
    const fieldsToProcess = [...manualFields, ...autoCalculatedFields];
    const updateElementText = (element: Element | null, text: string) => {
      if (!element) {
        return false;
      }
      const tspan = element.querySelector('tspan');
      if (tspan) {
        tspan.textContent = text;
      } else {
        element.textContent = text;
      }
      return true;
    };
    fieldsToProcess.forEach(field => {
      const fieldValue = measurements[field.field_name] || 0;
      const displayText = fieldValue > 0 ? `${fieldValue.toFixed(3)} in` : field.field_label;
      let didUpdate = false;
      if (field.svg_id) {
        didUpdate = updateElementText(doc.getElementById(field.svg_id), displayText);
      }
      if (!didUpdate) {
        const textNodes = Array.from(doc.getElementsByTagName('text'));
        for (const node of textNodes) {
          if (normalizeLabel(node.textContent) === normalizeLabel(field.field_label)) {
            if (updateElementText(node, displayText)) {
              didUpdate = true;
              break;
            }
          }
        }
      }
      if (!didUpdate && fieldValue > 0) {
        console.warn(`Unable to update SVG label for ${field.field_name} (${field.svg_id || field.field_label}).`);
      }
    });
    const serializer = new XMLSerializer();
    return serializer.serializeToString(svgElement);
  } catch (err) {
    console.error('Error updating layout SVG:', err);
    return baseSvgContent;
  }
};

// Dynamic SVG component that loads base SVG from database and overlays dynamic labels
export const DynamicSvgDiagram = React.memo(({ 
  layoutName, 
  layoutImage,
  manualFields, 
  measurements,
  autoCalculatedFields = []
}: { 
  layoutName: string; 
  layoutImage?: string;
  manualFields: LayoutField[]; 
  measurements: Record<string, number>;
  autoCalculatedFields?: LayoutField[];
}) => {
  const [baseSvgContent, setBaseSvgContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Load base SVG only when layout changes (not on measurement changes)
  useEffect(() => {
    const loadBaseSvg = async () => {
      try {
        setLoading(true);
        setError(false);
        
        const svgUrl = await getLocalSvgImage(layoutName);
        
        if (!svgUrl) {
          throw new Error('Failed to load SVG');
        }
        
        let svgText = await svgUrl;
        
        svgText = svgText.replace(/<text[^>]*>.*?<\/text>/g, '');
        
        if (!svgText.includes('viewBox=')) {
          svgText = svgText.replace('<svg', '<svg viewBox="0 0 200 200"');
        }
        
        svgText = svgText.replace('<svg', '<svg style="width: 100%; height: 100%; max-width: 100%; max-height: 100%;"');
        
        setBaseSvgContent(svgText);
      } catch (err) {
        console.error('Error loading SVG:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadBaseSvg();
  }, [layoutName, layoutImage]);

  const renderedSvg = useMemo(
    () => renderSvgWithMeasurements(baseSvgContent, manualFields, autoCalculatedFields, measurements),
    [autoCalculatedFields, baseSvgContent, manualFields, measurements]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error || !baseSvgContent) {
    return (
      <div className="flex items-center justify-center w-full h-full text-white text-sm">
        SVG not available
      </div>
    );
  }


  return (
    <div
      className="w-full h-full flex items-center justify-center"
      dangerouslySetInnerHTML={{ __html: renderedSvg || baseSvgContent }}
    />
  );
}, (prevProps, nextProps) => {
  // Custom comparison to prevent unnecessary re-renders
  if (prevProps.layoutName !== nextProps.layoutName) return false;
  if (prevProps.layoutImage !== nextProps.layoutImage) return false;
  if (prevProps.manualFields.length !== nextProps.manualFields.length) return false;
  if ((prevProps.autoCalculatedFields?.length || 0) !== (nextProps.autoCalculatedFields?.length || 0)) return false;
  
  // Check if field definitions changed
  for (let i = 0; i < prevProps.manualFields.length; i++) {
    if (prevProps.manualFields[i].field_name !== nextProps.manualFields[i].field_name) {
      return false;
    }
  }
  
  // Check if auto-calculated field definitions changed
  const prevAutoFields = prevProps.autoCalculatedFields || [];
  const nextAutoFields = nextProps.autoCalculatedFields || [];
  for (let i = 0; i < prevAutoFields.length; i++) {
    if (prevAutoFields[i].field_name !== nextAutoFields[i].field_name) {
      return false;
    }
  }
  
  // Check if measurements changed
  const prevKeys = Object.keys(prevProps.measurements);
  const nextKeys = Object.keys(nextProps.measurements);
  
  if (prevKeys.length !== nextKeys.length) return false;
  
  for (const key of prevKeys) {
    if (prevProps.measurements[key] !== nextProps.measurements[key]) {
      return false; // Re-render if measurements changed
    }
  }
  
  return true; // Don't re-render if nothing changed
});



// Memoized input field component
const MeasurementInput = React.memo(({ 
  field, 
  value, 
  onChange 
}: { 
  field: LayoutField; 
  value: number; 
  onChange: (value: number) => void; 
}) => {
  // Use local state to handle the display value properly
  const [displayValue, setDisplayValue] = useState(value > 0 ? value.toString() : '');

  // Update display value when prop value changes (but not when user is typing)
  useEffect(() => {
    if (value > 0) {
      setDisplayValue(value.toString());
    } else if (value === 0 && displayValue === '') {
      // Keep empty string if user cleared the field
      setDisplayValue('');
    } else if (value === 0) {
      setDisplayValue('0');
    }
  }, [value]);

  return (
    <div key={field.field_name} className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {field.field_label}
        {field.is_required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="flex items-center space-x-2">
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={displayValue}
          onChange={(e) => {
            const newValue = e.target.value;
            setDisplayValue(newValue);
            
            // Allow only numbers and decimal points
            if (newValue === '' || /^\d*\.?\d*$/.test(newValue)) {
              const numValue = newValue === '' ? 0 : parseFloat(newValue);
              onChange(numValue);
            }
          }}
          onBlur={(e) => {
            // Ensure the value is a valid number on blur
            const numValue = parseFloat(e.target.value) || 0;
            onChange(numValue);
            setDisplayValue(numValue > 0 ? numValue.toString() : '');
          }}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
          placeholder={`Enter ${field.field_label.toLowerCase()}`}
        />
        <span className="text-sm text-gray-500 w-12">in</span>
      </div>
    </div>
  );
});



export default function MeasurementsPage() {
  // Selective subscriptions to prevent unnecessary re-renders
  const selectedShapes = useProjectStore(state => state.selectedShapes);
  const updateShapeMeasurements = useProjectStore(state => state.updateShapeMeasurements);
  const updateShapeWallToggles = useProjectStore(state => state.updateShapeWallToggles);
  const setShapeBacksplash = useProjectStore(state => state.setShapeBacksplash);
  const nextStep = useProjectStore(state => state.nextStep);
  const previousStep = useProjectStore(state => state.previousStep);
  const calculateTotalPrice = useProjectStore(state => state.calculateTotalPrice);
  
  const [currentShapeIndex, setCurrentShapeIndex] = useState(0);
  const [showProjectSummary, setShowProjectSummary] = useState(false);
  const [showCalculatedFields, setShowCalculatedFields] = useState(false);
  const [squareFeetValue, setSquareFeetValue] = useState<number>(0);

  const currentShape = selectedShapes[currentShapeIndex];

  // Use cache hook instead of manual fetch
  const { fields, rules, groups, isLoading: loading, error } = useLayoutData(currentShape?.layout?.id || '');
  
  // Extract data from query results
  const layoutFields = fields.data || [];
  const autoCalculationRules = rules.data || [];
  const fieldGroups = groups.data || [];

  const handleMeasurementChange = useCallback((fieldName: string, value: number) => {
    const newMeasurements = { ...currentShape.measurements, [fieldName]: value };
    
    // Calculate auto-calculated fields including layout-specific rules
    const calculatedValues = calculateAutoFields(autoCalculationRules, newMeasurements, currentShape.layout.name);
    const allMeasurements = { ...newMeasurements, ...calculatedValues };
    
    // Calculate square feet
    const squareFeet = CalculationEngine.calculateSquareFeet(currentShape.layout, allMeasurements);
    setSquareFeetValue(squareFeet);
    
    updateShapeMeasurements(currentShapeIndex, allMeasurements);
  }, [currentShape.measurements, currentShape.layout, autoCalculationRules, currentShapeIndex, updateShapeMeasurements]);

  const handleWallToggle = useCallback((fieldName: string, isWall: boolean) => {
    console.log('🔧 Wall Toggle:', fieldName, isWall);
    updateShapeWallToggles(currentShapeIndex, { [fieldName]: isWall });
  }, [currentShapeIndex, updateShapeWallToggles]);

  const handleBacksplashToggle = useCallback((hasBacksplash: boolean) => {
    setShapeBacksplash(currentShapeIndex, hasBacksplash, hasBacksplash ? 4 : undefined);
  }, [currentShapeIndex, setShapeBacksplash]);

  const handleContinue = () => {
    if (currentShapeIndex < selectedShapes.length - 1) {
      setCurrentShapeIndex(currentShapeIndex + 1);
    } else {
      nextStep();
    }
  };

  const handlePrevious = () => {
    if (currentShapeIndex > 0) {
      setCurrentShapeIndex(currentShapeIndex - 1);
    } else {
      previousStep();
    }
  };

  const isCurrentShapeComplete = () => {
    if (!currentShape) return false;
    
    const requiredFields = layoutFields.filter(field => field.is_required && field.field_type === 'manual');
    const hasAllMeasurements = requiredFields.every(field => 
      currentShape.measurements[field.field_name] && currentShape.measurements[field.field_name] > 0
    );
    
    return hasAllMeasurements;
  };



  // Calculate initial square feet when current shape changes
  useEffect(() => {
    if (currentShape && currentShape.measurements) {
      console.log('🔧 Current Shape:', currentShape.layout.name, {
        measurements: Object.keys(currentShape.measurements),
        wallToggles: Object.keys(currentShape.wallToggles)
      });
      const squareFeet = CalculationEngine.calculateSquareFeet(currentShape.layout, currentShape.measurements);
      setSquareFeetValue(squareFeet);
    }
  }, [currentShape?.layout.id, currentShape?.measurements]);

  // Group fields by their field type
  const manualFields = layoutFields.filter(field => field.field_type === 'manual' && field.is_visible);
  const autoCalculatedFields = layoutFields.filter(field => field.field_type === 'auto_calculated' && field.is_visible);
  const sinkFields = layoutFields.filter(field => field.field_type === 'sink' && field.is_visible);
  const backsplashFields = layoutFields.filter(field => field.field_type === 'backsplash' && field.is_visible);

  // Memoized SVG diagram component that uses dynamic SVG from database
  const memoizedShapeDiagram = !currentShape || !manualFields.length ? null : (
    <DynamicSvgDiagram 
      layoutName={currentShape.layout.name} 
      layoutImage={currentShape.layout.layout_image}
      manualFields={manualFields} 
      measurements={currentShape.measurements}
      autoCalculatedFields={autoCalculatedFields}
    />
  );

  if (!currentShape) {
    return <div>No shapes selected</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrevious}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <h1 className="text-xl font-semibold text-gray-800">Select {currentShape.layout.name}</h1>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Info className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8 pb-32">
        {/* Step Indicator */}
        <div className="text-sm text-gray-500 mb-4">Step 4 of 8</div>

        {/* Progress Indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Shape {currentShapeIndex + 1} of {selectedShapes.length}</span>
            <span>{currentShape.layout.name}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentShapeIndex + 1) / selectedShapes.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8">
          What are the dimensions for your {currentShape.layout.name}?
        </h2>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading layout data...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">Failed to load layout data</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-2 text-red-600 hover:text-red-800 underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Layout Diagram */}
        {!loading && !error && (
          <div className="mb-8">
            <div className="bg-gray-800 rounded-2xl p-6">
              <div className="flex justify-center">
                <div className="w-64 h-64 bg-[#4F5750] rounded-lg flex items-center justify-center overflow-hidden">
                  <div className="text-white text-xs font-medium w-full h-full">
                    {memoizedShapeDiagram}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Manual Measurement Fields */}
        {!loading && !error && manualFields.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">Main Measurements</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {manualFields.map((field) => (
                <motion.div
                  key={field.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="bg-white rounded-xl p-4 md:p-6 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-base md:text-lg font-medium text-gray-800">
                      {field.field_label} (in)
                    </label>
                    <div className="flex items-center gap-4">
                      {/* Wall Toggle - only show if layout supports wall toggles */}
                      {/* Standard Wall Toggle (for all layouts except Island/SingleWall Depth A) */}
                      {currentShape.layout.supports_wall_toggle && 
                       !((currentShape.layout.name === 'Island' || currentShape.layout.name === 'SingleWall') && 
                         field.field_name === 'depthA') && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">Wall</span>
                          <button
                            onClick={() => handleWallToggle(field.field_name, !currentShape.wallToggles[field.field_name])}
                            className={`w-12 h-6 rounded-full transition-colors ${
                              currentShape.wallToggles[field.field_name] 
                                ? 'bg-blue-500' 
                                : 'bg-gray-300'
                            }`}
                          >
                            <div 
                              className={`w-5 h-5 bg-white rounded-full transition-transform ${
                                currentShape.wallToggles[field.field_name] 
                                  ? 'translate-x-6' 
                                  : 'translate-x-0.5'
                              }`}
                            />
                          </button>
                        </div>
                      )}

                      {/* Special Wall Toggles for Island and SingleWall Depth A */}
                      {(currentShape.layout.name === 'Island' || currentShape.layout.name === 'SingleWall') && 
                       field.field_name === 'depthA' && (
                        <div className="flex gap-4 mt-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Wall on Left</span>
                            <button
                              onClick={() => handleWallToggle('wallOnLeft', !currentShape.wallToggles.wallOnLeft)}
                              className={`w-12 h-6 rounded-full transition-colors ${
                                currentShape.wallToggles.wallOnLeft 
                                  ? 'bg-blue-500' 
                                  : 'bg-gray-300'
                              }`}
                            >
                              <div 
                                className={`w-5 h-5 bg-white rounded-full transition-transform ${
                                  currentShape.wallToggles.wallOnLeft 
                                    ? 'translate-x-6' 
                                    : 'translate-x-0.5'
                                }`}
                              />
                            </button>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Wall on Right</span>
                            <button
                              onClick={() => handleWallToggle('wallOnRight', !currentShape.wallToggles.wallOnRight)}
                              className={`w-12 h-6 rounded-full transition-colors ${
                                currentShape.wallToggles.wallOnRight 
                                  ? 'bg-blue-500' 
                                  : 'bg-gray-300'
                              }`}
                            >
                              <div 
                                className={`w-5 h-5 bg-white rounded-full transition-transform ${
                                  currentShape.wallToggles.wallOnRight 
                                    ? 'translate-x-6' 
                                    : 'translate-x-0.5'
                                }`}
                              />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Input Field */}
                  <MeasurementInput
                    field={field}
                    value={currentShape.measurements[field.field_name] || 0}
                    onChange={(value) => handleMeasurementChange(field.field_name, value)}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Auto-Calculated Fields */}
        {!loading && !error && autoCalculatedFields.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-800">Calculated Measurements</h3>
              <button
                onClick={() => setShowCalculatedFields(!showCalculatedFields)}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
              >
                {showCalculatedFields ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showCalculatedFields ? 'Hide' : 'Show'} Calculations
              </button>
            </div>
            
            {showCalculatedFields && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {autoCalculatedFields.map((field) => (
                  <motion.div
                    key={field.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-blue-50 rounded-xl p-4 md:p-6 shadow-sm border border-blue-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-base md:text-lg font-medium text-gray-800 flex items-center gap-2">
                        <Calculator className="w-5 h-5 text-blue-600" />
                        {field.field_label} (in)
                      </label>
                      <span className="text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded">Auto-calculated</span>
                    </div>

                    {/* Display calculated value */}
                    <div className="bg-white rounded-lg p-3 border border-blue-200">
                      <span className="text-lg font-semibold text-gray-800">
                        {currentShape.measurements[field.field_name] || '0'} in
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Sink Fields */}
        {!loading && !error && sinkFields.length > 0 && currentShape.layout.supports_sink && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">Sink Measurements</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {sinkFields.map((field) => (
                <motion.div
                  key={field.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="bg-white rounded-xl p-4 md:p-6 shadow-sm border-l-4 border-orange-500"
                >
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-base md:text-lg font-medium text-gray-800">
                      {field.field_label} (in)
                    </label>
                  </div>

                  {/* Input Field */}
                  <MeasurementInput
                    field={field}
                    value={currentShape.measurements[field.field_name] || 0}
                    onChange={(value) => handleMeasurementChange(field.field_name, value)}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Backsplash Toggle */}
        {!loading && !error && currentShape.layout.supports_backsplash && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-xl p-6 shadow-sm mb-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Backsplash</h3>
                <p className="text-sm text-gray-600">
                  Add a backsplash to protect your walls from splashes and spills
                </p>
              </div>
              <button
                onClick={() => handleBacksplashToggle(!currentShape.hasBacksplash)}
                className={`w-12 h-6 rounded-full transition-colors ${
                  currentShape.hasBacksplash 
                    ? 'bg-blue-500' 
                    : 'bg-gray-300'
                }`}
              >
                <div 
                  className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    currentShape.hasBacksplash 
                      ? 'translate-x-6' 
                      : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Backsplash Height Input */}
            {currentShape.hasBacksplash && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Backsplash Height (inches) - Max 20"
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={currentShape.backsplashHeight !== undefined ? currentShape.backsplashHeight : ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Allow empty string to clear the input
                    if (value === '') {
                      setShapeBacksplash(currentShapeIndex, true, undefined);
                      return;
                    }
                    // Allow only numbers and decimal point
                    if (/^\d*\.?\d*$/.test(value)) {
                      const numValue = parseFloat(value);
                      // Only update if value is valid and <= 20
                      if (!isNaN(numValue) && numValue <= 20) {
                        setShapeBacksplash(currentShapeIndex, true, numValue);
                      }
                    }
                  }}
                  onBlur={(e) => {
                    // On blur, ensure value is at least 1 if not empty
                    const value = e.target.value;
                    if (value === '') {
                      setShapeBacksplash(currentShapeIndex, true, 4);
                      return;
                    }
                    const numValue = parseFloat(value);
                    if (isNaN(numValue) || numValue < 1) {
                      setShapeBacksplash(currentShapeIndex, true, 4);
                    } else if (numValue > 20) {
                      setShapeBacksplash(currentShapeIndex, true, 20);
                    }
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="Enter height (max 20)"
                />
                {currentShape.backsplashHeight && currentShape.backsplashHeight > 20 && (
                  <p className="text-red-500 text-sm mt-1">Maximum height is 20 inches</p>
                )}
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Project Summary & Continue Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t">
        <div className="max-w-4xl mx-auto px-4 py-4">
          {/* Project Summary Toggle */}
          <button
            onClick={() => setShowProjectSummary(!showProjectSummary)}
            className="flex items-center justify-between w-full mb-4 p-3 bg-gray-50 rounded-lg"
          >
            <span className="font-medium text-gray-800">Project Summary</span>
            {showProjectSummary ? (
              <ChevronDown className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronUp className="w-5 h-5 text-gray-600" />
            )}
          </button>

          {/* Project Summary Content */}
          {showProjectSummary && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 p-4 bg-gray-50 rounded-lg"
            >
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shapes Completed:</span>
                  <span className="font-medium">{currentShapeIndex + 1} of {selectedShapes.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Current Shape:</span>
                  <span className="font-medium">{currentShape.layout.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Estimated Total:</span>
                  <span className="font-medium">${calculateTotalPrice().toFixed(2)}</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Continue Button */}
          <button
            onClick={handleContinue}
            disabled={!isCurrentShapeComplete()}
            className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-colors ${
              isCurrentShapeComplete()
                ? 'bg-gray-800 hover:bg-gray-900 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {currentShapeIndex < selectedShapes.length - 1 ? 'Next Shape' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
} 