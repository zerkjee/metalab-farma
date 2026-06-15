import { describe, it, expect } from 'vitest'
import { nextIndex, prevIndex } from '@/lib/carousel'

describe('carousel index math', () => {
  it('advances forward and wraps past the last slide', () => {
    expect(nextIndex(0, 4)).toBe(1)
    expect(nextIndex(2, 4)).toBe(3)
    expect(nextIndex(3, 4)).toBe(0)
  })

  it('goes back and wraps before the first slide', () => {
    expect(prevIndex(3, 4)).toBe(2)
    expect(prevIndex(1, 4)).toBe(0)
    expect(prevIndex(0, 4)).toBe(3)
  })

  it('is a no-op safe with a single slide', () => {
    expect(nextIndex(0, 1)).toBe(0)
    expect(prevIndex(0, 1)).toBe(0)
  })

  it('never throws or returns NaN with an empty list', () => {
    expect(nextIndex(0, 0)).toBe(0)
    expect(prevIndex(0, 0)).toBe(0)
  })
})
