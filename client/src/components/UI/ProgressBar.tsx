import React from 'react';
import styled, { keyframes } from 'styled-components';

interface ProgressBarProps {
  percentage: number;
  showLabel?: boolean;
  height?: string;
  className?: string;
}

const grow = keyframes`
  from {
    width: 0%;
  }
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  width: 100%;
`;

const Track = styled.div<{ $height: string }>`
  width: 100%;
  height: ${({ $height }) => $height};
  background-color: ${({ theme }) => theme.colors.surfaceLight};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  overflow: hidden;
`;

const Fill = styled.div<{ $percentage: number; $color: string }>`
  height: 100%;
  width: ${({ $percentage }) => `${Math.min(Math.max($percentage, 0), 100)}%`};
  background-color: ${({ $color }) => $color};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  transition: width 0.5s ease;
  animation: ${grow} 0.5s ease;
`;

const Label = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: right;
`;

function getBarColor(percentage: number): string {
  if (percentage >= 75) return '#00B894';
  if (percentage >= 50) return '#FDCB6E';
  if (percentage >= 25) return '#E17055';
  return '#E17055';
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  percentage,
  showLabel = true,
  height = '8px',
  className,
}) => {
  const clampedPercentage = Math.min(Math.max(percentage, 0), 100);
  const color = getBarColor(clampedPercentage);

  return (
    <Wrapper className={className}>
      <Track $height={height}>
        <Fill $percentage={clampedPercentage} $color={color} />
      </Track>
      {showLabel && <Label>{clampedPercentage.toFixed(0)}%</Label>}
    </Wrapper>
  );
};
