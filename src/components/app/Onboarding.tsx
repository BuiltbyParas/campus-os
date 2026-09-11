import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

import { cn } from '@/lib/utils'

const steps = [
  {
    title: 'This is your day',
    description: 'CampusOS shows what matters right now — your next class, attendance alerts, and deadlines — all in one place.'
  },
  {
    title: 'We watch for problems',
    description: 'Attendance dropping? Deadline approaching? CampusOS notices before you do and tells you what to do about it.'
  },
  {
    title: 'Ask anything',
    description: 'Can I skip DBMS? When is my next class? Ask CampusOS and get answers grounded in your actual records.'
  }
]

export function Onboarding() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    const done = localStorage.getItem('campusos.onboarding.done')
    if (!done) {
      setIsOpen(true)
    }
  }, [])

  const handleComplete = () => {
    localStorage.setItem('campusos.onboarding.done', 'true')
    setIsOpen(false)
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(s => s + 1)
    } else {
      handleComplete()
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 glass-modal"
          />
          
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="relative w-full max-w-sm rounded-card border border-line bg-surface p-6 shadow-xl"
          >
            <div className="flex gap-1.5 mb-6">
              {steps.map((_, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "h-1.5 flex-1 rounded-full transition-colors",
                    i === currentStep ? "bg-brand" : "bg-surface-muted"
                  )}
                />
              ))}
            </div>
            
            <div className="min-h-[120px]">
              <h2 className="text-[20px] font-semibold tracking-tight text-ink">
                {steps[currentStep].title}
              </h2>
              <p className="mt-3 text-[14px] leading-relaxed text-ink-muted">
                {steps[currentStep].description}
              </p>
            </div>
            
            <div className="mt-8 flex items-center justify-between">
              <button 
                onClick={handleComplete}
                className="px-2 py-2 text-[14px] font-medium text-ink-subtle hover:text-ink"
              >
                Skip
              </button>
              
              <button 
                onClick={handleNext}
                className="press rounded-control bg-brand px-5 py-2 text-[14px] font-medium text-on-brand hover:bg-brand-hover"
              >
                {currentStep === steps.length - 1 ? 'Get started' : 'Next'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
