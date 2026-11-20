/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, type ReactNode } from 'react'

import {
  createNShiftContainer,
  type NShiftContainer,
} from '@/di/nshift-container'

const container = createNShiftContainer()
const NShiftContext = createContext<NShiftContainer | null>(null)

export function NShiftProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    void container.parser.ready()
  }, [])

  return (
    <NShiftContext.Provider value={container}>
      {children}
    </NShiftContext.Provider>
  )
}

export function useNShift() {
  const value = useContext(NShiftContext)
  if (!value) {
    throw new Error('useNShift must be used inside NShiftProvider.')
  }
  return value
}
