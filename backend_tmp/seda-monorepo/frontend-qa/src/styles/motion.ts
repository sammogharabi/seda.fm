export const motionTokens = {
  duration: 0.2, // 200ms default
  easing: [0.4, 0, 0.2, 1] as [number, number, number, number],
  nowPlaying: {
    duration: 0.4,
    easing: [0.23, 1, 0.32, 1] as [number, number, number, number],
  },
  rowEnter: {
    duration: 0.3,
    easing: 'easeOut' as const,
  },
  tap: {
    duration: 0.15,
    easing: 'easeOut' as const,
  },
  cardEnter: {
    duration: 0.3,
    easing: 'easeOut' as const,
  },
};
