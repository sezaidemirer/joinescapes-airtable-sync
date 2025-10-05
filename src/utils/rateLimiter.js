// 🔒 GÜVENLİK: Rate Limiting Sistemi
// API çağrılarını sınırlandırarak DDoS ve spam saldırılarını önler

class RateLimiter {
  constructor() {
    this.requests = new Map() // IP bazlı istek takibi
    this.windowMs = 15 * 60 * 1000 // 15 dakika
    this.maxRequests = 1000 // 15 dakikada maksimum 1000 istek (gevşetildi)
    this.blockDuration = 5 * 60 * 1000 // 5 dakika blok süresi (gevşetildi)
  }

  // IP adresini al (client-side için basit yaklaşım)
  getClientId() {
    // Browser fingerprint oluştur
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      navigator.hardwareConcurrency || 'unknown'
    ].join('|')
    
    return btoa(fingerprint).slice(0, 32)
  }

  // Rate limit kontrolü
  checkRateLimit(endpoint = 'default') {
    // Development ortamında rate limiting'i devre dışı bırak
    if (import.meta.env.DEV || import.meta.env.MODE === 'development') {
      return { allowed: true, remaining: 999 }
    }
    
    const clientId = this.getClientId()
    const key = `${clientId}:${endpoint}`
    const now = Date.now()
    
    // Mevcut kayıtları temizle (eski kayıtları sil)
    this.cleanup()
    
    if (!this.requests.has(key)) {
      this.requests.set(key, {
        count: 1,
        firstRequest: now,
        blocked: false,
        blockUntil: null
      })
      return { allowed: true, remaining: this.maxRequests - 1 }
    }
    
    const record = this.requests.get(key)
    
    // Eğer bloklanmışsa
    if (record.blocked && record.blockUntil > now) {
      const remainingTime = Math.ceil((record.blockUntil - now) / 1000)
      return { 
        allowed: false, 
        remaining: 0, 
        resetTime: remainingTime,
        message: `Çok fazla istek gönderdiniz. ${remainingTime} saniye sonra tekrar deneyin.`
      }
    }
    
    // Blok süresi dolmuşsa sıfırla
    if (record.blocked && record.blockUntil <= now) {
      record.blocked = false
      record.blockUntil = null
      record.count = 1
      record.firstRequest = now
      return { allowed: true, remaining: this.maxRequests - 1 }
    }
    
    // Zaman penceresi kontrolü
    if (now - record.firstRequest > this.windowMs) {
      // Yeni zaman penceresi başlat
      record.count = 1
      record.firstRequest = now
      return { allowed: true, remaining: this.maxRequests - 1 }
    }
    
    // İstek sayısını artır
    record.count++
    
    // Limit aşıldıysa blokla
    if (record.count > this.maxRequests) {
      record.blocked = true
      record.blockUntil = now + this.blockDuration
      
      console.warn(`🚨 Rate limit aşıldı: ${endpoint} - Client: ${clientId}`)
      
      return { 
        allowed: false, 
        remaining: 0, 
        resetTime: Math.ceil(this.blockDuration / 1000),
        message: `Çok fazla istek gönderdiniz. ${Math.ceil(this.blockDuration / 1000 / 60)} dakika sonra tekrar deneyin.`
      }
    }
    
    return { 
      allowed: true, 
      remaining: this.maxRequests - record.count 
    }
  }

  // Eski kayıtları temizle
  cleanup() {
    const now = Date.now()
    const cutoff = now - this.windowMs
    
    for (const [key, record] of this.requests.entries()) {
      if (!record.blocked && record.firstRequest < cutoff) {
        this.requests.delete(key)
      }
    }
  }

  // Endpoint bazlı rate limit kontrolü
  checkEndpointLimit(endpoint, customLimit = null) {
    const limit = customLimit || this.maxRequests
    const originalLimit = this.maxRequests
    
    if (customLimit) {
      this.maxRequests = customLimit
    }
    
    const result = this.checkRateLimit(endpoint)
    
    // Orijinal limiti geri yükle
    this.maxRequests = originalLimit
    
    return result
  }

  // Kritik endpoint'ler için gevşetilmiş limit
  checkCriticalEndpoint(endpoint) {
    return this.checkEndpointLimit(endpoint, 100) // 15 dakikada 100 istek (gevşetildi)
  }

  // Auth endpoint'leri için gevşetilmiş limit
  checkAuthEndpoint(endpoint) {
    return this.checkEndpointLimit(endpoint, 50) // 15 dakikada 50 istek (gevşetildi)
  }
}

// Global rate limiter instance
const rateLimiter = new RateLimiter()

export default rateLimiter 