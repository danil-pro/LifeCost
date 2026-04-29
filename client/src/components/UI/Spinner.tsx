import React from 'react';
import styled, { keyframes } from 'styled-components';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const spin = keyframes`
  to {
    transform: rotate(360deg);
  }
`;

const sizeMap = {
  sm: '16px',
  md: '32px',
  lg: '48px',
};

const StyledSpinner = styled.div<{ $size: 'sm' | 'md' | 'lg' }>`
  width: ${({ $size }) => sizeMap[$size]};
  height: ${({ $size }) => sizeMap[$size]};
  border: 3px solid ${({ theme }) => theme.colors.border};
  border-top-color: ${({ theme }) => theme.colors.primary};
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`;

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className }) => {
  return <StyledSpinner $size={size} className={className} />;
};
