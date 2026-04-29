import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { Card } from '../../components/UI/Card';
import { Spinner } from '../../components/UI/Spinner';
import { Badge } from '../../components/UI/Badge';
import { insightsApi } from '../../api/insights.api';
import { getCurrentMonth } from '../../utils/dates';
import { formatPercentage } from '../../utils/formatters';
import { useCurrencyStore } from '../../store/currencyStore';
import { useLocaleStore } from '../../store/localeStore';
import type { Insight, CostOfLiving, BreakdownItem } from '../../types/models';
import type { ApiResponse } from '../../types/api';

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xl};
`;

const Title = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSizes.xxl};
  font-weight: ${({ theme }) => theme.typography.fontWeights.bold};
  color: ${({ theme }) => theme.colors.text};
`;

const SectionTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSizes.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.base};
`;

const CostGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: ${({ theme }) => theme.spacing.base};
`;

const CostCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.lg};
  background-color: ${({ theme }) => theme.colors.surfaceLight};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  gap: ${({ theme }) => theme.spacing.xs};
`;

const CostLabel = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: ${({ theme }) => theme.typography.fontWeights.medium};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const CostValue = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSizes.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeights.bold};
  color: ${({ theme }) => theme.colors.text};
`;

const DisposableValue = styled(CostValue)`
  color: ${({ theme }) => theme.colors.success};
`;

const InsightCardWrapper = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.base};
  padding: ${({ theme }) => theme.spacing.base} 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  &:last-child {
    border-bottom: none;
  }
`;

const InsightIcon = styled.div<{ $type: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  min-width: 40px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background-color: ${({ $type }) => {
    switch ($type) {
      case 'warning': return 'rgba(253, 203, 110, 0.15)';
      case 'danger': return 'rgba(225, 112, 85, 0.15)';
      case 'success': return 'rgba(0, 184, 148, 0.15)';
      default: return 'rgba(108, 92, 231, 0.15)';
    }
  }};
  color: ${({ theme, $type }) => {
    switch ($type) {
      case 'warning': return theme.colors.warning;
      case 'danger': return theme.colors.danger;
      case 'success': return theme.colors.success;
      default: return theme.colors.primary;
    }
  }};
  font-size: 18px;
`;

const InsightContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  flex: 1;
`;

const InsightTitle = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSizes.md};
  font-weight: ${({ theme }) => theme.typography.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.text};
`;

const InsightDescription = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.5;
`;

const InsightAmount = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSizes.md};
  font-weight: ${({ theme }) => theme.typography.fontWeights.bold};
  color: ${({ theme }) => theme.colors.primary};
  white-space: nowrap;
`;

const BreakdownRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.base};
  padding: ${({ theme }) => theme.spacing.sm} 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  &:last-child {
    border-bottom: none;
  }
`;

const BreakdownName = styled.span`
  flex: 1;
  font-size: ${({ theme }) => theme.typography.fontSizes.md};
  color: ${({ theme }) => theme.colors.text};
`;

const BreakdownBar = styled.div`
  width: 120px;
  height: 6px;
  background-color: ${({ theme }) => theme.colors.surfaceLight};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  overflow: hidden;
`;

const BreakdownBarFill = styled.div<{ $percentage: number }>`
  height: 100%;
  width: ${({ $percentage }) => `${Math.min($percentage, 100)}%`};
  background-color: ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  transition: width 0.4s ease;
`;

const BreakdownAmount = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSizes.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.text};
  min-width: 80px;
  text-align: right;
`;

const BreakdownPercent = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
  min-width: 45px;
  text-align: right;
`;

const CenteredSpinner = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
`;

