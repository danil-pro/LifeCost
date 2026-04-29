import { colors } from './colors';
import { typography } from './typography';
import { spacing, borderRadius } from './spacing';
import { breakpoints, media } from './breakpoints';

export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  breakpoints,
  media,
};

export type Theme = typeof theme;
