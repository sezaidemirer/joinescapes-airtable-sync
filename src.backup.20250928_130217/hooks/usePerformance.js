import { useEffect, useState } from 'react'

export const usePerformance = () => {
  const [metrics, setMetrics] = useState({
    fcp: null, // First Contentful Paint
    lcp: null, // Largest Contentful Paint
    fid: null, // First Input Delay
    cls: null, // Cumulative Layout Shift
    ttfb: null // Time to First Byte
  })

  useEffect(() => {
    // Performance Observer for Web Vitals
    if ('PerformanceObserver' in window) {
      // First Contentful Paint
      const fcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const fcp = entries.find(entry => entry.name === 'first-contentful-paint')
        if (fcp) {
          setMetrics(prev => ({ ...prev, fcp: Math.round(fcp.startTime) }))
        }
      })
      fcpObserver.observe({ entryTypes: ['paint'] })

      // Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]
        setMetrics(prev => ({ ...prev, lcp: Math.round(lastEntry.startTime) }))
      })
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })

      // First Input Delay
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach(entry => {
          setMetrics(prev => ({ ...prev, fid: Math.round(entry.processingStart - entry.startTime) }))
        })
      })
      fidObserver.observe({ entryTypes: ['first-input'] })

      // Cumulative Layout Shift
      let clsValue = 0
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value
            setMetrics(prev => ({ ...prev, cls: Math.round(clsValue * 1000) / 1000 }))
          }
        }
      })
      clsObserver.observe({ entryTypes: ['layout-shift'] })

      // Navigation timing for TTFB
      const navigationEntries = performance.getEntriesByType('navigation')
      if (navigationEntries.length > 0) {
        const navEntry = navigationEntries[0]
        const ttfb = navEntry.responseStart - navEntry.requestStart
        setMetrics(prev => ({ ...prev, ttfb: Math.round(ttfb) }))
      }

      return () => {
        fcpObserver.disconnect()
        lcpObserver.disconnect()
        fidObserver.disconnect()
        clsObserver.disconnect()
      }
    }
  }, [])

  // Log performance metrics to console (dev only)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && Object.values(metrics).some(v => v !== null)) {
    }
  }, [metrics])

  return metrics
}

// Utility function to get memory usage
export const getMemoryUsage = () => {
  if ('memory' in performance) {
    return {
      used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
      total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
      limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
    }
  }
  return null
}

// Utility function to measure component render time
export const measureRenderTime = (componentName) => {
  const startTime = performance.now()
  
  return () => {
    const endTime = performance.now()
    const renderTime = endTime - startTime
    
    if (process.env.NODE_ENV === 'development') {
    }
    
    return renderTime
  }
} 