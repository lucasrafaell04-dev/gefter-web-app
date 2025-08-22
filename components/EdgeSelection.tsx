'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, Info, Check, ChevronUp } from 'lucide-react';
import { useProjectStore } from '@/store/useProjectStore';
import { EdgeStyle } from '@/types';
import { useState } from 'react';
import { useEdgeStyles } from '@/hooks/useApiCache';

export default function EdgeSelection() {
  const { selectedEdgeStyle, setSelectedEdgeStyle, nextStep, previousStep, calculateTotalPrice } = useProjectStore();
  const [showProjectSummary, setShowProjectSummary] = useState(false);
  
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
          {edgeStyles.map((edgeStyle) => (
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
                    {/* Edge Style Diagram */}
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                      <div className="text-gray-800">
                        {edgeStyle.name === 'Eased Edge' && (
                          <svg width="32" height="32" viewBox="0 0 40 40" className="text-gray-800">
                            <rect x="5" y="15" width="30" height="10" fill="none" stroke="currentColor" strokeWidth="2" rx="1" />
                          </svg>
                        )}
                        {edgeStyle.name === 'Bullnose' && (
                          <svg width="32" height="32" viewBox="0 0 40 40" className="text-gray-800">
                            <rect x="5" y="15" width="30" height="10" fill="none" stroke="currentColor" strokeWidth="2" rx="5" />
                          </svg>
                        )}
                        {edgeStyle.name === 'Double Radius Edge' && (
                          <svg width="32" height="32" viewBox="0 0 40 40" className="text-gray-800">
                            <path d="M5 15 Q20 10 35 15 Q20 20 5 15" fill="none" stroke="currentColor" strokeWidth="2" />
                            <path d="M5 25 Q20 30 35 25 Q20 20 5 25" fill="none" stroke="currentColor" strokeWidth="2" />
                          </svg>
                        )}
                        {edgeStyle.name === 'Half Bullnose Edge' && (
                          <svg width="32" height="32" viewBox="0 0 40 40" className="text-gray-800">
                            <rect x="5" y="15" width="30" height="10" fill="none" stroke="currentColor" strokeWidth="2" />
                            <path d="M5 15 Q20 10 35 15" fill="none" stroke="currentColor" strokeWidth="2" />
                          </svg>
                        )}
                        {edgeStyle.name === 'Ogee Edge' && (
                          <svg width="32" height="32" viewBox="0 0 40 40" className="text-gray-800">
                            <path d="M5 15 Q15 10 20 15 Q25 20 35 15" fill="none" stroke="currentColor" strokeWidth="2" />
                            <path d="M5 25 Q15 30 20 25 Q25 20 35 25" fill="none" stroke="currentColor" strokeWidth="2" />
                          </svg>
                        )}
                      </div>
                    </div>

                    {/* Edge Style Info */}
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

                  {/* Selection Control */}
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
                  <span className="text-gray-600">Room Type:</span>
                  <span className="font-medium">{useProjectStore.getState().selectedRoom || 'Kitchen'}</span>
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