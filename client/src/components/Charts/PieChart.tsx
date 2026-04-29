import React from 'react';
import styled from 'styled-components';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface PieChartDataItem {
  name: string;
  value: number;
  color: string;
}

interface PieChartProps {
  data: PieChartDataItem[];
  width?: number;
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

const CustomTooltip: React.FC<{ active?: boolean; payload?: Array<{ name: string; value: number }> }> = ({
  active,
  payload,
}) => {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <TooltipContent>
      <TooltipLabel>{payload[0].name}</TooltipLabel>
      <TooltipValue>{payload[0].value.toFixed(2)}</TooltipValue>
    </TooltipContent>
  );
};

export const PieChart: React.FC<PieChartProps> = ({
  data,
  height = 300,
}) => {
  return (
    <ChartWrapper>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
            nameKey="name"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </RechartsPieChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
};
