import React from 'react';
import styled, { css, keyframes } from 'styled-components';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
}

const spin = keyframes`
  to {
    transform: rotate(360deg);
  }
`;

const sizeStyles = {
  sm: css`
    padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.md}`};
    font-size: ${({ theme }) => theme.typography.fontSizes.sm};
    border-radius: ${({ theme }) => theme.borderRadius.sm};
  `,
  md: css`
    padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.xl}`};
    font-size: ${({ theme }) => theme.typography.fontSizes.md};
    border-radius: ${({ theme }) => theme.borderRadius.md};
  `,
  lg: css`
    padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.xxl}`};
    font-size: ${({ theme }) => theme.typography.fontSizes.lg};
    border-radius: ${({ theme }) => theme.borderRadius.md};
  `,
};

const variantStyles = {
  primary: css`
    background-color: ${({ theme }) => theme.colors.primary};
    color: #ffffff;
    &:hover:not(:disabled) {
      background-color: ${({ theme }) => theme.colors.primaryDark};
    }
  `,
  secondary: css`
    background-color: ${({ theme }) => theme.colors.surfaceLight};
    color: ${({ theme }) => theme.colors.text};
    border: 1px solid ${({ theme }) => theme.colors.border};
    &:hover:not(:disabled) {
      background-color: ${({ theme }) => theme.colors.border};
    }
  `,
  danger: css`
    background-color: ${({ theme }) => theme.colors.danger};
    color: #ffffff;
    &:hover:not(:disabled) {
      background-color: #d63031;
    }
  `,
  ghost: css`
    background-color: transparent;
    color: ${({ theme }) => theme.colors.textSecondary};
    &:hover:not(:disabled) {
      background-color: ${({ theme }) => theme.colors.surfaceLight};
      color: ${({ theme }) => theme.colors.text};
    }
  `,
};

const StyledButton = styled.button<{ $variant: ButtonVariant; $size: ButtonSize; $fullWidth: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeights.medium};
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  line-height: 1;

  ${({ $size }) => sizeStyles[$size]}
  ${({ $variant }) => variantStyles[$variant]}
  ${({ $fullWidth }) =>
    $fullWidth &&
    css`
      width: 100%;
    `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Spinner = styled.span`
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: ${spin} 0.6s linear infinite;
`;

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  disabled,
  children,
  ...props
}) => {
  return (
    <StyledButton
      $variant={variant}
      $size={size}
      $fullWidth={fullWidth}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Spinner />}
      {children}
    </StyledButton>
  );
};
