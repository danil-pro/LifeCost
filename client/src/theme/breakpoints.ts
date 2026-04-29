export const breakpoints = {
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
};

type BreakpointKey = keyof typeof breakpoints;

const px = (key: BreakpointKey): string => `${breakpoints[key]}px`;

export const media = {
  up: (key: BreakpointKey): string => `@media (min-width: ${px(key)})`,
  down: (key: BreakpointKey): string => `@media (max-width: ${px(key)})`,
  only: (key: BreakpointKey): string =>
    `@media (min-width: ${px(key)}) and (max-width: ${breakpoints[key] + 0.98}px)`,
  between: (min: BreakpointKey, max: BreakpointKey): string =>
    `@media (min-width: ${px(min)}) and (max-width: ${breakpoints[max] + 0.98}px)`,
};
