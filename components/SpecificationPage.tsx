'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Info, ChevronUp, ChevronDown, Minus, Plus, X } from 'lucide-react';
import { useProjectStore } from '@/store/useProjectStore';
import { CutoutOption, SinkOption, LayoutField } from '@/types';
import Image from 'next/image';
import { useLayoutData, useSinks } from '@/hooks/useApiCache';
import { DynamicSvgDiagram } from './MeasurementsPage';

// Mock data for cutouts and sinks - in a real app, this would come from the database
const CUTOUT_OPTIONS: CutoutOption[] = [
  {
    id: 'faucet-cutout',
    name: 'Faucet Cutout',
    description: 'Standard faucet cutout for kitchen sink',
    image: '/assets/images/1-cutout-sink.jpg',
    included: true,
    price: 75
  },
  {
    id: 'cooktop-cutout',
    name: 'Cooktop - 1 included',
    description: 'Standard cooktop cutout',
    image: '/assets/images/cooktop-cutout.jpg',
    included: true,
    price: 150
  },
  {
    id: 'sink-cutout',
    name: 'Sink Cutout',
    description: 'Standard sink cutout',
    image: '/assets/images/sink-cutout.jpg',
    included: true,
    price: 150
  }
];

const COUNTERTOP_REMOVAL_OPTIONS = [
  'Granite',
  'Marble',
  'Quartz',
  'Laminate',
  'Concrete',
  'Other'
];

const SINK_CUTOUT_ID = 'sink-cutout';
const FAUCET_CUTOUT_ID = 'faucet-cutout';

const AUTO_CUTOUT_MESSAGES: Record<string, string> = {
  [SINK_CUTOUT_ID]: 'Este corte é obrigatório porque você selecionou uma pia da loja.',
  [FAUCET_CUTOUT_ID]: 'Este corte é obrigatório porque você selecionou uma torneira da loja.'
};

