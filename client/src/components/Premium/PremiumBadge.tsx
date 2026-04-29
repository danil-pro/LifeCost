import React from 'react';
import styled from 'styled-components';

const StyledBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 1px 6px;
  font-size: ${({ theme }) => theme.typography.fontSizes.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeights.bold};
  color: ${({ theme }) => theme.colors.primaryLight};
  background: linear-gradient(135deg, rgba(108, 92, 231, 0.2), rgba(253, 121, 168, 0.2));
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  letter-spacing: 0.5px;
  text-transform: uppercase;
`;

export const PremiumBadge: React.FC = () => {
  return <StyledBadge>PRO</StyledBadge>;
};
