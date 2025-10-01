'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, Info, Check, Plus, ChevronUp, X, Minus } from 'lucide-react';
import { useProjectStore } from '@/store/useProjectStore';
import { Layout } from '@/types';
import React, { useState } from 'react';
import { getShapePngImage } from '@/data/shapeImageMap';
import Image from 'next/image';
import { useLayouts } from '@/hooks/useApiCache';

export default function LayoutSelection() {
  // Selective subscriptions to prevent unnecessary re-renders
  const selectedShapes = useProjectStore(state => state.selectedShapes);
  const selectedEnvironments = useProjectStore(state => state.selectedEnvironments);
  const addSelectedShape = useProjectStore(state => state.addSelectedShape);
  const removeSelectedShape = useProjectStore(state => state.removeSelectedShape);
  const nextStep = useProjectStore(state => state.nextStep);
  const previousStep = useProjectStore(state => state.previousStep);
  const calculateTotalPrice = useProjectStore(state => state.calculateTotalPrice);
  const calculatePriceByEnvironment = useProjectStore(state => state.calculatePriceByEnvironment);
  const [showProjectSummary, setShowProjectSummary] = useState(false);
  const [activeTab, setActiveTab] = useState<'kitchen' | 'bathroom'>('kitchen');
  
  // Set active tab to the first selected environment if only one is selected
  React.useEffect(() => {
    if (selectedEnvironments.length === 1) {
      setActiveTab(selectedEnvironments[0]);
    } else if (selectedEnvironments.length > 1 && !selectedEnvironments.includes(activeTab)) {
      setActiveTab(selectedEnvironments[0]);
    }
  }, [selectedEnvironments, activeTab]);
  
  // Use cache hook instead of manual fetch
  const { data: layouts = [], isLoading: loading, error } = useLayouts();

  const handleAddShape = (layout: Layout) => {
    const newShape = {
      layout,
      environment: activeTab,
      measurements: {},
      wallToggles: {},
      hasBacksplash: false,
    };
    addSelectedShape(newShape);
  };

  const handleRemoveShape = (layout: Layout) => {
    // Find the last occurrence of this shape type for the current environment and remove it
    let shapeIndex = -1;
    for (let i = selectedShapes.length - 1; i >= 0; i--) {
      const shape = selectedShapes[i];
      if (shape.layout.id === layout.id && shape.environment === activeTab) {
        shapeIndex = i;
        break;
      }
    }
    if (shapeIndex !== -1) {
      removeSelectedShape(shapeIndex);
    }
  };

  const handleContinue = () => {
    if (selectedShapes.length > 0) {
      nextStep();
    }
  };

  const isShapeSelected = (layoutId: string) => {
    return selectedShapes.some(shape => shape.layout.id === layoutId && shape.environment === activeTab);
  };

  const getShapeCount = (layoutId: string) => {
    return selectedShapes.filter(shape => shape.layout.id === layoutId && shape.environment === activeTab).length;
  };



  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={previousStep}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <h1 className="text-xl font-semibold text-gray-800">Select shape</h1>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Info className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 pb-32">
        {/* Step Indicator */}
        <div className="text-sm text-gray-500 mb-4">Step 3 of 8</div>

        {/* Question */}
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8">
          What is the best format for your {activeTab}?
        </h2>

        {/* Environment Tabs */}
        {selectedEnvironments.length > 1 && (
          <div className="mb-8">
            <div className="flex space-x-1 bg-gray-200 p-1 rounded-lg w-fit">
              {selectedEnvironments.map((environment) => (
                <button
                  key={environment}
                  onClick={() => setActiveTab(environment)}
                  className={`px-6 py-3 rounded-md font-medium transition-colors ${
                    activeTab === environment
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {environment === 'kitchen' ? 'Kitchen' : 'Bathroom'}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading layouts...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">Failed to load layouts</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-2 text-red-600 hover:text-red-800 underline"
            >
              Try again
            </button>
          </div>
        )}



        {/* Layout Options */}
        <div className="space-y-4">
          {layouts.map((layout) => (
            <motion.div
              key={layout.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div
                className={`w-full p-4 md:p-6 bg-gray-800 rounded-2xl text-left transition-all duration-300 ${
                  isShapeSelected(layout.id)
                    ? 'ring-2 ring-blue-500 shadow-lg'
                    : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                    {/* Layout Image */}
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-lg flex items-center justify-center border border-gray-200 overflow-hidden flex-shrink-0">
                      <Image
                        src={getShapePngImage(layout.name)}
                        alt={layout.name}
                        width={80}
                        height={80}
                        className="object-contain w-full h-full"
                        onError={(e) => {
                          // Fallback to a default image if the shape image fails to load
                          const target = e.target as HTMLImageElement;
                          target.src = '/assets/images/shapeSelector/LShape.png';
                        }}
                      />
                    </div>

                    {/* Layout Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold text-base md:text-lg truncate">{layout.name}</h3>
                      <p className="text-gray-300 text-xs md:text-sm leading-relaxed">
                        {layout.description}
                      </p>
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
                    {/* Quantity Display */}
                    <div className="text-white text-xs md:text-sm bg-blue-500 px-2 md:px-3 py-1 rounded-full font-medium">
                      {getShapeCount(layout.id)}
                    </div>
                    
                    {/* Add/Remove Buttons */}
                    <div className="flex items-center gap-1 md:gap-2">
                      <button
                        onClick={() => handleRemoveShape(layout)}
                        disabled={getShapeCount(layout.id) === 0}
                        className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center transition-colors ${
                          getShapeCount(layout.id) > 0
                            ? 'bg-red-500 hover:bg-red-600 text-white'
                            : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        }`}
                        title="Remove one"
                      >
                        <Minus className="w-3 h-3 md:w-4 md:h-4" />
                      </button>
                      
                      <button
                        onClick={() => handleAddShape(layout)}
                        className="w-7 h-7 md:w-8 md:h-8 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center transition-colors text-white"
                        title="Add one"
                      >
                        <Plus className="w-3 h-3 md:w-4 md:h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
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
            <ChevronUp 
              className={`w-5 h-5 text-gray-600 transition-transform ${
                showProjectSummary ? 'rotate-180' : ''
              }`} 
            />
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
                  <span className="text-gray-600">Selected Shapes:</span>
                  <span className="font-medium">{selectedShapes.length}</span>
                </div>
                
                {/* Environment-specific pricing */}
                {selectedEnvironments.length > 1 && (() => {
                  const environmentPricing = calculatePriceByEnvironment();
                  return (
                    <>
                      {selectedEnvironments.includes('kitchen') && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Kitchen Total:</span>
                          <span className="font-medium">${environmentPricing.kitchen.toFixed(2)}</span>
                        </div>
                      )}
                      {selectedEnvironments.includes('bathroom') && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Bathroom Total:</span>
                          <span className="font-medium">${environmentPricing.bathroom.toFixed(2)}</span>
                        </div>
                      )}
                    </>
                  );
                })()}
                
                <div className="flex justify-between text-sm font-semibold border-t pt-2">
                  <span className="text-gray-800">Total Estimated:</span>
                  <span className="font-bold">${calculateTotalPrice().toFixed(2)}</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Continue Button */}
          <button
            onClick={handleContinue}
            disabled={selectedShapes.length === 0}
            className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-colors ${
              selectedShapes.length > 0
                ? 'bg-gray-800 hover:bg-gray-900 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
} 