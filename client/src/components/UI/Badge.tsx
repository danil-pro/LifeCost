import React from 'react';
import styled, { css } from 'styled-components';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'premium';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantStyles = {
  success: css`
    background-color: rgba(0, 184, 148, 0.15);
    color: ${({ theme }) => theme.colors.success};
  `,
  warning: css`
    background-color: rgba(253, 203, 110, 0.15);
    color: ${({ theme }) => theme.colors.warning};
  `,
  danger: css`
    background-color: rgba(225, 112, 85, 0.15);
    color: ${({ theme }) => theme.colors.danger};
  `,
  info: css`
    background-color: rgba(0, 206, 201, 0.15);
    color: ${({ theme }) => theme.colors.secondary};
  `,
  premium: css`
    background-color: rgba(108, 92, 231, 0.15);
    color: ${({ theme }) => theme.colors.primaryLight};
  `,
};

const StyledBadge = styled.span<{ $variant: BadgeVariant }>`
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  font-size: ${({ theme }) => theme.typography.fontSizes.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeights.semibold};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  line-height: 1.5;

  ${({ $variant }) => variantStyles[$variant]}
`;

export const Badge: React.FC<BadgeProps> = ({
  variant = 'info',
  children,
  className,
}) => {
  return (
    <StyledBadge $variant={variant} className={className}>
      {children}
    </StyledBadge>
  );
};
