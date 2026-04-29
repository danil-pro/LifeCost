import React from 'react';
import styled from 'styled-components';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  width: 100%;
`;

const Label = styled.label`
  font-size: ${({ theme }) => theme.typography.fontSizes.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeights.medium};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const IconWrapper = styled.div`
  position: absolute;
  left: ${({ theme }) => theme.spacing.md};
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  pointer-events: none;
`;

const StyledInput = styled.input<{ $hasIcon: boolean; $hasError: boolean }>`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.base};
  padding-left: ${({ theme, $hasIcon }) => ($hasIcon ? '40px' : theme.spacing.base)};
  background-color: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme, $hasError }) => ($hasError ? theme.colors.danger : theme.colors.border)};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.fontSizes.md};
  transition: border-color 0.2s ease;

  &::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
  }

  &:focus {
    outline: none;
    border-color: ${({ theme, $hasError }) => ($hasError ? theme.colors.danger : theme.colors.primary)};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSizes.xs};
  color: ${({ theme }) => theme.colors.danger};
`;

export const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
  id,
  ...props
}) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <Wrapper>
      {label && <Label htmlFor={inputId}>{label}</Label>}
      <InputWrapper>
        {icon && <IconWrapper>{icon}</IconWrapper>}
        <StyledInput
          id={inputId}
          $hasIcon={!!icon}
          $hasError={!!error}
          {...props}
        />
      </InputWrapper>
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </Wrapper>
  );
};
