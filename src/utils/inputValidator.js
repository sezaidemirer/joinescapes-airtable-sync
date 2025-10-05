// 🔒 GÜVENLİK: Input Validation Sistemi
// Kullanıcı girişlerini doğrular ve zararlı içerikleri filtreler

class InputValidator {
  constructor() {
    // Tehlikeli karakterler ve pattern'ler
    this.dangerousPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /vbscript:/gi,
      /onload\s*=/gi,
      /onerror\s*=/gi,
      /onclick\s*=/gi,
      /onmouseover\s*=/gi,
      /onfocus\s*=/gi,
      /onblur\s*=/gi,
      /onchange\s*=/gi,
      /onsubmit\s*=/gi,
      /<iframe\b[^>]*>/gi,
      /<object\b[^>]*>/gi,
      /<embed\b[^>]*>/gi,
      /<form\b[^>]*>/gi,
      /data:text\/html/gi,
      /data:application\/x-httpd-php/gi,
      /\beval\s*\(/gi,
      /\bsetTimeout\s*\(/gi,
      /\bsetInterval\s*\(/gi,
      /document\.write/gi,
      /document\.writeln/gi,
      /window\.location/gi,
      /document\.location/gi,
      /document\.cookie/gi,
      /localStorage\./gi,
      /sessionStorage\./gi
    ]

    // SQL Injection pattern'leri
    this.sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
      /[';\\|*%<>{}[\]()]/gi,
      /((\%3C)|<)((\%2F)|\/)*[a-z0-9\%]+((\%3E)|>)/gi,
      /((\%3C)|<)((\%69)|i|(\%49))((\%6D)|m|(\%4D))((\%67)|g|(\%47))[^\n]+((\%3E)|>)/gi
    ]

    // XSS pattern'leri
    this.xssPatterns = [
      /(<|%3C)script(.|\n)*?(>|%3E)/gi,
      /(<|%3C)\/script(.|\n)*?(>|%3E)/gi,
      /(javascript|vbscript|onload|onerror|onclick):/gi,
      /&#x?[0-9a-f]+;?/gi,
      /&[a-z]+;/gi
    ]
  }

  // Genel metin doğrulama
  validateText(text, options = {}) {
    const {
      maxLength = 1000,
      minLength = 0,
      allowHtml = false,
      allowSpecialChars = true,
      required = false
    } = options

    const errors = []

    // Boş kontrol
    if (required && (!text || text.trim().length === 0)) {
      errors.push('Bu alan gereklidir')
      return { isValid: false, errors, sanitized: '' }
    }

    if (!text) {
      return { isValid: true, errors: [], sanitized: '' }
    }

    // Uzunluk kontrolü
    if (text.length > maxLength) {
      errors.push(`Maksimum ${maxLength} karakter olmalıdır`)
    }

    if (text.length < minLength) {
      errors.push(`Minimum ${minLength} karakter olmalıdır`)
    }

    // Zararlı pattern kontrolleri
    let sanitizedText = text

    // XSS kontrolleri
    if (!allowHtml) {
      for (const pattern of this.xssPatterns) {
        if (pattern.test(text)) {
          errors.push('Güvenlik nedeniyle izin verilmeyen karakterler içeriyor')
          break
        }
      }
      
      for (const pattern of this.dangerousPatterns) {
        if (pattern.test(text)) {
          errors.push('Güvenlik nedeniyle izin verilmeyen içerik')
          break
        }
      }

      // HTML etiketlerini temizle
      sanitizedText = text.replace(/<[^>]*>/g, '')
    }

    // SQL Injection kontrolleri
    for (const pattern of this.sqlPatterns) {
      if (pattern.test(text)) {
        errors.push('Güvenlik nedeniyle izin verilmeyen SQL ifadeleri')
        break
      }
    }

    // Özel karakterler kontrolü
    if (!allowSpecialChars) {
      const specialChars = /[<>'"&]/g
      if (specialChars.test(text)) {
        errors.push('Özel karakterler (<, >, ", \', &) kullanılamaz')
        sanitizedText = text.replace(specialChars, '')
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitized: sanitizedText.trim()
    }
  }

  // Email doğrulama
  validateEmail(email) {
    const errors = []
    
    if (!email) {
      errors.push('E-posta adresi gereklidir')
      return { isValid: false, errors }
    }

    // Basit email regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      errors.push('Geçerli bir e-posta adresi giriniz')
    }

    // Uzunluk kontrolü
    if (email.length > 254) {
      errors.push('E-posta adresi çok uzun')
    }

    // Zararlı karakterler
    const result = this.validateText(email, { allowHtml: false, allowSpecialChars: false })
    if (!result.isValid) {
      errors.push(...result.errors)
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitized: email.toLowerCase().trim()
    }
  }

  // Şifre doğrulama
  validatePassword(password) {
    const errors = []
    
    if (!password) {
      errors.push('Şifre gereklidir')
      return { isValid: false, errors }
    }

    // Uzunluk kontrolü
    if (password.length < 6) {
      errors.push('Şifre en az 6 karakter olmalıdır')
    }

    if (password.length > 128) {
      errors.push('Şifre çok uzun')
    }

    // Güvenlik kontrolleri
    const result = this.validateText(password, { allowHtml: false, maxLength: 128 })
    if (!result.isValid) {
      errors.push(...result.errors)
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // URL doğrulama
  validateUrl(url) {
    const errors = []
    
    if (!url) {
      return { isValid: true, errors: [], sanitized: '' }
    }

    try {
      const urlObj = new URL(url)
      
      // Sadece HTTP ve HTTPS'e izin ver
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        errors.push('Sadece HTTP ve HTTPS URL\'leri kabul edilir')
      }

      // Zararlı protokoller
      if (['javascript:', 'vbscript:', 'data:'].includes(urlObj.protocol)) {
        errors.push('Güvenlik nedeniyle bu protokole izin verilmiyor')
      }

    } catch (e) {
      errors.push('Geçerli bir URL giriniz')
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitized: url.trim()
    }
  }

  // YouTube URL doğrulama
  validateYouTubeUrl(url) {
    const errors = []
    
    if (!url) {
      errors.push('YouTube URL gereklidir')
      return { isValid: false, errors }
    }

    // Genel URL doğrulama
    const urlResult = this.validateUrl(url)
    if (!urlResult.isValid) {
      return urlResult
    }

    // YouTube URL pattern'i
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/i
    if (!youtubeRegex.test(url)) {
      errors.push('Geçerli bir YouTube URL\'si giriniz')
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitized: url.trim()
    }
  }

  // Genel form doğrulama
  validateForm(formData, rules) {
    const errors = {}
    let isValid = true

    for (const [field, rule] of Object.entries(rules)) {
      const value = formData[field]
      let result

      switch (rule.type) {
        case 'text':
          result = this.validateText(value, rule.options || {})
          break
        case 'email':
          result = this.validateEmail(value)
          break
        case 'password':
          result = this.validatePassword(value)
          break
        case 'url':
          result = this.validateUrl(value)
          break
        case 'youtube':
          result = this.validateYouTubeUrl(value)
          break
        default:
          result = this.validateText(value, rule.options || {})
      }

      if (!result.isValid) {
        errors[field] = result.errors
        isValid = false
      }
    }

    return { isValid, errors }
  }
}

// Global validator instance
const inputValidator = new InputValidator()

export default inputValidator 