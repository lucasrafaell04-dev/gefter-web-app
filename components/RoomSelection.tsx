'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, Info, Check } from 'lucide-react';
import { useProjectStore } from '@/store/useProjectStore';
import { RoomType } from '@/types';

export default function RoomSelection() {
  const { selectedEnvironments, toggleEnvironment, nextStep, previousStep } = useProjectStore();

  const handleRoomToggle = (room: RoomType) => {
    toggleEnvironment(room);
  };

  const handleContinue = () => {
    if (selectedEnvironments.length > 0) {
      nextStep();
    }
  };

  const rooms = [
    {
      type: 'kitchen' as RoomType,
      name: 'Kitchen',
      image: '/assets/images/5a6e9_5.jpg',
      description: 'Perfect for cooking and entertaining',
    },
    {
      type: 'bathroom' as RoomType,
      name: 'Bathroom',
      image: '/assets/images/14.jpg',
      description: 'Elegant bathroom countertops',
    },
  ];

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
            <h1 className="text-xl font-semibold text-gray-800">Select room</h1>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Info className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Step Indicator */}
        <div className="text-sm text-gray-500 mb-4">Step 2 of 6</div>

        {/* Question */}
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8">
          What type of room best suits your needs?
        </h2>

        {/* Room Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {rooms.map((room) => (
            <motion.div
              key={room.type}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <button
                onClick={() => handleRoomToggle(room.type)}
                className={`w-full h-64 md:h-80 rounded-2xl overflow-hidden relative group transition-all duration-300 ${
                  selectedEnvironments.includes(room.type)
                    ? 'ring-4 ring-blue-500 shadow-lg'
                    : 'hover:shadow-md'
                }`}
              >
                {/* Background Image */}
                <div 
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage: `url('${room.image}')`,
                  }}
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-30 transition-all duration-300" />

                {/* Room Name */}
                <div className="absolute bottom-4 left-4 text-white font-semibold text-lg">
                  {room.name}
                </div>

                {/* Selection Indicator */}
                <div className="absolute bottom-4 right-4">
                  {selectedEnvironments.includes(room.type) ? (
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 border-2 border-white rounded-full" />
                  )}
                </div>
              </button>
            </motion.div>
          ))}
        </div>

        {/* Continue Button */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={handleContinue}
              disabled={selectedEnvironments.length === 0}
              className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-colors ${
                selectedEnvironments.length > 0
                  ? 'bg-gray-800 hover:bg-gray-900 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Customize
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 