import React, { useState } from 'react'
import { 
  Twitter, 
  Facebook, 
  Linkedin, 
  MessageCircle, 
  Link as LinkIcon, 
  Share2,
  Copy,
  Check
} from 'lucide-react'

const SocialShare = ({ 
  title, 
  url, 
  description, 
  image, 
  hashtags = ['JoinEscapes', 'Seyahat', 'Turizm'],
  className = '',
  variant = 'default' // 'default', 'compact', 'floating'
}) => {
  const [copied, setCopied] = useState(false)
  const [showShareMenu, setShowShareMenu] = useState(false)

  // Paylaşım URL'lerini oluştur
  const shareUrls = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}&hashtags=${hashtags.join(',')}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`
  }

  // Sosyal medya paylaşım fonksiyonları
  const shareToSocial = (platform) => {
    const shareUrl = shareUrls[platform]
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400,scrollbars=yes,resizable=yes')
    }
  }

  // Link kopyalama fonksiyonu
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Link kopyalanamadı:', err)
      // Fallback: eski yöntem
      const textArea = document.createElement('textarea')
      textArea.value = url
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // Native share API (mobil cihazlarda)
  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: description,
          url: url
        })
      } catch (err) {
        console.log('Native share iptal edildi veya hata oluştu')
        setShowShareMenu(true)
      }
    } else {
      setShowShareMenu(true)
    }
  }

  // Compact variant için
  if (variant === 'compact') {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <button
          onClick={() => shareToSocial('twitter')}
          className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          title="Twitter'da Paylaş"
        >
          <Twitter className="h-4 w-4" />
        </button>
        
        <button
          onClick={() => shareToSocial('facebook')}
          className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          title="Facebook'ta Paylaş"
        >
          <Facebook className="h-4 w-4" />
        </button>
        
        <button
          onClick={() => shareToSocial('whatsapp')}
          className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
          title="WhatsApp'ta Paylaş"
        >
          <MessageCircle className="h-4 w-4" />
        </button>
        
        <button
          onClick={copyToClipboard}
          className="p-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
          title="Linki Kopyala"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>
    )
  }

  // Floating variant için
  if (variant === 'floating') {
    return (
      <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
        <div className="relative space-y-3">
          {/* WhatsApp Business butonu */}
          <a
            href="https://wa.me/908503056356"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-full shadow-lg transition-colors block"
            title="WhatsApp Business ile Sohbet"
          >
            <MessageCircle className="h-5 w-5" />
          </a>
          
          
          {/* Sosyal medya menüsü */}
          {showShareMenu && (
            <div className="absolute bottom-14 right-0 bg-white rounded-lg shadow-lg border border-gray-200 p-2 min-w-[180px] z-50">
              <div className="space-y-1">
                <button
                  onClick={() => shareToSocial('twitter')}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-left hover:bg-gray-50 rounded-md transition-colors cursor-pointer"
                >
                  <Twitter className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Twitter</span>
                </button>
                
                <button
                  onClick={() => shareToSocial('facebook')}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-left hover:bg-gray-50 rounded-md transition-colors cursor-pointer"
                >
                  <Facebook className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">Facebook</span>
                </button>
                
                <button
                  onClick={() => shareToSocial('linkedin')}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-left hover:bg-gray-50 rounded-md transition-colors cursor-pointer"
                >
                  <Linkedin className="h-4 w-4 text-blue-700" />
                  <span className="text-sm">LinkedIn</span>
                </button>
                
                <button
                  onClick={() => shareToSocial('whatsapp')}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-left hover:bg-gray-50 rounded-md transition-colors cursor-pointer"
                >
                  <MessageCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">WhatsApp</span>
                </button>
                
                <hr className="my-1" />
                
                <button
                  onClick={copyToClipboard}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-left hover:bg-gray-50 rounded-md transition-colors cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-600">Kopyalandı!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">Linki Kopyala</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Overlay - menüyü kapatmak için */}
        {showShareMenu && (
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setShowShareMenu(false)}
          />
        )}
      </div>
    )
  }

  // Default variant - Minimal tasarım
  return (
    <div className={`bg-gray-50 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900">Bu Yazıyı Paylaş</h3>
        <button
          onClick={nativeShare}
          className="flex items-center space-x-1 px-2 py-1 bg-primary-600 text-white rounded text-xs hover:bg-primary-700 transition-colors"
        >
          <Share2 className="h-3 w-3" />
          <span>Paylaş</span>
        </button>
      </div>
      
      <div className="grid grid-cols-4 gap-2 mb-3">
        <button
          onClick={() => shareToSocial('twitter')}
          className="flex items-center justify-center space-x-1 p-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
        >
          <Twitter className="h-4 w-4" />
          <span className="text-xs">Twitter</span>
        </button>
        
        <button
          onClick={() => shareToSocial('facebook')}
          className="flex items-center justify-center space-x-1 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
        >
          <Facebook className="h-4 w-4" />
          <span className="text-xs">Facebook</span>
        </button>
        
        <button
          onClick={() => shareToSocial('linkedin')}
          className="flex items-center justify-center space-x-1 p-2 bg-blue-700 hover:bg-blue-800 text-white rounded transition-colors"
        >
          <Linkedin className="h-4 w-4" />
          <span className="text-xs">LinkedIn</span>
        </button>
        
        <button
          onClick={() => shareToSocial('whatsapp')}
          className="flex items-center justify-center space-x-1 p-2 bg-green-500 hover:bg-green-600 text-white rounded transition-colors"
        >
          <MessageCircle className="h-4 w-4" />
          <span className="text-xs">WhatsApp</span>
        </button>
      </div>
      
      <div className="bg-white rounded border border-gray-200 p-2">
        <div className="flex items-center space-x-2 mb-2">
          <LinkIcon className="h-3 w-3 text-gray-500" />
          <span className="text-xs text-gray-600">Linki kopyala:</span>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={url}
            readOnly
            className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs bg-gray-50"
          />
          <button
            onClick={copyToClipboard}
            className={`px-2 py-1 rounded text-xs transition-colors ${
              copied 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-500 hover:bg-gray-600 text-white'
            }`}
          >
            {copied ? (
              <div className="flex items-center space-x-1">
                <Check className="h-3 w-3" />
                <span>Kopyalandı!</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1">
                <Copy className="h-3 w-3" />
                <span>Kopyala</span>
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default SocialShare 