'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Info, ChevronUp, ChevronDown, Minus, Plus } from 'lucide-react';
import { useProjectStore } from '@/store/useProjectStore';
import { CutoutOption, SinkOption } from '@/types';
import Image from 'next/image';

// Mock data for cutouts and sinks - in a real app, this would come from the database
const CUTOUT_OPTIONS: CutoutOption[] = [
  {
    id: 'faucet-cutout',
    name: 'Faucet cutout',
    description: 'Standard faucet cutout for kitchen sink',
    image: '/assets/images/1-cutout-sink.jpg',
    included: true,
    price: 0
  },
  {
    id: 'cooktop-cutout',
    name: 'Cooktop - 1 included',
    description: 'Standard cooktop cutout',
    image: '/assets/images/cooktop-cutout.jpg',
    included: true,
    price: 0
  }
];

const SINK_OPTIONS: SinkOption[] = [
  {
    id: 'free-stainless-sink',
    name: 'Free Stainless Steel Sink',
    description: 'High-quality stainless steel sink included',
    image: '/assets/images/1-cutout-sink.jpg',
    price: 0,
    included: true
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

export default function SpecificationPage() {
  // Selective subscriptions to prevent unnecessary re-renders
  const selectedShapes = useProjectStore(state => state.selectedShapes);
  const updateShapeSpecification = useProjectStore(state => state.updateShapeSpecification);
  const updateShapeCutoutQuantity = useProjectStore(state => state.updateShapeCutoutQuantity);
  const updateShapeSinkQuantity = useProjectStore(state => state.updateShapeSinkQuantity);
  const nextStep = useProjectStore(state => state.nextStep);
  const previousStep = useProjectStore(state => state.previousStep);
  const calculateTotalPrice = useProjectStore(state => state.calculateTotalPrice);
  
  const [currentShapeIndex, setCurrentShapeIndex] = useState(0);
  const [showProjectSummary, setShowProjectSummary] = useState(false);

  const currentShape = selectedShapes[currentShapeIndex];

  const handleSpecificationChange = (field: string, value: string) => {
    updateShapeSpecification(currentShapeIndex, { [field]: value });
  };

  const handleCutoutQuantityChange = (cutoutId: string, quantity: number) => {
    updateShapeCutoutQuantity(currentShapeIndex, cutoutId, quantity);
  };

  const handleSinkQuantityChange = (sinkId: string, quantity: number) => {
    updateShapeSinkQuantity(currentShapeIndex, sinkId, quantity);
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
    return spec.keepCurrentCabinets && spec.countertopToRemove && spec.hasHolesOrCuts;
  };

  const getCurrentCutoutQuantity = (cutoutId: string) => {
    return currentShape?.specification?.cutouts?.[cutoutId] || 0;
  };

  const getCurrentSinkQuantity = (sinkId: string) => {
    return currentShape?.specification?.sinks?.[sinkId] || 0;
  };

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
        <div className="text-sm text-gray-500 mb-4">Step 5 of 7</div>

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
              <div className="w-64 h-64 bg-[#4F5750] rounded-lg flex items-center justify-center">
                <div className="text-white text-sm text-center">
                  <div className="mb-4">L-Shaped Kitchen Layout</div>
                  <div className="text-xs opacity-75">
                    Sink area with faucet and burners
                  </div>
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      <span className="w-8 text-center font-medium">{getCurrentCutoutQuantity(cutout.id)}</span>
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

          {/* Sink Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Select the quantity for each sink that you want to purchase and click continue:
            </h3>
            
            {SINK_OPTIONS.map((sink) => (
              <div key={sink.id} className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-green-500">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Info className="w-5 h-5 text-green-600" />
                    <div>
                      <h4 className="font-medium text-gray-800">{sink.name}</h4>
                      <p className="text-sm text-gray-600">{sink.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSinkQuantityChange(sink.id, Math.max(0, getCurrentSinkQuantity(sink.id) - 1))}
                      className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-medium">{getCurrentSinkQuantity(sink.id)}</span>
                    <button
                      onClick={() => handleSinkQuantityChange(sink.id, getCurrentSinkQuantity(sink.id) + 1)}
                      className="w-8 h-8 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center transition-colors text-white"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                  <Image
                    src={sink.image}
                    alt={sink.name}
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