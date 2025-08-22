'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, Info, Check, Star, ChevronUp } from 'lucide-react';
import { useProjectStore } from '@/store/useProjectStore';
import { Material } from '@/types';
import { useState } from 'react';
import Image from 'next/image';
import { useMaterials } from '@/hooks/useApiCache';

export default function MaterialSelection() {
  // Selective subscriptions to prevent unnecessary re-renders
  const selectedMaterial = useProjectStore(state => state.selectedMaterial);
  const setSelectedMaterial = useProjectStore(state => state.setSelectedMaterial);
  const nextStep = useProjectStore(state => state.nextStep);
  const previousStep = useProjectStore(state => state.previousStep);
  const calculateTotalPrice = useProjectStore(state => state.calculateTotalPrice);
  const [showProjectSummary, setShowProjectSummary] = useState(false);
  const [showMoreDetails, setShowMoreDetails] = useState(false);
  // Use cache hook instead of manual fetch
  const { data: materials = [], isLoading: loading, error } = useMaterials();

  const handleMaterialSelect = (material: Material) => {
    setSelectedMaterial(material);
  };

  const handleContinue = () => {
    if (selectedMaterial) {
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
            <h1 className="text-xl font-semibold text-gray-800">Select material</h1>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Info className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 pb-32">
        {/* Step Indicator */}
        <div className="text-sm text-gray-500 mb-4">Step 6 of 10</div>

        {/* Question */}
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8">
          What is the best format for your kitchen?
        </h2>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading materials...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">Failed to load materials</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-2 text-red-600 hover:text-red-800 underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Featured Material Display */}
        {selectedMaterial && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden">
              {/* Material Image */}
              <Image
                src={selectedMaterial.image || '/assets/images/ic2rl_7.jpg'}
                alt={selectedMaterial.name}
                fill
                className="object-cover"
                onError={(e) => {
                  // Fallback to a default image if the material image fails to load
                  const target = e.target as HTMLImageElement;
                  target.src = '/assets/images/ic2rl_7.jpg';
                }}
              />
              
              {/* Overlay with Material Info */}
              <div className="absolute bottom-0 left-0 right-0 bg-gray-800 bg-opacity-90 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-white font-semibold text-lg">{selectedMaterial.name}</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-white text-sm">5/5 Reviews</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Material Description */}
            <div className="mt-6">
              <p className="text-gray-600 mb-4">
                {selectedMaterial.desc_Curta || selectedMaterial.desc_Longa || `${selectedMaterial.name} is a premium quality material with excellent durability and aesthetic appeal. Perfect for modern kitchen designs.`}
              </p>
              
              {/* More Details Toggle */}
              <button
                onClick={() => setShowMoreDetails(!showMoreDetails)}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                More Details
              </button>

              {showMoreDetails && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 p-4 bg-gray-50 rounded-lg"
                >
                  <div className="space-y-2 text-sm">
                    <div><strong>Brand:</strong> {selectedMaterial.brand || 'N/A'}</div>
                    <div><strong>Color:</strong> {selectedMaterial.color || 'N/A'}</div>
                    <div><strong>Thickness:</strong> {selectedMaterial.thickness}"</div>
                    <div><strong>Price:</strong> ${selectedMaterial.price_per_sqft}/sq ft</div>
                    <div><strong>Surface:</strong> {selectedMaterial.Surface || 'N/A'}</div>
                    <div><strong>Care:</strong> {selectedMaterial.Care || 'N/A'}</div>
                    <div><strong>Warranty:</strong> {selectedMaterial.Warranty || 'N/A'}</div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {/* Material Selection Options */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Select material:</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {materials.map((material) => (
              <motion.div
                key={material.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <button
                  onClick={() => handleMaterialSelect(material)}
                  className={`w-full aspect-square rounded-xl overflow-hidden relative group transition-all duration-300 ${
                    selectedMaterial?.id === material.id
                      ? 'ring-4 ring-blue-500 shadow-lg'
                      : 'hover:shadow-md'
                  }`}
                >
                  {/* Material Image */}
                  <Image
                    src={material.image || '/assets/images/ic2rl_7.jpg'}
                    alt={material.name}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      // Fallback to a default image if the material image fails to load
                      const target = e.target as HTMLImageElement;
                      target.src = '/assets/images/ic2rl_7.jpg';
                    }}
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-30 transition-all duration-300" />

                  {/* Material Name */}
                  <div className="absolute bottom-2 left-2 text-white font-medium text-sm">
                    {material.name}
                  </div>

                  {/* Selection Indicator */}
                  <div className="absolute bottom-2 right-2">
                    {selectedMaterial?.id === material.id ? (
                      <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 border-2 border-white rounded-full" />
                    )}
                  </div>
                </button>
              </motion.div>
            ))}
          </div>
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
                  <span className="text-gray-600">Selected Material:</span>
                  <span className="font-medium">{selectedMaterial?.name || 'None'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Material Price:</span>
                  <span className="font-medium">${selectedMaterial?.price_per_sqft || 0}/sq ft</span>
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
            disabled={!selectedMaterial}
            className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-colors ${
              selectedMaterial
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