'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Star } from 'lucide-react';
import { useProjectStore } from '@/store/useProjectStore';
import { useState, useEffect } from 'react';
import { dataPreloader } from '@/services/dataPreloader';

export default function HomePage() {
  const { setSelectedRoom, nextStep, setPreloadedData } = useProjectStore();
  const [backgroundImage, setBackgroundImage] = useState('');

  // Array of background images
  const backgroundImages = [
    '/assets/images/19.jpg',
    '/assets/images/20.jpg',
    '/assets/images/ic2rl_7.jpg',
  ];

  // Set random background image and start background preloading on component mount
  useEffect(() => {
    const randomImage = backgroundImages[Math.floor(Math.random() * backgroundImages.length)];
    setBackgroundImage(randomImage);
    
    // Set up callback to store data when ready
    dataPreloader.setOnDataReadyCallback((data) => {
      setPreloadedData(data);
      console.log('✅ Background preload completed and stored');
    });
    
    // Start preloading data in background immediately
    const startBackgroundPreload = async () => {
      try {
        await dataPreloader.preloadAllData();
      } catch (error) {
        console.error('❌ Background preload failed:', error);
        // Silent failure - app will use individual API calls as fallback
      }
    };
    
    startBackgroundPreload();
  }, [setPreloadedData]);

  const handleGetStarted = () => {
    // Data is already being preloaded in background
    // Just proceed to next step immediately
    setSelectedRoom('kitchen'); // Default to kitchen
    nextStep();
  };

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Background Image with Blur Effect */}
      <div className="absolute inset-0 overflow-hidden bg-gray-900">
        {/* Ultra Blurred Base Layer - Covers all white areas */}
        <div 
          className="absolute -inset-20 bg-cover bg-center bg-no-repeat filter blur-5xl transform scale-200"
          style={{
            backgroundImage: backgroundImage ? `url('${backgroundImage}')` : 'none',
          }}
        />
        
        {/* Super Heavy Blur for Complete Coverage */}
        <div 
          className="absolute -inset-16 bg-cover bg-center bg-no-repeat filter blur-4xl opacity-90 transform scale-180"
          style={{
            backgroundImage: backgroundImage ? `url('${backgroundImage}')` : 'none',
          }}
        />
        
        {/* Heavy Blurred Layer */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat filter blur-2xl opacity-80 transform scale-140"
          style={{
            backgroundImage: backgroundImage ? `url('${backgroundImage}')` : 'none',
          }}
        />
        
        {/* Medium Blurred Layer */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat filter blur-xl opacity-70 transform scale-130"
          style={{
            backgroundImage: backgroundImage ? `url('${backgroundImage}')` : 'none',
          }}
        />
        
        {/* Light Blurred Layer */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat filter blur-lg opacity-60 transform scale-120"
          style={{
            backgroundImage: backgroundImage ? `url('${backgroundImage}')` : 'none',
          }}
        />
        
        {/* Main Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transform scale-110"
          style={{
            backgroundImage: backgroundImage ? `url('${backgroundImage}')` : 'none',
          }}
        />
        
        {/* Main Dark Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col justify-center items-center text-center px-4">
        {/* Brand Name */}
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-6xl md:text-8xl font-bold text-white mb-8"
        >
          Geffter
        </motion.h1>

        {/* Main Info Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-white bg-opacity-90 backdrop-blur-sm rounded-2xl p-8 mb-8 max-w-md w-full"
        >
          <div className="text-gray-500 text-sm mb-2">Kitchen - Stone</div>
          <div className="text-3xl font-bold text-gray-800 mb-4">Quartz</div>
          <button className="bg-gray-700 hover:bg-gray-800 text-white px-6 py-3 rounded-xl font-medium transition-colors">
            Custom
          </button>
        </motion.div>

        {/* Call to Action Text */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-white text-lg md:text-xl mb-8 max-w-2xl"
        >
          Customize and buy your countertops 100% online, your way.
        </motion.div>

        {/* Get Started Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          onClick={handleGetStarted}
          className="bg-white hover:bg-gray-100 text-gray-800 px-8 py-4 rounded-xl font-semibold text-lg transition-colors flex items-center gap-2 shadow-lg"
        >
          Get Started
          <ArrowRight className="w-5 h-5" />
        </motion.button>

        {/* Rating */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex items-center gap-1 mt-8 text-white"
        >
          <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
          <span className="text-sm">5.0/5 Reviews</span>
        </motion.div>
      </div>

      {/* Decorative Line */}
      <div className="relative z-10 flex justify-center mb-8">
        <div className="w-px h-16 bg-white bg-opacity-50"></div>
      </div>
    </div>
  );
} 