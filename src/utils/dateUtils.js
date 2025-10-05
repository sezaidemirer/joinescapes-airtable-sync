// Türkiye saati için utility fonksiyonları

// Türkiye saati (UTC+3) ile şu anki zamanı al
export const getTurkeyTime = () => {
  const now = new Date()
  const turkeyTime = new Date(now.getTime() + (3 * 60 * 60 * 1000)) // UTC+3
  return turkeyTime
}

// Türkiye saati ile ISO string oluştur
export const getTurkeyTimeISO = () => {
  return getTurkeyTime().toISOString()
}

// Türkiye saati ile tarih formatı
export const getTurkeyTimeFormatted = (options = {}) => {
  const defaultOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'Europe/Istanbul'
  }
  
  return getTurkeyTime().toLocaleString('tr-TR', { ...defaultOptions, ...options })
}

// Türkiye saati ile sadece tarih
export const getTurkeyDateFormatted = () => {
  return getTurkeyTime().toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'Europe/Istanbul'
  })
}

// Türkiye saati ile sadece saat
export const getTurkeyTimeOnlyFormatted = () => {
  return getTurkeyTime().toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'Europe/Istanbul'
  })
}

// Verilen tarihi Türkiye saatine çevir
export const convertToTurkeyTime = (dateString) => {
  const date = new Date(dateString)
  const turkeyTime = new Date(date.getTime() + (3 * 60 * 60 * 1000))
  return turkeyTime
}

// Verilen tarihi Türkiye formatında göster
export const formatTurkeyDate = (dateString, options = {}) => {
  const turkeyTime = convertToTurkeyTime(dateString)
  const defaultOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Istanbul'
  }
  
  return turkeyTime.toLocaleString('tr-TR', { ...defaultOptions, ...options })
}

// Log için Türkiye saati
export const getTurkeyTimeForLog = () => {
  const now = getTurkeyTime()
  return now.toLocaleString('tr-TR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'Europe/Istanbul'
  })
}

// Console log için Türkiye saati prefix'i
export const logWithTurkeyTime = (message, ...args) => {
  const timePrefix = `[${getTurkeyTimeForLog()}]`
  console.log(timePrefix, message, ...args)
}