export default function SpecificationPage() {
  // Selective subscriptions to prevent unnecessary re-renders
  const selectedShapes = useProjectStore(state => state.selectedShapes);
  const preloadedData = useProjectStore(state => state.preloadedData);
  const updateShapeSpecification = useProjectStore(state => state.updateShapeSpecification);
  const updateShapeCutoutQuantity = useProjectStore(state => state.updateShapeCutoutQuantity);
  const updateShapeSinkQuantity = useProjectStore(state => state.updateShapeSinkQuantity);
  const nextStep = useProjectStore(state => state.nextStep);
  const previousStep = useProjectStore(state => state.previousStep);
  
  const [currentShapeIndex, setCurrentShapeIndex] = useState(0);
  const [showProjectSummary, setShowProjectSummary] = useState(false);
  const [selectedSinkImage, setSelectedSinkImage] = useState<{ url: string; name: string } | null>(null);

  const currentShape = selectedShapes[currentShapeIndex];

  // Use cache hook to get layout data for SVG diagram
  const { fields, isLoading: loading, error } = useLayoutData(currentShape?.layout?.id || '');
  const layoutFields = fields.data || [];
  const manualFields = layoutFields.filter(field => field.field_type === 'manual' && field.is_visible);
  const autoCalculatedFields = layoutFields.filter(field => field.field_type === 'auto_calculated' && field.is_visible);

  const { data: sinkOptions = [], isLoading: sinksLoading } = useSinks(currentShape?.environment);

  const getCutoutPrice = (cutoutId: string) => {
    const cutout = CUTOUT_OPTIONS.find(option => option.id === cutoutId);
    return cutout?.price ?? 0;
  };

  const getSinkPrice = (sinkId: string) => {
    const priceFromPreload = preloadedData?.sinkMap?.[sinkId]?.price;
    if (typeof priceFromPreload === 'number') {
      return priceFromPreload;
    }
    const option = sinkOptions.find(sink => sink.id === sinkId);
    return option?.price ?? 0;
  };

  const specificationExtrasTotal = useMemo(() => {
    return selectedShapes.reduce((projectTotal, shape) => {
      const spec = shape.specification;
      if (!spec) return projectTotal;

      let total = projectTotal;

      Object.entries(spec.cutouts || {}).forEach(([cutoutId, quantity]) => {
        total += getCutoutPrice(cutoutId) * quantity;
      });

      Object.entries(spec.sinks || {}).forEach(([sinkId, quantity]) => {
        total += getSinkPrice(sinkId) * quantity;
      });

      return total;
    }, 0);
  }, [selectedShapes, preloadedData?.sinkMap, sinkOptions]);

  const handleSpecificationChange = (field: string, value: string) => {
    if (field === 'needsSink' && value !== 'yes' && currentShape?.specification) {
      const existingSinks = currentShape.specification.sinks || {};
      Object.entries(existingSinks).forEach(([sinkId, qty]) => {
        if (qty > 0) {
          updateShapeSinkQuantity(currentShapeIndex, sinkId, 0);
        }
      });
      syncStoreProductSelection('sink', 0);
    }

    updateShapeSpecification(currentShapeIndex, { [field]: value });
  };

  const handleCutoutQuantityChange = (cutoutId: string, quantity: number) => {
    const nextQuantity = Math.max(0, quantity);
    const autoCount = getAutoCutoutCount(cutoutId);

    if (nextQuantity < autoCount) {
      const message = AUTO_CUTOUT_MESSAGES[cutoutId] || 'Este corte é obrigatório.';
      window.alert(message);
      return;
    }

    updateShapeCutoutQuantity(currentShapeIndex, cutoutId, nextQuantity);
  };

  const handleSinkQuantityChange = (sinkId: string, quantity: number) => {
    const nextQuantity = Math.max(0, quantity);
    updateShapeSinkQuantity(currentShapeIndex, sinkId, nextQuantity);

    const currentSinks = currentShape?.specification?.sinks || {};
    const updatedSinks = {
      ...currentSinks,
      [sinkId]: nextQuantity
    };

    const totalSelected = Object.values(updatedSinks).reduce((sum, qty) => sum + (qty || 0), 0);
    syncStoreProductSelection('sink', totalSelected);
  };

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
    if (!currentShape?.specification) return false;
    
    const spec = currentShape.specification;
    return spec.keepCurrentCabinets && spec.countertopToRemove && spec.hasHolesOrCuts && spec.needsSink;
  };

  const getCurrentCutoutQuantity = (cutoutId: string) => {
    return currentShape?.specification?.cutouts?.[cutoutId] || 0;
  };

  const getCurrentSinkQuantity = (sinkId: string) => {
    return currentShape?.specification?.sinks?.[sinkId] || 0;
  };

  const getAutoCutoutCount = (cutoutId: string) => {
    return currentShape?.specification?.cutoutAutoCount?.[cutoutId] || 0;
  };

  const updateAutoCutoutCount = (cutoutId: string, count: number) => {
    const currentCounts = currentShape?.specification?.cutoutAutoCount || {};
    const nextCounts = { ...currentCounts };

    if (count <= 0) {
      delete nextCounts[cutoutId];
    } else {
      nextCounts[cutoutId] = count;
    }

    updateShapeSpecification(currentShapeIndex, { cutoutAutoCount: nextCounts });
  };

  const enforceCutoutRequirement = (cutoutId: string, requiredCount: number) => {
    const currentQuantity = getCurrentCutoutQuantity(cutoutId);
    const autoCount = getAutoCutoutCount(cutoutId);
    const manualQuantity = Math.max(0, currentQuantity - autoCount);

    if (requiredCount === autoCount) {
      return;
    }

    const newQuantity = manualQuantity + requiredCount;
    updateShapeCutoutQuantity(currentShapeIndex, cutoutId, newQuantity);
    updateAutoCutoutCount(cutoutId, requiredCount);
  };

  const syncStoreProductSelection = (type: 'sink' | 'faucet', totalSelected: number) => {
    const isSelected = totalSelected > 0;
    const specUpdate = type === 'sink'
      ? { selectedSinkFromStore: isSelected }
      : { selectedFaucetFromStore: isSelected };

    updateShapeSpecification(currentShapeIndex, specUpdate);

    const cutoutId = type === 'sink' ? SINK_CUTOUT_ID : FAUCET_CUTOUT_ID;
    enforceCutoutRequirement(cutoutId, totalSelected);
  };

  // Initialize specification if it doesn't exist
  const initializeSpecification = () => {
    if (!currentShape?.specification) {
      updateShapeSpecification(currentShapeIndex, {
        keepCurrentCabinets: undefined,
        countertopToRemove: '',
        hasHolesOrCuts: undefined,
        needsSink: undefined,
        selectedSinkFromStore: false,
        selectedFaucetFromStore: false,
        cutouts: {},
        sinks: {},
        cutoutAutoCount: {}
      });
    }
  };

  // Initialize specification when component mounts or shape changes
  useEffect(() => {
    initializeSpecification();
  }, [currentShapeIndex, currentShape?.layout.id]);

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
            <h1 className="text-xl font-semibold text-gray-800">Specification</h1>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Info className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 pb-32">
        {/* Step Indicator */}
        <div className="text-sm text-gray-500 mb-4">Step 5 of 10</div>

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
          Lorem ipsum dolor sit amet consectetur?
        </h2>

        {/* Kitchen Layout Image */}
        <div className="mb-8">
          <div className="bg-gray-800 rounded-2xl p-6">
            <div className="flex justify-center">
              <div className="w-64 h-64 bg-[#4F5750] rounded-lg flex items-center justify-center overflow-hidden">
                <div className="text-white text-xs font-medium w-full h-full">
                  {!loading && !error && manualFields.length > 0 ? (
                    <DynamicSvgDiagram 
                      layoutName={currentShape.layout.name} 
                      layoutImage={currentShape.layout.layout_image}
                      manualFields={manualFields} 
                      measurements={currentShape.measurements}
                      autoCalculatedFields={autoCalculatedFields}
                    />
                  ) : (
                    <div className="text-white text-sm text-center">
                      <div className="mb-4">{currentShape.layout.name}</div>
                      <div className="text-xs opacity-75">
                        Loading layout diagram...
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Specification Questions */}
        <div className="space-y-6 mb-8">
          {/* Keep Current Cabinets */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-xl p-6 shadow-sm"
          >
            <label className="block text-lg font-medium text-gray-800 mb-4">
              Will you keep the current cabinets?
            </label>
            <select
              value={currentShape.specification?.keepCurrentCabinets || ''}
              onChange={(e) => handleSpecificationChange('keepCurrentCabinets', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            >
              <option value="">Select</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </motion.div>

          {/* Countertop to Remove */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-xl p-6 shadow-sm"
          >
            <label className="block text-lg font-medium text-gray-800 mb-4">
              Select the type of countertop to be removed
            </label>
            <select
              value={currentShape.specification?.countertopToRemove || ''}
              onChange={(e) => handleSpecificationChange('countertopToRemove', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            >
              <option value="">Select</option>
              {COUNTERTOP_REMOVAL_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </motion.div>

          {/* Holes or Cuts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-xl p-6 shadow-sm"
          >
            <label className="block text-lg font-medium text-gray-800 mb-4">
              Will there be holes or cuts in the stone?
            </label>
            <select
              value={currentShape.specification?.hasHolesOrCuts || ''}
              onChange={(e) => handleSpecificationChange('hasHolesOrCuts', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            >
              <option value="">Select</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </motion.div>

          {/* Cutout Options - Only show if hasHolesOrCuts is 'yes' */}
          {currentShape.specification?.hasHolesOrCuts === 'yes' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Indicate the number of cutouts required for each of the following:
              </h3>
              
              {CUTOUT_OPTIONS.map((cutout) => (
                <div key={cutout.id} className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-blue-500">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Info className="w-5 h-5 text-blue-600" />
                      <div>
                        <h4 className="font-medium text-gray-800">{cutout.name}</h4>
                        <p className="text-sm text-gray-600">{cutout.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCutoutQuantityChange(cutout.id, Math.max(0, getCurrentCutoutQuantity(cutout.id) - 1))}
                        className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-medium text-gray-900">{getCurrentCutoutQuantity(cutout.id)}</span>
                      <button
                        onClick={() => handleCutoutQuantityChange(cutout.id, getCurrentCutoutQuantity(cutout.id) + 1)}
                        className="w-8 h-8 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center transition-colors text-white"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                    <Image
                      src={cutout.image}
                      alt={cutout.name}
                      width={64}
                      height={64}
                      className="object-cover w-full h-full"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/assets/images/1-cutout-sink.jpg';
                      }}
                    />
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {/* Sink Requirement */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="bg-white rounded-xl p-6 shadow-sm"
          >
            <label className="block text-lg font-medium text-gray-800 mb-4">
              Will you need a sink or do you already own one?
            </label>
            <select
              value={currentShape.specification?.needsSink || ''}
              onChange={(e) => handleSpecificationChange('needsSink', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            >
              <option value="">Select</option>
              <option value="yes">Yes, I need a sink</option>
              <option value="no">No, I already have one</option>
            </select>
          </motion.div>

          {/* Sink Selection */}
          {currentShape.specification?.needsSink === 'yes' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Select the quantity for each sink that you want to purchase and click continue:
              </h3>
              
            {sinksLoading && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500" />
              </div>
            )}

            {!sinksLoading && sinkOptions.length === 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-dashed border-gray-300 text-center text-sm text-gray-600">
                No sinks available for this room yet. Please contact support if this persists.
              </div>
            )}

            {!sinksLoading && sinkOptions.map((sink) => (
                <div key={sink.id} className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-green-500">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Info className="w-5 h-5 text-green-600" />
                      <div>
                        <h4 className="font-medium text-gray-800">{sink.name}</h4>
                      {sink.description && <p className="text-sm text-gray-600">{sink.description}</p>}
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-sm font-semibold text-gray-800">
                          {sink.price === 0 ? 'Included' : `$${sink.price.toFixed(2)}`}
                        </span>
                        {sink.price > 0 && (
                          <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                            + Add-on
                          </span>
                        )}
                      </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSinkQuantityChange(sink.id, Math.max(0, getCurrentSinkQuantity(sink.id) - 1))}
                        className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-medium text-gray-900">{getCurrentSinkQuantity(sink.id)}</span>
                      <button
                        onClick={() => handleSinkQuantityChange(sink.id, getCurrentSinkQuantity(sink.id) + 1)}
                        className="w-8 h-8 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center transition-colors text-white"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                <button
                  onClick={() => setSelectedSinkImage({ url: sink.assetUrl || '/assets/images/1-cutout-sink.jpg', name: sink.name })}
                  className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-green-500 transition-all"
                >
                    <Image
                    src={sink.assetUrl || '/assets/images/1-cutout-sink.jpg'}
                      alt={sink.name}
                    width={96}
                    height={96}
                      className="object-cover w-full h-full"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/assets/images/1-cutout-sink.jpg';
                      }}
                    />
                  </button>
                </div>
            ))}
            </motion.div>
          )}
        </div>
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
                  <span className="text-gray-900">Shapes Completed:</span>
                  <span className="font-semibold text-gray-900">{currentShapeIndex + 1} of {selectedShapes.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-900">Current Shape:</span>
                  <span className="font-semibold text-gray-900">{currentShape.layout.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-900">Selected Items Total:</span>
                  <span className="font-semibold text-gray-900">${specificationExtrasTotal.toFixed(2)}</span>
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

      {/* Sink Image Modal */}
      {selectedSinkImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4"
          onClick={() => setSelectedSinkImage(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative max-w-4xl max-h-[90vh] w-full bg-white rounded-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-4 right-4 z-10">
              <button
                onClick={() => setSelectedSinkImage(null)}
                className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-6 h-6 text-gray-800" />
              </button>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">{selectedSinkImage.name}</h3>
              <div className="relative w-full h-[70vh] bg-gray-100 rounded-lg overflow-hidden">
                <Image
                  src={selectedSinkImage.url}
                  alt={selectedSinkImage.name}
                  fill
                  className="object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/assets/images/1-cutout-sink.jpg';
                  }}
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
} 