'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Info, MapPin, Building2 } from 'lucide-react';
import { useProjectStore } from '@/store/useProjectStore';

const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
  'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
  'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
  'Wisconsin', 'Wyoming'
];

const MAJOR_CITIES = [
  'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio',
  'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville', 'Fort Worth', 'Columbus',
  'Charlotte', 'San Francisco', 'Indianapolis', 'Seattle', 'Denver', 'Washington', 'Boston',
  'El Paso', 'Nashville', 'Detroit', 'Oklahoma City', 'Portland', 'Las Vegas', 'Memphis',
  'Louisville', 'Baltimore', 'Milwaukee', 'Albuquerque', 'Tucson', 'Fresno', 'Sacramento',
  'Mesa', 'Kansas City', 'Atlanta', 'Long Beach', 'Colorado Springs', 'Raleigh', 'Miami',
  'Virginia Beach', 'Omaha', 'Oakland', 'Minneapolis', 'Tulsa', 'Arlington', 'Tampa',
  'New Orleans', 'Wichita', 'Cleveland', 'Bakersfield', 'Aurora', 'Anaheim', 'Honolulu',
  'Santa Ana', 'Corpus Christi', 'Riverside', 'Lexington', 'Stockton', 'Henderson',
  'Saint Paul', 'St. Louis', 'Milwaukee', 'Cincinnati', 'Pittsburgh', 'Anchorage',
  'Greensboro', 'Plano', 'Newark', 'Durham', 'Lincoln', 'Orlando', 'Chula Vista',
  'Jersey City', 'Chandler', 'Madison', 'Lubbock', 'Scottsdale', 'Reno', 'Buffalo',
  'Gilbert', 'Glendale', 'North Las Vegas', 'Winston-Salem', 'Chesapeake', 'Norfolk',
  'Fremont', 'Garland', 'Irving', 'Hialeah', 'Richmond', 'Boise', 'Spokane', 'Baton Rouge'
];

export default function LeadAddressPage() {
  // Selective subscriptions to prevent unnecessary re-renders
  const leadInfo = useProjectStore(state => state.leadInfo);
  const updateLeadInfo = useProjectStore(state => state.updateLeadInfo);
  const nextStep = useProjectStore(state => state.nextStep);
  const previousStep = useProjectStore(state => state.previousStep);
  const calculateTotalPrice = useProjectStore(state => state.calculateTotalPrice);
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    updateLeadInfo({ [field]: value });
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
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
          {/* Street Address */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
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

          {/* Zip Code */}
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
                onChange={(e) => handleInputChange('zipCode', e.target.value)}
                className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 ${
                  errors.zipCode ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="90001"
                maxLength={10}
              />
            </div>
            {errors.zipCode && (
              <p className="text-red-500 text-sm">{errors.zipCode}</p>
            )}
          </motion.div>

          {/* City */}
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
              <select
                value={leadInfo?.city || ''}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 ${
                  errors.city ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select City</option>
                {MAJOR_CITIES.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
            {errors.city && (
              <p className="text-red-500 text-sm">{errors.city}</p>
            )}
          </motion.div>

          {/* State */}
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
              <select
                value={leadInfo?.state || ''}
                onChange={(e) => handleInputChange('state', e.target.value)}
                className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 ${
                  errors.state ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select State</option>
                {US_STATES.map((state) => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>
            {errors.state && (
              <p className="text-red-500 text-sm">{errors.state}</p>
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