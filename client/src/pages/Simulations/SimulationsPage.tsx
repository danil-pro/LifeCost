import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { Input } from '../../components/UI/Input';
import { Select } from '../../components/UI/Select';
import { Spinner } from '../../components/UI/Spinner';
import { simulationsApi } from '../../api/simulations.api';
import type { SimulationResult, CoffeeCutResult, StupidSpendingItem } from '../../api/simulations.api';
import { categoriesApi } from '../../api/categories.api';
import { useCurrencyStore } from '../../store/currencyStore';
import { useLocaleStore } from '../../store/localeStore';
import type { Category } from '../../types/models';
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

const CenteredSpinner = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
`;

const SimulatorForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.base};
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: ${({ theme }) => theme.spacing.base};
  align-items: flex-end;

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`;

const SliderWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const SliderHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const SliderLabel = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text};
  font-weight: ${({ theme }) => theme.typography.fontWeights.medium};
`;

const SliderValue = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSizes.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeights.bold};
  color: ${({ theme }) => theme.colors.primary};
`;

const Slider = styled.input.attrs({ type: 'range' })`
  width: 100%;
  height: 6px;
  appearance: none;
  background-color: ${({ theme }) => theme.colors.surfaceLight};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  outline: none;

  &::-webkit-slider-thumb {
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background-color: ${({ theme }) => theme.colors.primary};
    cursor: pointer;
    border: 3px solid ${({ theme }) => theme.colors.surface};
    box-shadow: 0 2px 6px rgba(108, 92, 231, 0.3);
  }

  &::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background-color: ${({ theme }) => theme.colors.primary};
    cursor: pointer;
    border: 3px solid ${({ theme }) => theme.colors.surface};
  }
`;

const ResultsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: ${({ theme }) => theme.spacing.base};
`;

const ResultCard = styled.div<{ $highlight?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.lg};
  background-color: ${({ theme, $highlight }) =>
    $highlight ? 'rgba(0, 184, 148, 0.1)' : theme.colors.surfaceLight};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  gap: ${({ theme }) => theme.spacing.xs};
  border: 1px solid ${({ $highlight }) =>
    $highlight ? 'rgba(0, 184, 148, 0.3)' : 'transparent'};
`;

const ResultLabel = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: ${({ theme }) => theme.typography.fontWeights.medium};
`;

const ResultValue = styled.span<{ $highlight?: boolean }>`
  font-size: ${({ theme }) => theme.typography.fontSizes.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeights.bold};
  color: ${({ theme, $highlight }) =>
    $highlight ? theme.colors.success : theme.colors.text};
`;

const StupidItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.base} 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  &:last-child {
    border-bottom: none;
  }
`;

const StupidInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const StupidDescription = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSizes.md};
  font-weight: ${({ theme }) => theme.typography.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.text};
`;

const StupidCategory = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const StupidStats = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.base};
`;

const StupidAmount = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSizes.md};
  font-weight: ${({ theme }) => theme.typography.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.danger};
`;

const StupidFrequency = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const EmptyState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 120px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.typography.fontSizes.md};
`;

