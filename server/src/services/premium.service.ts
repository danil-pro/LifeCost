/**
 * Premium feature gating utilities.
 */

export function isPremium(userTier: string): boolean {
  return userTier === 'premium';
}

export function getFeatureList(): { free: string[]; premium: string[] } {
  return {
    free: [
      'Track income and expenses',
      'Category management',
      'Monthly cost-of-living breakdown',
      'Basic insights and spending alerts',
      'Goal tracking (create, view, update)',
    ],
    premium: [
      'What-if simulations (adjust spending scenarios)',
      'Coffee-cut savings calculator',
      'Stupid-spending detector',
      'Goal completion projections',
      'Advanced analytics',
    ],
  };
}
