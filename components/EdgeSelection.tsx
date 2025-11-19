'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, Info, Check, ChevronUp } from 'lucide-react';
import Image from 'next/image';
import { useProjectStore } from '@/store/useProjectStore';
import { EdgeStyle } from '@/types';
import { useEdgeStyles } from '@/hooks/useApiCache';
import { useState } from 'react';

export default function EdgeSelection() {
  const { selectedEdgeStyle, setSelectedEdgeStyle, nextStep, previousStep, calculateTotalPrice } = useProjectStore();
  const [showProjectSummary, setShowProjectSummary] = useState(false);
  const [failedImageMap, setFailedImageMap] = useState<Record<string, boolean>>({});
  
  // Use cache hook instead of manual fetch
  const { data: edgeStyles = [], isLoading: loading, error } = useEdgeStyles();

  const handleEdgeSelect = (edgeStyle: EdgeStyle) => {
    setSelectedEdgeStyle(edgeStyle);
  };

  const handleContinue = () => {
    if (selectedEdgeStyle) {
      nextStep();
    }
  };

  const resolveEdgeImage = (image?: string | null) => {
    if (!image) return null;
    if (/^https?:\/\//i.test(image)) {
      return image;
    }
    if (image.startsWith('/')) {
      return image;
    }
    return `/assets/${image.replace(/^\/+/, '')}`;
  };

  const handleImageError = (edgeId: string) => {
    setFailedImageMap((prev) => ({
      ...prev,
      [edgeId]: true,
    }));
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
            <h1 className="text-xl font-semibold text-gray-800">Select edge style</h1>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Info className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 pb-32">
        {/* Step Indicator */}
        <div className="text-sm text-gray-500 mb-4">Step 7 of 10</div>

        {/* Question */}
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8">
          What edge style would you like for your countertop?
        </h2>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading edge styles...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">Failed to load edge styles</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-2 text-red-600 hover:text-red-800 underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Edge Style Options */}
        <div className="space-y-4">
          {edgeStyles.map((edgeStyle) => {
            const imageSrc = resolveEdgeImage(edgeStyle.image);
            const showImage = imageSrc && !failedImageMap[edgeStyle.id];
            return (
              <motion.div
                key={edgeStyle.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <button
                  onClick={() => handleEdgeSelect(edgeStyle)}
                  className={`w-full p-4 md:p-6 bg-gray-800 rounded-xl text-left transition-all duration-300 ${
                    selectedEdgeStyle?.id === edgeStyle.id
                      ? 'ring-2 ring-blue-500 shadow-lg'
                      : 'hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                        {showImage ? (
                          <Image
                            src={imageSrc as string}
                            alt={`${edgeStyle.name} edge preview`}
                            width={80}
                            height={80}
                            className="object-cover w-full h-full"
                            onError={() => handleImageError(edgeStyle.id)}
                          />
                        ) : (
                          <div className="text-gray-400 text-xs font-medium text-center px-2">
                            Image unavailable
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold text-base md:text-lg truncate">{edgeStyle.name}</h3>
                        <p className="text-gray-300 text-xs md:text-sm leading-relaxed">{edgeStyle.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="bg-gray-700 text-gray-200 px-2 py-1 rounded-full text-xs font-medium">
                            {edgeStyle.thickness}
                          </span>
                          <span className="text-gray-400 text-xs md:text-sm">
                            ${edgeStyle.price_per_linear_ft}/linear ft
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      {selectedEdgeStyle?.id === edgeStyle.id ? (
                        <div className="w-7 h-7 md:w-8 md:h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 md:w-4 md:h-4 text-white" />
                        </div>
                      ) : (
                        <div className="w-7 h-7 md:w-8 md:h-8 border-2 border-gray-600 rounded-full" />
                      )}
                    </div>
                  </div>
                </button>
              </motion.div>
            );
          })}
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
                  <span className="text-gray-600">Room Type:</span>
                  <span className="font-medium">{useProjectStore.getState().selectedEnvironments.join(', ') || 'Kitchen'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Selected Layouts:</span>
                  <span className="font-medium">{useProjectStore.getState().selectedShapes.length} shapes</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Selected Material:</span>
                  <span className="font-medium">{useProjectStore.getState().selectedMaterial?.name || 'None'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Selected Edge Style:</span>
                  <span className="font-medium">{selectedEdgeStyle?.name || 'None'}</span>
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
            disabled={!selectedEdgeStyle}
            className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-colors ${
              selectedEdgeStyle
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