const SimulationsContent: React.FC = () => {
  const { t } = useTranslation('premium');
  const { t: tc } = useTranslation('common');
  const { formatAmount } = useCurrencyStore();
  const locale = useLocaleStore((s) => s.locale);

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [newAmount, setNewAmount] = useState('');

  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [coffeePercent, setCoffeePercent] = useState(50);
  const [coffeeResult, setCoffeeResult] = useState<CoffeeCutResult | null>(null);
  const [stupidSpending, setStupidSpending] = useState<StupidSpendingItem[]>([]);

  const [loadingSimulation, setLoadingSimulation] = useState(false);
  const [loadingCoffee, setLoadingCoffee] = useState(false);
  const [loadingStupid, setLoadingStupid] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoriesApi.list();
        const data = (res.data as ApiResponse<Category[]>).data;
        setCategories(Array.isArray(data) ? data : []);
      } catch {
        setCategories([]);
      }
    };
    void fetchCategories();
  }, []);

  const fetchStupidSpending = useCallback(async () => {
    setLoadingStupid(true);
    try {
      const res = await simulationsApi.stupidSpending();
      const data = (res.data as ApiResponse<StupidSpendingItem[]>).data;
      setStupidSpending(Array.isArray(data) ? data : []);
    } catch {
      setStupidSpending([]);
    } finally {
      setLoadingStupid(false);
    }
  }, []);

  useEffect(() => {
    void fetchStupidSpending();
  }, [fetchStupidSpending]);

  const handleRunSimulation = async () => {
    if (!selectedCategory || !newAmount) return;

    setLoadingSimulation(true);
    try {
      const res = await simulationsApi.run([{
        categoryId: selectedCategory,
        newAmount: parseFloat(newAmount),
      }]);
      const data = (res.data as ApiResponse<SimulationResult>).data;
      setSimulationResult(data);
    } catch {
      setSimulationResult(null);
    } finally {
      setLoadingSimulation(false);
    }
  };

  const handleCoffeeCut = async () => {
    setLoadingCoffee(true);
    try {
      const res = await simulationsApi.coffeeCut(coffeePercent);
      const data = (res.data as ApiResponse<CoffeeCutResult>).data;
      setCoffeeResult(data);
    } catch {
      setCoffeeResult(null);
    } finally {
      setLoadingCoffee(false);
    }
  };

  const categoryOptions = [
    { value: '', label: t('selectCategory') },
    ...categories.map((cat) => ({
      value: cat.id,
      label: locale === 'ru' && cat.nameRu ? cat.nameRu : cat.name,
    })),
  ];

  return (
    <PageWrapper>
      <Title>{tc('simulations')}</Title>

      {/* What-if Simulator */}
      <Card header={<SectionTitle>{t('simulator')}</SectionTitle>}>
        <SimulatorForm>
          <FormRow>
            <Select
              label={t('selectCategory')}
              options={categoryOptions}
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            />
            <Input
              label={t('newAmount')}
              type="number"
              min="0"
              step="0.01"
              value={newAmount}
              onChange={(e) => setNewAmount(e.target.value)}
              placeholder="0.00"
            />
            <Button
              variant="primary"
              loading={loadingSimulation}
              disabled={!selectedCategory || !newAmount}
              onClick={() => void handleRunSimulation()}
            >
              {t('runSimulation')}
            </Button>
          </FormRow>

          {simulationResult && (
            <ResultsGrid>
              <ResultCard>
                <ResultLabel>{t('currentSpending')}</ResultLabel>
                <ResultValue>{formatAmount(simulationResult.currentTotal)}</ResultValue>
              </ResultCard>
              <ResultCard>
                <ResultLabel>{t('projectedSpending')}</ResultLabel>
                <ResultValue>{formatAmount(simulationResult.projectedTotal)}</ResultValue>
              </ResultCard>
              <ResultCard $highlight>
                <ResultLabel>{t('monthlySavings')}</ResultLabel>
                <ResultValue $highlight>{formatAmount(simulationResult.monthlySavings)}</ResultValue>
              </ResultCard>
            </ResultsGrid>
          )}
        </SimulatorForm>
      </Card>

      {/* Coffee Cut Slider */}
      <Card header={<SectionTitle>{t('coffeeCut')}</SectionTitle>}>
        <SliderWrapper>
          <SliderHeader>
            <SliderLabel>{t('coffeeCut')}</SliderLabel>
            <SliderValue>{coffeePercent}%</SliderValue>
          </SliderHeader>
          <Slider
            min="0"
            max="100"
            step="5"
            value={coffeePercent}
            onChange={(e) => setCoffeePercent(Number(e.target.value))}
          />
          <Button
            variant="primary"
            size="sm"
            loading={loadingCoffee}
            onClick={() => void handleCoffeeCut()}
            style={{ alignSelf: 'flex-start' }}
          >
            {t('runSimulation')}
          </Button>
        </SliderWrapper>

        {coffeeResult && (
          <ResultsGrid style={{ marginTop: 16 }}>
            <ResultCard>
              <ResultLabel>{t('currentSpending')}</ResultLabel>
              <ResultValue>{formatAmount(coffeeResult.currentSpending)}</ResultValue>
            </ResultCard>
            <ResultCard>
              <ResultLabel>{t('projectedSpending')}</ResultLabel>
              <ResultValue>{formatAmount(coffeeResult.projectedSpending)}</ResultValue>
            </ResultCard>
            <ResultCard $highlight>
              <ResultLabel>{t('monthlySavings')}</ResultLabel>
              <ResultValue $highlight>{formatAmount(coffeeResult.monthlySavings)}</ResultValue>
            </ResultCard>
          </ResultsGrid>
        )}
      </Card>

      {/* Stupid Spending Detector */}
      <Card header={<SectionTitle>{t('stupidTitle')}</SectionTitle>}>
        {loadingStupid ? (
          <CenteredSpinner>
            <Spinner size="md" />
          </CenteredSpinner>
        ) : stupidSpending.length === 0 ? (
          <EmptyState>{t('noStupid')}</EmptyState>
        ) : (
          stupidSpending.map((item, index) => (
            <StupidItem key={`${item.description}-${index}`}>
              <StupidInfo>
                <StupidDescription>{item.description}</StupidDescription>
                <StupidCategory>{item.categoryName}</StupidCategory>
              </StupidInfo>
              <StupidStats>
                <StupidAmount>{formatAmount(item.totalSpent)}</StupidAmount>
                <StupidFrequency>
                  {item.frequency} {t('count')}
                </StupidFrequency>
              </StupidStats>
            </StupidItem>
          ))
        )}
      </Card>
    </PageWrapper>
  );
};

const SimulationsPage: React.FC = () => {
  return <SimulationsContent />;
};

export default SimulationsPage;