const EmptyState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.typography.fontSizes.md};
`;

function getInsightIcon(type: string): string {
  switch (type) {
    case 'warning': return '!';
    case 'danger': return '!!';
    case 'success': return '+';
    default: return 'i';
  }
}

/** Map server insight data to translated title/description */
function translateInsight(
  insight: Insight,
  t: (key: string) => string,
  formatAmount: (amount: number) => string,
  locale: string,
): { title: string; description: string } {
  const title = insight.title || '';
  const desc = insight.description || '';

  // Map known server patterns to i18n keys
  if (title === 'High category spending') {
    return {
      title: t('percentageOfIncome'),
      description: desc,
    };
  }
  if (title === 'Subscription spending') {
    return {
      title: t('subscriptionDrain'),
      description: desc,
    };
  }
  if (title === 'Small purchases') {
    return {
      title: t('smallPurchases'),
      description: desc.replace(/You spent \$[\d.]+ on small purchases/, t('smallPurchases')),
    };
  }
  if (title === 'Low disposable income') {
    return {
      title: t('lowDisposable'),
      description: desc,
    };
  }
  if (title === 'No expenses') {
    return {
      title: locale === 'ru' ? 'Нет расходов' : 'No expenses',
      description: locale === 'ru' ? 'Нет расходов за этот месяц' : 'No expenses recorded for this month',
    };
  }

  return { title, description: desc };
}

const InsightsPage: React.FC = () => {
  const { t } = useTranslation('insights');
  const { formatAmount } = useCurrencyStore();
  const locale = useLocaleStore((s) => s.locale);

  const [insights, setInsights] = useState<Insight[]>([]);
  const [costOfLiving, setCostOfLiving] = useState<CostOfLiving | null>(null);
  const [breakdown, setBreakdown] = useState<BreakdownItem[]>([]);
  const [loading, setLoading] = useState(true);

  const month = getCurrentMonth();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [insightsRes, costRes, breakdownRes] = await Promise.all([
        insightsApi.list(month),
        insightsApi.costOfLiving(month),
        insightsApi.breakdown(month),
      ]);

      const insightsData = (insightsRes.data as ApiResponse<Insight[]>).data;
      const costData = (costRes.data as ApiResponse<CostOfLiving>).data;
      const breakdownData = (breakdownRes.data as ApiResponse<BreakdownItem[]>).data;

      setInsights(Array.isArray(insightsData) ? insightsData : []);
      setCostOfLiving(costData ?? null);
      setBreakdown(Array.isArray(breakdownData) ? breakdownData : []);
    } catch {
      setInsights([]);
      setCostOfLiving(null);
      setBreakdown([]);
    } finally {
      setLoading(false);
    }
  }, [month]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <PageWrapper>
        <Title>{t('title')}</Title>
        <CenteredSpinner>
          <Spinner size="lg" />
        </CenteredSpinner>
      </PageWrapper>
    );
  }

  const hasData = insights.length > 0 || costOfLiving !== null || breakdown.length > 0;

  if (!hasData) {
    return (
      <PageWrapper>
        <Title>{t('title')}</Title>
        <Card>
          <EmptyState>{t('noInsights')}</EmptyState>
        </Card>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <Title>{t('title')}</Title>

      {costOfLiving && (
        <Card header={<SectionTitle>{t('costOfLiving')}</SectionTitle>}>
          <CostGrid>
            <CostCard>
              <CostLabel>{t('monthly')}</CostLabel>
              <CostValue>{formatAmount(costOfLiving.monthly)}</CostValue>
            </CostCard>
            <CostCard>
              <CostLabel>{t('daily')}</CostLabel>
              <CostValue>{formatAmount(costOfLiving.daily)}</CostValue>
            </CostCard>
            <CostCard>
              <CostLabel>{t('hourly')}</CostLabel>
              <CostValue>{formatAmount(costOfLiving.hourly)}</CostValue>
            </CostCard>
            <CostCard>
              <CostLabel>{t('disposable')}</CostLabel>
              <DisposableValue>
                {formatAmount(costOfLiving.disposableIncome)}
              </DisposableValue>
            </CostCard>
          </CostGrid>
        </Card>
      )}

      {insights.length > 0 && (
        <Card header={<SectionTitle>{t('title')}</SectionTitle>}>
          {insights.map((insight, index) => {
            const translated = translateInsight(insight, t, formatAmount, locale);
            return (
              <InsightCardWrapper key={`${insight.type}-${index}`}>
                <InsightIcon $type={insight.type}>
                  {getInsightIcon(insight.type)}
                </InsightIcon>
                <InsightContent>
                  <InsightTitle>{translated.title}</InsightTitle>
                  <InsightDescription>{translated.description}</InsightDescription>
                </InsightContent>
                {insight.amount != null && insight.amount > 0 && (
                  <InsightAmount>{formatAmount(insight.amount)}</InsightAmount>
                )}
                {insight.percentage != null && insight.percentage > 0 && (
                  <Badge variant={insight.type === 'danger' ? 'danger' : insight.type === 'warning' ? 'warning' : 'info'}>
                    {formatPercentage(insight.percentage)}
                  </Badge>
                )}
              </InsightCardWrapper>
            );
          })}
        </Card>
      )}

      {breakdown.length > 0 && (
        <Card header={<SectionTitle>{t('categoryBreakdown')}</SectionTitle>}>
          {breakdown.map((item) => (
            <BreakdownRow key={item.categoryId}>
              <BreakdownName>
                {locale === 'ru' && item.categoryNameRu ? item.categoryNameRu : item.categoryName}
              </BreakdownName>
              <BreakdownBar>
                <BreakdownBarFill $percentage={item.percentage} />
              </BreakdownBar>
              <BreakdownAmount>{formatAmount(item.total)}</BreakdownAmount>
              <BreakdownPercent>{formatPercentage(item.percentage)}</BreakdownPercent>
            </BreakdownRow>
          ))}
        </Card>
      )}
    </PageWrapper>
  );
};

export default InsightsPage;
