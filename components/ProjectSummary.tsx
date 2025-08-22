'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, Check, Download, Share2, Printer } from 'lucide-react';
import { useProjectStore } from '@/store/useProjectStore';

export default function ProjectSummary() {
  const { 
    selectedRoom, 
    selectedShapes, 
    selectedMaterial, 
    selectedEdgeStyle, 
    calculateTotalPrice,
    resetProject,
    setCurrentStep 
  } = useProjectStore();

  const totalPrice = calculateTotalPrice();

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
      room: selectedRoom,
      shapes: selectedShapes,
      material: selectedMaterial,
      edgeStyle: selectedEdgeStyle,
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
              onClick={() => setCurrentStep(7)}
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
                <span className="text-gray-700 capitalize">{selectedRoom}</span>
              </div>
            </div>

            {/* Selected Shapes */}
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Selected Shapes</h4>
              <div className="space-y-2">
                {selectedShapes.map((shape, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">{shape.layout.name}</span>
                      <span className="text-sm text-gray-500">
                        {Object.keys(shape.measurements).length} measurements
                      </span>
                    </div>
                    {shape.hasBacksplash && (
                      <div className="text-sm text-blue-600 mt-1">
                        ✓ Backsplash included ({shape.backsplashHeight}" height)
                      </div>
                    )}
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