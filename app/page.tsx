'use client';

import { useEffect } from 'react';
import { useProjectStore } from '@/store/useProjectStore';
import HomePage from '@/components/HomePage';
import RoomSelection from '@/components/RoomSelection';
import LayoutSelection from '@/components/LayoutSelection';
import MeasurementsPage from '@/components/MeasurementsPage';
import SpecificationPage from '@/components/SpecificationPage';
import MaterialSelection from '@/components/MaterialSelection';
import EdgeSelection from '@/components/EdgeSelection';
import LeadInfoPage from '@/components/LeadInfoPage';
import LeadAddressPage from '@/components/LeadAddressPage';
import ProjectSummary from '@/components/ProjectSummary';

export default function Home() {
  // Selective subscriptions to prevent unnecessary re-renders
  const currentStep = useProjectStore(state => state.currentStep);
  const selectedRoom = useProjectStore(state => state.selectedRoom);
  const selectedShapes = useProjectStore(state => state.selectedShapes);
  const nextStep = useProjectStore(state => state.nextStep);
  const previousStep = useProjectStore(state => state.previousStep);

  // Auto-advance to room selection if no room is selected
  useEffect(() => {
    if (currentStep === 1 && !selectedRoom) {
      // Stay on homepage
    }
  }, [currentStep, selectedRoom]);

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <HomePage />;
      case 2:
        return <RoomSelection />;
      case 3:
        return <LayoutSelection />;
      case 4:
        return <MeasurementsPage />;
      case 5:
        return <SpecificationPage />;
      case 6:
        return <MaterialSelection />;
      case 7:
        return <EdgeSelection />;
      case 8:
        return <LeadInfoPage />;
      case 9:
        return <LeadAddressPage />;
      case 10:
        return <ProjectSummary />;
      default:
        return <HomePage />;
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {renderCurrentStep()}
      </div>
    </main>
  );
} 