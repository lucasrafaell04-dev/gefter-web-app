'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, Download, Share2, Printer, ChevronDown, ChevronRight } from 'lucide-react';
import { useProjectStore } from '@/store/useProjectStore';
import { useState } from 'react';
import { CalculationEngine } from '@/utils/calculations';

export default function ProjectSummary() {
  const [expandedShapes, setExpandedShapes] = useState<Set<number>>(new Set());
  
  const { 
    selectedEnvironments, 
    selectedShapes, 
    selectedMaterial, 
    selectedEdgeStyle, 
    leadInfo,
    calculateTotalPrice,
    calculatePriceByEnvironment,
    resetProject,
    setCurrentStep,
    preloadedData
  } = useProjectStore();

  const toggleShapeExpansion = (shapeIndex: number) => {
    const newExpanded = new Set(expandedShapes);
    if (newExpanded.has(shapeIndex)) {
      newExpanded.delete(shapeIndex);
    } else {
      newExpanded.add(shapeIndex);
    }
    setExpandedShapes(newExpanded);
  };

  const totalPrice = calculateTotalPrice();

  // Calculate edge and material costs for each shape
  const shapeCalculations = selectedShapes.map(shape => {
    const squareFeet = CalculationEngine.calculateSquareFeet(shape.layout, shape.measurements);
    const edgeCalculation = CalculationEngine.calculateEdgeLinearFeet(
      shape.measurements, 
      shape.wallToggles, 
      shape.layout.name
    );
    
    const materialCalculation = selectedMaterial 
      ? CalculationEngine.calculateMaterialCost(squareFeet, selectedMaterial)
      : { squareFeet, materialPrice: 0, totalMaterialCost: 0 };
    
    const finalEdgeCalculation = selectedEdgeStyle 
      ? CalculationEngine.calculateEdgeCost(edgeCalculation, selectedEdgeStyle)
      : edgeCalculation;

    return {
      shape,
      squareFeet,
      edgeCalculation: finalEdgeCalculation,
      materialCalculation
    };
  });

  const handleStartNewProject = () => {
    resetProject();
    setCurrentStep(1);
  };

  const handleEditProject = () => {
    setCurrentStep(2); // Go back to layout selection
  };

  const handleDownloadQuote = () => {
    // Generate and download quote PDF
    const quoteData = {
      environments: selectedEnvironments,
      shapes: selectedShapes,
      material: selectedMaterial,
      edgeStyle: selectedEdgeStyle,
      leadInfo,
      totalPrice,
      date: new Date().toLocaleDateString(),
    };
    
    // For now, just log the data
    console.log('Quote Data:', quoteData);
    alert('Quote download functionality would be implemented here');
  };

  const handleShareQuote = () => {
    // Share quote functionality
    alert('Share functionality would be implemented here');
  };

  const handlePrintQuote = () => {
    // Print quote functionality
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentStep(9)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <h1 className="text-xl font-semibold text-gray-800">Project Summary</h1>
            <div className="w-10"></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">


        {/* Success Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Quote Generated Successfully!</h2>
          <p className="text-gray-600">Your custom countertop quote is ready</p>
        </motion.div>

        {/* Quote Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-8"
        >
          {/* Quote Header */}
          <div className="border-b border-gray-200 pb-4 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-gray-800">Geffter Countertops</h3>
                <p className="text-gray-600">Custom Countertop Quote</p>
                <p className="text-sm text-gray-500 mt-1">
                  Generated on {new Date().toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-800">${totalPrice.toFixed(2)}</div>
                <div className="text-sm text-gray-600">Total Estimate</div>
              </div>
            </div>
          </div>

          {/* Project Details */}
          <div className="space-y-6">
            {/* Room Type */}
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Room Type</h4>
              <div className="bg-gray-50 rounded-lg p-3">
                <span className="text-gray-700 capitalize">{selectedEnvironments.join(', ')}</span>
              </div>
            </div>

            {/* Selected Shapes */}
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Selected Shapes</h4>
              <div className="space-y-4">
                {selectedShapes.map((shape, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleShapeExpansion(index)}
                          className="p-1 hover:bg-gray-200 rounded transition-colors"
                        >
                          {expandedShapes.has(index) ? (
                            <ChevronDown className="w-4 h-4 text-gray-600" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-gray-600" />
                          )}
                        </button>
                        <span className="text-gray-700 font-medium">{shape.layout.name}</span>
                      </div>
                      <span className="text-sm text-gray-500">
                        Shape {index + 1} of {selectedShapes.length}
                      </span>
                    </div>
                    
                    {/* Collapsed Summary */}
                    {!expandedShapes.has(index) && (
                      <div className="text-sm text-gray-600">
                        {Object.keys(shape.measurements).length} measurements
                        {shape.hasBacksplash && ' • Backsplash included'}
                        {shape.specification?.cutouts && Object.values(shape.specification.cutouts).some(qty => qty > 0) && 
                          ` • ${Object.values(shape.specification.cutouts).reduce((sum, qty) => sum + qty, 0)} cutouts`}
                        {shape.specification?.sinks && Object.values(shape.specification.sinks).some(qty => qty > 0) && 
                          ` • ${Object.values(shape.specification.sinks).reduce((sum, qty) => sum + qty, 0)} sinks`}
                      </div>
                    )}
                    
                    {/* Expandable Content */}
                    <AnimatePresence>
                      {expandedShapes.has(index) && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="space-y-3"
                        >
                        {/* Measurements */}
                        <div className="mb-3">
                          <h5 className="text-sm font-medium text-gray-800 mb-2">Measurements:</h5>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            {Object.entries(shape.measurements).map(([field, value]) => (
                              <div key={field} className="flex justify-between">
                                <span className="text-gray-700">{field}:</span>
                                <span className="font-medium text-gray-900">{value}"</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Wall Toggles */}
                        {Object.keys(shape.wallToggles || {}).length > 0 && (
                          <div className="mb-3">
                            <h5 className="text-sm font-medium text-gray-800 mb-2">Wall Contact:</h5>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              {Object.entries(shape.wallToggles).map(([field, isWall]) => (
                                <div key={field} className="flex justify-between">
                                  <span className="text-gray-700">{field}:</span>
                                  <span className={`font-medium ${isWall ? 'text-blue-600' : 'text-gray-500'}`}>
                                    {isWall ? 'Wall' : 'No Wall'}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Backsplash */}
                        {shape.hasBacksplash && (
                          <div className="mb-3">
                            <div className="text-sm text-blue-600">
                              ✓ Backsplash included ({shape.backsplashHeight}" height)
                            </div>
                          </div>
                        )}

                        {/* Specifications */}
                        {shape.specification && (
                          <div>
                            <h5 className="text-sm font-medium text-gray-800 mb-2">Specifications:</h5>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-700">Keep cabinets:</span>
                                <span className="font-medium text-gray-900 capitalize">{shape.specification.keepCurrentCabinets}</span>
                              </div>
                              {shape.specification.countertopToRemove && (
                                <div className="flex justify-between">
                                  <span className="text-gray-700">Remove countertop:</span>
                                  <span className="font-medium text-gray-900">{shape.specification.countertopToRemove}</span>
                                </div>
                              )}
                              <div className="flex justify-between">
                                <span className="text-gray-700">Holes/cuts:</span>
                                <span className="font-medium text-gray-900 capitalize">{shape.specification.hasHolesOrCuts}</span>
                              </div>
                              
                              {/* Cutouts */}
                              {shape.specification.cutouts && Object.keys(shape.specification.cutouts).length > 0 && (
                                <div className="mt-2">
                                  <div className="text-gray-700 text-xs mb-1">Cutouts:</div>
                                  {Object.entries(shape.specification.cutouts).map(([cutoutId, quantity]) => (
                                    <div key={cutoutId} className="flex justify-between text-xs">
                                      <span className="text-gray-600">{cutoutId}:</span>
                                      <span className="font-medium text-gray-900">{quantity}</span>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Sinks */}
                              {shape.specification.sinks && Object.keys(shape.specification.sinks).length > 0 && (
                                <div className="mt-2">
                                  <div className="text-gray-700 text-xs mb-1">Sinks:</div>
                                  {Object.entries(shape.specification.sinks).map(([sinkId, quantity]) => {
                                    const sinkDetails = preloadedData?.sinkMap?.[sinkId];
                                    const sinkName = sinkDetails?.name || sinkId;
                                    const unitPrice = sinkDetails?.price ?? 0;
                                    return (
                                      <div key={sinkId} className="flex justify-between text-xs">
                                        <span className="text-gray-600">{sinkName}</span>
                                        <span className="font-medium text-gray-900">
                                          {quantity}
                                          {sinkDetails && (
                                            <span className="text-gray-500 ml-2">
                                              × ${unitPrice.toFixed(2)} = ${(unitPrice * quantity).toFixed(2)}
                                            </span>
                                          )}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Calculations */}
                        <div className="border-t border-gray-200 pt-3">
                          <h5 className="text-sm font-medium text-gray-800 mb-2">Calculations:</h5>
                          <div className="space-y-2 text-sm">
                            {/* Square Feet */}
                            <div className="flex justify-between">
                              <span className="text-gray-700">Square Feet:</span>
                              <span className="font-medium text-gray-900">
                                {shapeCalculations[index].squareFeet.toFixed(3)} sq ft
                              </span>
                            </div>

                            {/* Material Cost */}
                            {selectedMaterial && (
                              <div className="flex justify-between">
                                <span className="text-gray-700">Material Cost:</span>
                                <span className="font-medium text-gray-900">
                                  ${shapeCalculations[index].materialCalculation.totalMaterialCost.toFixed(2)}
                                  <span className="text-gray-500 text-xs ml-1">
                                    ({shapeCalculations[index].materialCalculation.squareFeet.toFixed(3)} sq ft × ${selectedMaterial.price_per_sqft}/sq ft)
                                  </span>
                                </span>
                              </div>
                            )}

                            {/* Edge Linear Feet */}
                            <div className="flex justify-between">
                              <span className="text-gray-700">Edge Linear Feet:</span>
                              <span className="font-medium text-gray-900">
                                {shapeCalculations[index].edgeCalculation.linearFeet.toFixed(3)} ft
                                {shapeCalculations[index].edgeCalculation.excludedWalls.length > 0 && (
                                  <span className="text-gray-500 text-xs ml-1">
                                    (excludes: {shapeCalculations[index].edgeCalculation.excludedWalls.join(', ')})
                                  </span>
                                )}
                              </span>
                            </div>

                            {/* Edge Cost */}
                            {selectedEdgeStyle && (
                              <div className="flex justify-between">
                                <span className="text-gray-700">Edge Cost:</span>
                                <span className="font-medium text-gray-900">
                                  ${shapeCalculations[index].edgeCalculation.totalEdgeCost.toFixed(2)}
                                  <span className="text-gray-500 text-xs ml-1">
                                    ({shapeCalculations[index].edgeCalculation.linearFeet.toFixed(3)} ft × ${selectedEdgeStyle.price_per_linear_ft}/ft)
                                  </span>
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>

            {/* Selected Material */}
            {selectedMaterial && (
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Selected Material</h4>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-gray-700 font-medium">{selectedMaterial.name}</span>
                      <div className="text-sm text-gray-500">{selectedMaterial.brand}</div>
                    </div>
                    <span className="text-gray-700">${selectedMaterial.price_per_sqft}/sq ft</span>
                  </div>
                </div>
              </div>
            )}

            {/* Selected Edge Style */}
            {selectedEdgeStyle && (
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Selected Edge Style</h4>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-gray-700 font-medium">{selectedEdgeStyle.name}</span>
                      <div className="text-sm text-gray-500">{selectedEdgeStyle.thickness}</div>
                    </div>
                    <span className="text-gray-700">${selectedEdgeStyle.price_per_linear_ft}/linear ft</span>
                  </div>
                </div>
                

              </div>
            )}
          </div>

                  {/* Promo Code */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="font-semibold text-gray-800 mb-3">Promo Code</h4>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter promo code"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            />
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Apply
            </button>
          </div>
        </div>

        {/* Lead Information */}
        {leadInfo && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="font-semibold text-gray-800 mb-3">Contact Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Name:</span>
                <span className="ml-2 font-medium text-gray-900">{leadInfo.fullName}</span>
              </div>
              <div>
                <span className="text-gray-600">Email:</span>
                <span className="ml-2 font-medium text-gray-900">{leadInfo.email}</span>
              </div>
              <div>
                <span className="text-gray-600">Phone:</span>
                <span className="ml-2 font-medium text-gray-900">{leadInfo.phone}</span>
              </div>
              <div>
                <span className="text-gray-600">Address:</span>
                <span className="ml-2 font-medium text-gray-900">{leadInfo.streetAddress}</span>
              </div>
              <div>
                <span className="text-gray-600">City:</span>
                <span className="ml-2 font-medium text-gray-900">{leadInfo.city}, {leadInfo.state} {leadInfo.zipCode}</span>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={handleDownloadQuote}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Download Quote
          </button>
          <button
            onClick={handleShareQuote}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>
          <button
            onClick={handlePrintQuote}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
        </div>
        </motion.div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            onClick={handleEditProject}
            className="flex-1 py-4 px-6 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl font-semibold text-lg transition-colors"
          >
            Edit Project
          </motion.button>
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            onClick={handleStartNewProject}
            className="flex-1 py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-lg transition-colors"
          >
            Start New Project
          </motion.button>
        </div>

        {/* Buy Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-6"
        >
          <button
            onClick={handleDownloadQuote}
            className="w-full py-4 px-6 bg-gray-800 hover:bg-gray-900 text-white rounded-xl font-semibold text-lg transition-colors"
          >
            Buy
          </button>
        </motion.div>

        {/* Additional Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-8 p-6 bg-blue-50 rounded-xl"
        >
          <h4 className="font-semibold text-blue-800 mb-2">What's Next?</h4>
          <ul className="text-blue-700 text-sm space-y-1">
            <li>• Our team will review your quote within 24 hours</li>
            <li>• You'll receive a detailed proposal with installation timeline</li>
            <li>• Schedule a consultation to discuss your project in detail</li>
            <li>• Final measurements will be taken at your location</li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
} 