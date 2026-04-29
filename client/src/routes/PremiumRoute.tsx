import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { PremiumGate } from '../components/Premium/PremiumGate';

export const PremiumRoute: React.FC = () => {
  const user = useAuthStore((state) => state.user);

  if (user?.tier !== 'premium') {
    return <PremiumGate />;
  }

  return <Outlet />;
};
