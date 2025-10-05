import supabase from '../lib/supabase'

// Generate unique session ID for anonymous users
export const generateSessionId = () => {
  const existing = localStorage.getItem('session-id')
  if (existing) return existing
  
  const sessionId = 'sess_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
  localStorage.setItem('session-id', sessionId)
  return sessionId
}

// Get browser fingerprint (basit bir implementasyon)
export const getBrowserFingerprint = () => {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  ctx.textBaseline = 'top'
  ctx.font = '14px Arial'
  ctx.fillText('Browser fingerprint', 2, 2)
  
  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset(),
    canvas.toDataURL()
  ].join('|')
  
  // Simple hash
  let hash = 0
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  
  return Math.abs(hash).toString(36)
}

// Get user's IP (client-side approximation)
export const getUserIP = async () => {
  try {
    const response = await fetch('https://api.ipify.org?format=json')
    const data = await response.json()
    return data.ip
  } catch (error) {
    console.warn('Could not get IP address:', error)
    return null
  }
}

// Cookie Consent Manager Class
export class CookieConsentManager {
  constructor() {
    this.sessionId = generateSessionId()
    this.localStorageKey = 'cookie-consent'
  }

  // Get consent from localStorage
  getLocalConsent() {
    try {
      const stored = localStorage.getItem(this.localStorageKey)
      return stored ? JSON.parse(stored) : null
    } catch (error) {
      console.error('Error reading local consent:', error)
      return null
    }
  }

  // Save consent to localStorage
  saveLocalConsent(consent) {
    try {
      localStorage.setItem(this.localStorageKey, JSON.stringify({
        ...consent,
        timestamp: new Date().toISOString(),
        sessionId: this.sessionId
      }))
      return true
    } catch (error) {
      console.error('Error saving local consent:', error)
      return false
    }
  }

  // Get consent from Supabase
  async getRemoteConsent() {
    try {
      const { data, error } = await supabase.rpc('get_user_cookie_consent', {
        user_session_id: this.sessionId
      })

      if (error) {
        console.warn('Error fetching remote consent:', error)
        return null
      }

      return data?.[0] || null
    } catch (error) {
      console.error('Error getting remote consent:', error)
      return null
    }
  }

  // Save consent to Supabase
  async saveRemoteConsent(consent, method = 'banner') {
    try {
      
      const userAgent = navigator.userAgent
      const ipAddress = await getUserIP()

      const { data, error } = await supabase.rpc('save_cookie_consent', {
        p_session_id: this.sessionId,
        p_necessary: consent.necessary,
        p_analytics: consent.analytics,
        p_marketing: consent.marketing,
        p_personalization: consent.personalization,
        p_consent_method: method,
        p_user_agent: userAgent,
        p_ip_address: ipAddress
      })

      if (error) {
        console.error('❌ Supabase save error:', error)
        return false
      }

      return data
    } catch (error) {
      console.error('💥 Supabase save exception:', error)
      return false
    }
  }

  // Get merged consent (local + remote)
  async getConsent() {
    // Always try local first for speed
    const localConsent = this.getLocalConsent()
    
    try {
      // Also try to get remote consent
      const remoteConsent = await this.getRemoteConsent()
      
      // If remote is newer or local doesn't exist, use remote
      if (remoteConsent && (!localConsent || 
          new Date(remoteConsent.consented_at) > new Date(localConsent.timestamp))) {
        
        // Update local storage with remote data
        this.saveLocalConsent({
          necessary: remoteConsent.necessary,
          analytics: remoteConsent.analytics,
          marketing: remoteConsent.marketing,
          personalization: remoteConsent.personalization,
          source: 'remote'
        })
        
        return {
          necessary: remoteConsent.necessary,
          analytics: remoteConsent.analytics,
          marketing: remoteConsent.marketing,
          personalization: remoteConsent.personalization,
          timestamp: remoteConsent.consented_at,
          expires_at: remoteConsent.expires_at,
          is_expired: remoteConsent.is_expired
        }
      }
    } catch (error) {
      console.warn('Remote consent fetch failed, using local:', error)
    }

    return localConsent
  }

  // Save consent (both local and remote)
  async saveConsent(consent, method = 'banner') {
    // Always save locally first (immediate)
    const localSaved = this.saveLocalConsent(consent)
    
    // Try to save remotely (async, non-blocking)
    try {
      await this.saveRemoteConsent(consent, method)
    } catch (error) {
      console.warn('Remote consent save failed:', error)
      // Local save is still valid
    }

    return localSaved
  }

  // Check if consent exists and is not expired
  async hasValidConsent() {
    const consent = await this.getConsent()
    
    if (!consent) return false
    
    // Check if expired (1 year)
    const consentDate = new Date(consent.timestamp)
    const oneYearAgo = new Date()
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
    
    return consentDate > oneYearAgo
  }

  // Clear all consent data
  clearConsent() {
    localStorage.removeItem(this.localStorageKey)
    localStorage.removeItem('session-id')
  }

  // Initialize analytics/marketing scripts based on consent
  async initializeScripts() {
    const consent = await this.getConsent()
    
    if (!consent) return

    // Google Analytics
    if (consent.analytics) {
      this.initializeGoogleAnalytics()
    }
    
    // Marketing scripts
    if (consent.marketing) {
      this.initializeFacebookPixel()
      this.initializeGoogleAds()
    }
    
    // Personalization scripts
    if (consent.personalization) {
      this.initializePersonalizationScripts()
    }
  }

  // Initialize Google Analytics
  initializeGoogleAnalytics() {
    // Analytics artık GTM üzerinden yönetiliyor
    // Çifte ölçüm önlemek için bu fonksiyon pasif
  }

  // Initialize Facebook Pixel
  initializeFacebookPixel() {
    if (typeof fbq !== 'undefined') return // Already loaded
    
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    
    fbq('init', 'YOUR_PIXEL_ID')
    fbq('track', 'PageView')
    
  }

  // Initialize Google Ads
  initializeGoogleAds() {
    // Google Ads conversion tracking
  }

  // Initialize personalization scripts
  initializePersonalizationScripts() {
    // Custom personalization logic
  }
}

// Create singleton instance
const cookieManager = new CookieConsentManager()

// Export functions for easy use
export const getCookieConsent = () => cookieManager.getConsent()
export const saveCookieConsent = (consent, method) => cookieManager.saveConsent(consent, method)
export const hasValidCookieConsent = () => cookieManager.hasValidConsent()
export const initializeCookieScripts = () => cookieManager.initializeScripts()
export const clearCookieConsent = () => cookieManager.clearConsent()

// Export the manager instance directly
export { cookieManager } 