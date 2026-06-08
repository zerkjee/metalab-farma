// Pure slide-index helpers for the hero carousel.
// Kept framework-agnostic so the wraparound logic is unit-testable without a DOM.

export function nextIndex(current: number, length: number): number {
  if (length <= 0) return 0
  return (current + 1) % length
}

export function prevIndex(current: number, length: number): number {
  if (length <= 0) return 0
  return (current - 1 + length) % length
}
