import React from 'react';
import styled from 'styled-components';
import { useCurrencyStore, getCurrencyName } from '../../store/currencyStore';
import { SUPPORTED_CURRENCIES, getCurrencySymbol } from '../../store/currencyStore';
import { useLocaleStore } from '../../store/localeStore';

const Wrapper = styled.div`
  position: relative;
`;

const StyledSelect = styled.select`
  appearance: none;
  background-color: ${({ theme }) => theme.colors.surfaceLight};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: ${({ theme }) => theme.colors.text};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.xl} ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.typography.fontSizes.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeights.medium};
  cursor: pointer;
  background-image: url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%238888AA' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 8px center;
  transition: border-color 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }

  option {
    background-color: ${({ theme }) => theme.colors.surface};
    color: ${({ theme }) => theme.colors.text};
  }
`;

export const CurrencySelector: React.FC = () => {
  const { currency, setCurrency } = useCurrencyStore();
  const { locale } = useLocaleStore();

  return (
    <Wrapper>
      <StyledSelect
        value={currency}
        onChange={(e) => setCurrency(e.target.value)}
      >
        {SUPPORTED_CURRENCIES.map((code) => (
          <option key={code} value={code}>
            {getCurrencySymbol(code)} {code} — {getCurrencyName(code, locale)}
          </option>
        ))}
      </StyledSelect>
    </Wrapper>
  );
};
