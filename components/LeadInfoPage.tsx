'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Info, User, Mail, Phone } from 'lucide-react';
import { useProjectStore } from '@/store/useProjectStore';

export default function LeadInfoPage() {
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
    
    if (!leadInfo?.fullName?.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    
    if (!leadInfo?.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(leadInfo.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!leadInfo?.confirmEmail?.trim()) {
      newErrors.confirmEmail = 'Please confirm your email';
    } else if (leadInfo.email !== leadInfo.confirmEmail) {
      newErrors.confirmEmail = 'Emails do not match';
    }
    
    if (!leadInfo?.phone?.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[\+]?[1-9][\d]{0,15}$/.test(leadInfo.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
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
    return leadInfo?.fullName && leadInfo?.email && leadInfo?.confirmEmail && leadInfo?.phone;
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
        <div className="text-sm text-gray-500 mb-4">Step 8 of 10</div>

        {/* Progress Indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div className="flex items-center">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <span className="ml-2 text-sm font-medium text-green-600">Info</span>
            </div>
            <div className="flex-1 h-px bg-gray-300"></div>
            <div className="flex items-center">
              <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <span className="ml-2 text-sm font-medium text-gray-500">Address</span>
            </div>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8 text-center">
          Last step to get quote
        </h2>

        {/* Form */}
        <div className="max-w-md mx-auto space-y-6">
          {/* Full Name */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-2"
          >
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={leadInfo?.fullName || ''}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 ${
                  errors.fullName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Full name *"
              />
            </div>
            {errors.fullName && (
              <p className="text-red-500 text-sm">{errors.fullName}</p>
            )}
          </motion.div>

          {/* Email */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-2"
          >
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                value={leadInfo?.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Email *"
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email}</p>
            )}
          </motion.div>

          {/* Confirm Email */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-2"
          >
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                value={leadInfo?.confirmEmail || ''}
                onChange={(e) => handleInputChange('confirmEmail', e.target.value)}
                className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 ${
                  errors.confirmEmail ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Confirm Email *"
              />
            </div>
            {errors.confirmEmail && (
              <p className="text-red-500 text-sm">{errors.confirmEmail}</p>
            )}
          </motion.div>

          {/* Phone */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="space-y-2"
          >
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="tel"
                value={leadInfo?.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Phone *"
              />
            </div>
            {errors.phone && (
              <p className="text-red-500 text-sm">{errors.phone}</p>
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
            Next step
          </button>
        </div>
      </div>
    </div>
  );
} 