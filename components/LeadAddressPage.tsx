'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Info, MapPin, Building2 } from 'lucide-react';
import { useProjectStore } from '@/store/useProjectStore';
import { zipCodeCache } from '@/lib/zipCodeCache';

export default function LeadAddressPage() {
  // Selective subscriptions to prevent unnecessary re-renders
  const leadInfo = useProjectStore(state => state.leadInfo);
  const updateLeadInfo = useProjectStore(state => state.updateLeadInfo);
  const nextStep = useProjectStore(state => state.nextStep);
  const previousStep = useProjectStore(state => state.previousStep);
  const calculateTotalPrice = useProjectStore(state => state.calculateTotalPrice);
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoadingZipCode, setIsLoadingZipCode] = useState(false);
  const [zipCodeMessage, setZipCodeMessage] = useState('');

  const handleInputChange = (field: string, value: string) => {
    updateLeadInfo({ [field]: value });
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const fetchZipCodeInfo = async (zipCode: string) => {
    // Only fetch if we have a valid 5-digit ZIP code
    if (!/^\d{5}$/.test(zipCode)) {
      return;
    }

    // Check cache first
    const cached = zipCodeCache.get(zipCode);
    if (cached) {
      updateLeadInfo({
        city: cached.city,
        state: cached.state,
      });
      setZipCodeMessage('✓ City and state auto-filled (cached)');
      
      // Clear the message after 3 seconds
      setTimeout(() => {
        setZipCodeMessage('');
      }, 3000);
      return;
    }

    setIsLoadingZipCode(true);
    setZipCodeMessage('');

    try {
      const apiKey = '6817SP18V6P5D5M81QHZ';
      const response = await fetch(
        `https://api.zip-codes.com/ZipCodesAPI.svc/1.0/QuickGetZipCodeDetails/${zipCode}?key=${apiKey}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch ZIP code information');
      }

      const data = await response.json();

      if (data.City && data.State) {
        // Auto-fill city and state
        updateLeadInfo({
          city: data.City,
          state: data.State,
        });
        
        // Cache the result for 1 day
        zipCodeCache.set(zipCode, data.City, data.State);
        
        setZipCodeMessage('✓ City and state auto-filled');
        
        // Clear the message after 3 seconds
        setTimeout(() => {
          setZipCodeMessage('');
        }, 3000);
      } else {
        setZipCodeMessage('ZIP code not found. Please enter city and state manually.');
      }
    } catch (error) {
      console.error('Error fetching ZIP code:', error);
      setZipCodeMessage('Unable to fetch ZIP code info. Please enter city and state manually.');
    } finally {
      setIsLoadingZipCode(false);
    }
  };

  const handleZipCodeChange = (value: string) => {
    // Only allow numbers and limit to 10 characters (for ZIP+4 format)
    const sanitizedValue = value.replace(/[^\d-]/g, '').slice(0, 10);
    handleInputChange('zipCode', sanitizedValue);

    // Auto-fetch when user enters 5 digits
    if (/^\d{5}$/.test(sanitizedValue)) {
      fetchZipCodeInfo(sanitizedValue);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!leadInfo?.streetAddress?.trim()) {
      newErrors.streetAddress = 'Street address is required';
    }
    
    if (!leadInfo?.zipCode?.trim()) {
      newErrors.zipCode = 'Zip code is required';
    } else if (!/^\d{5}(-\d{4})?$/.test(leadInfo.zipCode)) {
      newErrors.zipCode = 'Please enter a valid zip code';
    }
    
    if (!leadInfo?.city?.trim()) {
      newErrors.city = 'City is required';
    }
    
    if (!leadInfo?.state?.trim()) {
      newErrors.state = 'State is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (validateForm()) {
      nextStep();
    }
  };

  const isFormComplete = () => {
    return leadInfo?.streetAddress && leadInfo?.zipCode && leadInfo?.city && leadInfo?.state;
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
            <h1 className="text-xl font-semibold text-gray-800">Important information</h1>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Info className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 pb-32">
        {/* Step Indicator */}
        <div className="text-sm text-gray-500 mb-4">Step 9 of 10</div>

        {/* Progress Indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div className="flex items-center">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <span className="ml-2 text-sm font-medium text-green-600">Info</span>
            </div>
            <div className="flex-1 h-px bg-green-500"></div>
            <div className="flex items-center">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <span className="ml-2 text-sm font-medium text-green-600">Address</span>
            </div>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8 text-center">
          Last step to get quote
        </h2>

        {/* Form */}
        <div className="max-w-md mx-auto space-y-6">
          {/* Zip Code - First Field */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-2"
          >
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Info className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={leadInfo?.zipCode || ''}
                onChange={(e) => handleZipCodeChange(e.target.value)}
                className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 ${
                  errors.zipCode ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="zip code"
                maxLength={10}
                disabled={isLoadingZipCode}
              />
              {isLoadingZipCode && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                </div>
              )}
            </div>
            {errors.zipCode && (
              <p className="text-red-500 text-sm">{errors.zipCode}</p>
            )}
            {zipCodeMessage && (
              <p className={`text-sm ${zipCodeMessage.startsWith('✓') ? 'text-green-600' : 'text-orange-600'}`}>
                {zipCodeMessage}
              </p>
            )}
          </motion.div>

          {/* City - Read-only, auto-filled from ZIP */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-2"
          >
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Building2 className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={leadInfo?.city || ''}
                readOnly
                className={`block w-full pl-10 pr-3 py-3 border rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed ${
                  errors.city ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="City (auto-filled from ZIP)"
              />
            </div>
            {errors.city && (
              <p className="text-red-500 text-sm">{errors.city}</p>
            )}
          </motion.div>

          {/* State - Read-only, auto-filled from ZIP */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="space-y-2"
          >
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={leadInfo?.state || ''}
                readOnly
                className={`block w-full pl-10 pr-3 py-3 border rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed ${
                  errors.state ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="State (auto-filled from ZIP)"
              />
            </div>
            {errors.state && (
              <p className="text-red-500 text-sm">{errors.state}</p>
            )}
          </motion.div>

          {/* Street Address - Manual input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="space-y-2"
          >
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={leadInfo?.streetAddress || ''}
                onChange={(e) => handleInputChange('streetAddress', e.target.value)}
                className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 ${
                  errors.streetAddress ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Street address"
              />
            </div>
            {errors.streetAddress && (
              <p className="text-red-500 text-sm">{errors.streetAddress}</p>
            )}
          </motion.div>
        </div>
      </div>

      {/* Continue Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={handleContinue}
            disabled={!isFormComplete()}
            className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-colors ${
              isFormComplete()
                ? 'bg-gray-800 hover:bg-gray-900 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
} 