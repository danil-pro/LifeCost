import React from 'react';
import styled from 'styled-components';

interface CardProps {
  children: React.ReactNode;
  padding?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const StyledCard = styled.div<{ $padding?: string; $clickable: boolean }>`
  background-color: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme, $padding }) => $padding || theme.spacing.xl};
  overflow: hidden;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  ${({ $clickable }) =>
    $clickable &&
    `
    cursor: pointer;
    &:hover {
      border-color: #6C5CE7;
      box-shadow: 0 4px 12px rgba(108, 92, 231, 0.15);
    }
  `}
`;

const CardHeader = styled.div`
  padding-bottom: ${({ theme }) => theme.spacing.base};
  margin-bottom: ${({ theme }) => theme.spacing.base};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  font-size: ${({ theme }) => theme.typography.fontSizes.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeights.semibold};
`;

const CardFooter = styled.div`
  padding-top: ${({ theme }) => theme.spacing.base};
  margin-top: ${({ theme }) => theme.spacing.base};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

export const Card: React.FC<CardProps> = ({
  children,
  padding,
  header,
  footer,
  className,
  onClick,
}) => {
  return (
    <StyledCard
      $padding={padding}
      $clickable={!!onClick}
      className={className}
      onClick={onClick}
    >
      {header && <CardHeader>{header}</CardHeader>}
      {children}
      {footer && <CardFooter>{footer}</CardFooter>}
    </StyledCard>
  );
};
