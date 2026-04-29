/**
 * Insights module uses query parameters for filtering.
 * No dedicated Zod schemas required -- parameters are validated
 * inline in the controller layer.
 */

export interface Insight {
  type: 'warning' | 'info' | 'tip';
  title: string;
  description: string;
  percentage?: number;
  amount?: number;
}

export interface BreakdownItem {
  categoryId: string;
  categoryName: string;
  categoryNameRu: string | null;
  total: number;
  percentage: number;
}
