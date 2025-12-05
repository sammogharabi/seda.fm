export type HapticStyle = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' | 'selection'

const vibrate = (pattern: number | number[]) => {
  if (typeof window === 'undefined' || !('navigator' in window)) return
  try { (navigator as any).vibrate?.(pattern) } catch { /* noop */ }
}

export const haptics = {
  impact(style: HapticStyle = 'light') {
    const map: Record<HapticStyle, number | number[]> = {
      light: 10,
      selection: 12,
      medium: [12, 20],
      heavy: [20, 30],
      success: [12, 8, 12],
      warning: [8, 8, 8, 8],
      error: [20, 10, 20],
    }
    vibrate(map[style] ?? 10)
  },
  click() { vibrate(8) },
}

