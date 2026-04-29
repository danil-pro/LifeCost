import React from 'react';
import styled from 'styled-components';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface BarChartProps {
  data: Array<Record<string, string | number>>;
  xKey: string;
  yKey: string;
  color?: string;
  height?: number;
}

const ChartWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
`;

const TooltipContent = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.typography.fontSizes.sm};
`;

const TooltipLabel = styled.p`
  color: ${({ theme }) => theme.colors.text};
  font-weight: ${({ theme }) => theme.typography.fontWeights.medium};
  margin-bottom: 2px;
`;

const TooltipValue = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const CustomTooltip: React.FC<{
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}> = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <TooltipContent>
      <TooltipLabel>{label}</TooltipLabel>
      <TooltipValue>{payload[0].value.toFixed(2)}</TooltipValue>
    </TooltipContent>
  );
};

export const BarChart: React.FC<BarChartProps> = ({
  data,
  xKey,
  yKey,
  color = '#6C5CE7',
  height = 300,
}) => {
  return (
    <ChartWrapper>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333355" />
          <XAxis
            dataKey={xKey}
            stroke="#8888AA"
            fontSize={12}
            tickLine={false}
          />
          <YAxis
            stroke="#8888AA"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey={yKey} fill={color} radius={[4, 4, 0, 0]} />
        </RechartsBarChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
};
