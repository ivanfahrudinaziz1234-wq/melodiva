'use client'

import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useCallback, useEffect, useState } from 'react'
import { PIANO_M_KEYS } from '@/components/layout/logo'

const STORAGE_KEY = 'mld-intro-seen'

/** Inline guard so returning visitors (same session) never see a flash of the intro. */
const guardScript = `try{if(sessionStorage.getItem('${STORAGE_KEY}'))document.documentElement.dataset.introSeen='1'}catch(e){}`

/** First-visit-per-session intro: piano keys of the "M" press in sequence, then the screen splits open. */
export function LoadingScreen() {
  const reduce = useReducedMotion()
  const [phase, setPhase] = useState<'playing' | 'opening' | 'done'>('playing')

  const finish = useCallback(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, '1')
    } catch {}
    setPhase((p) => (p === 'done' ? p : 'opening'))
  }, [])

  useEffect(() => {
    if (document.documentElement.dataset.introSeen) {
      setPhase('done')
      return
    }
    const timer = window.setTimeout(finish, reduce ? 400 : 1500)
    return () => window.clearTimeout(timer)
  }, [finish, reduce])

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: guardScript }} />
      <AnimatePresence onExitComplete={() => setPhase('done')}>
        {phase === 'playing' && (
          <motion.div
            key="intro"
            role="presentation"
            onClick={finish}
            className="fixed inset-0 z-[100] in-data-[intro-seen]:hidden"
            exit={{ pointerEvents: 'none' }}
            transition={{ duration: 0.7 }}
          >
            <motion.div
              className="absolute inset-x-0 top-0 h-1/2 bg-[#0e0e10]"
              exit={{ y: reduce ? 0 : '-100%', opacity: reduce ? 0 : 1 }}
              transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
            />
            <motion.div
              className="absolute inset-x-0 bottom-0 h-1/2 bg-[#0e0e10]"
              exit={{ y: reduce ? 0 : '100%', opacity: reduce ? 0 : 1 }}
              transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
            />
            <motion.div
              className="absolute inset-0 flex flex-col items-center justify-center gap-6 text-[#f5f1ea]"
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.3 }}
            >
              <svg viewBox="0 0 44 44" className="h-24 w-auto" aria-hidden="true">
                {PIANO_M_KEYS.map((key, i) => (
                  <motion.rect
                    key={key.x}
                    x={key.x}
                    width={8}
                    height={key.h}
                    rx={1.5}
                    fill={key.dark ? '#8c2f39' : '#f5f1ea'}
                    initial={{ y: 0 }}
                    animate={reduce ? undefined : { y: [0, 4, 0] }}
                    transition={{ duration: 0.28, delay: 0.15 + i * 0.16, ease: 'easeInOut' }}
                  />
                ))}
              </svg>
              <motion.div
                className="flex flex-col items-center leading-none"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <span className="font-serif text-2xl font-semibold tracking-[0.3em]">MELODIVA</span>
                <span className="mt-2 text-xs tracking-[0.6em] text-[#d9b84a]">MUSIC</span>
              </motion.div>
              <button
                type="button"
                onClick={finish}
                className="absolute right-5 bottom-[calc(1.5rem+env(safe-area-inset-bottom))] min-h-11 rounded-full border border-white/20 px-5 text-sm text-white/80 hover:bg-white/10"
              >
                Lewati
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
