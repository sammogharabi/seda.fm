import React, { useEffect, useRef } from 'react'

// Lightweight motion shim to avoid external deps during prototyping.
// API subset compatible with common framer-motion usage patterns.

type MotionProps = React.HTMLAttributes<HTMLDivElement> & {
  initial?: React.CSSProperties
  animate?: React.CSSProperties
  exit?: React.CSSProperties
  transition?: { duration?: number; delay?: number }
}

function useAnimateStyles({ initial, animate, transition }: MotionProps) {
  const ref = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const dur = (transition?.duration ?? 0.25) + 's'
    const delay = (transition?.delay ?? 0) + 's'
    const prev = el.style.transition
    el.style.transition = `all ${dur} ease-out ${delay}`
    if (initial) Object.assign(el.style, initial)
    requestAnimationFrame(() => {
      if (animate) Object.assign(el.style, animate)
    })
    return () => {
      el.style.transition = prev
    }
  }, [])
  return ref
}

export const motion = {
  div: React.forwardRef<HTMLDivElement, MotionProps>(function MDiv(
    { initial, animate, exit: _exit, transition, style, ...rest },
    forwarded
  ) {
    const localRef = useAnimateStyles({ initial, animate, transition })
    return <div ref={(node) => { (localRef as any).current = node; if (typeof forwarded === 'function') forwarded(node); else if (forwarded) (forwarded as any).current = node }} style={style} {...rest} />
  }),
  li: React.forwardRef<HTMLLIElement, MotionProps>(function MLi(
    { initial, animate, exit: _exit, transition, style, ...rest },
    forwarded
  ) {
    const ref = useRef<HTMLLIElement | null>(null)
    useEffect(() => {
      const el = ref.current
      if (!el) return
      const dur = (transition?.duration ?? 0.25) + 's'
      const delay = (transition?.delay ?? 0) + 's'
      const prev = el.style.transition
      el.style.transition = `all ${dur} ease-out ${delay}`
      if (initial) Object.assign(el.style, initial)
      requestAnimationFrame(() => {
        if (animate) Object.assign(el.style, animate)
      })
      return () => {
        el.style.transition = prev
      }
    }, [])
    return <li ref={(node) => { ref.current = node; if (typeof forwarded === 'function') forwarded(node); else if (forwarded) (forwarded as any).current = node }} style={style} {...(rest as any)} />
  }),
}

export const AnimatePresence: React.FC<{ children: React.ReactNode }>
  = ({ children }) => <>{children}</>

