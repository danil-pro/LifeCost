import { css, styled } from 'styled-components';
import { useCurrencyStore } from '../../store/currencyStore';

type DisplaySize = 'sm' | 'md' | 'lg';

interface CurrencyDisplayProps {
  amount: number;
  currency?: string;
  size?: DisplaySize;
  className?: string;
}

const sizeStyles = {
  sm: css`
    font-size: ${({ theme }) => theme.typography.fontSizes.md};
  `,
  md: css`
    font-size: ${({ theme }) => theme.typography.fontSizes.xl};
  `,
  lg: css`
    font-size: ${({ theme }) => theme.typography.fontSizes.xxxl};
    font-weight: ${({ theme }) => theme.typography.fontWeights.bold};
  `,
};

const Amount = styled.span<{ $size: DisplaySize }>`
  display: inline-flex;
  align-items: baseline;
  color: ${({ theme }) => theme.colors.text};

  ${({ $size }) => sizeStyles[$size]}
`;

export const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({
  amount,
  size = 'md',
  className,
}) => {
  const formatAmount = useCurrencyStore((s) => s.formatAmount);
  const formatted = formatAmount(amount);

  return (
    <Amount $size={size} className={className}>
      {formatted}
    </Amount>
  );
};
