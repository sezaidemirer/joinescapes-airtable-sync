import { useState } from 'react'

export const useLoading = (initialState = false) => {
  const [loading, setLoading] = useState(initialState)
  const [loadingText, setLoadingText] = useState('')
  const [progress, setProgress] = useState(0)

  const startLoading = (text = 'Yükleniyor...') => {
    setLoading(true)
    setLoadingText(text)
    setProgress(0)
  }

  const stopLoading = () => {
    setLoading(false)
    setLoadingText('')
    setProgress(0)
  }

  const updateProgress = (value) => {
    setProgress(Math.min(Math.max(value, 0), 100))
  }

  const updateText = (text) => {
    setLoadingText(text)
  }

  // Async işlemler için wrapper
  const withLoading = async (asyncFn, text = 'Yükleniyor...') => {
    try {
      startLoading(text)
      const result = await asyncFn()
      return result
    } catch (error) {
      console.error('Loading error:', error)
      throw error
    } finally {
      stopLoading()
    }
  }

  return {
    loading,
    loadingText,
    progress,
    startLoading,
    stopLoading,
    updateProgress,
    updateText,
    withLoading
  }
}

export default useLoading 