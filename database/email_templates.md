# JoinEscapes Email Templates

## Supabase Dashboard'da Email Template Ayarları

### 1. Supabase Dashboard'a Git
- Authentication → Settings → Email Templates

### 2. Confirm Signup Template

**Subject:** 🎉 JoinEscapes'e Hoş Geldiniz! Email Adresinizi Doğrulayın

**Body (HTML):**
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>JoinEscapes'e Hoş Geldiniz!</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 30px;">
        <img src="https://your-domain.com/images/join_escape_logo_siyah.webp" alt="JoinEscapes" style="height: 60px;">
        <h1 style="color: #2563eb; margin: 20px 0 10px 0;">JoinEscapes'e Hoş Geldiniz! 🎉</h1>
        <p style="color: #666; font-size: 16px;">Seyahat tutkunları topluluğuna katıldığınız için teşekkürler!</p>
    </div>

    <!-- Main Content -->
    <div style="background: #f8fafc; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
        <h2 style="color: #1e40af; margin-bottom: 20px;">Email Adresinizi Doğrulayın</h2>
        <p style="margin-bottom: 20px;">
            Hesabınızı aktifleştirmek için aşağıdaki butona tıklayarak email adresinizi doğrulayın:
        </p>
        
        <!-- Confirm Button -->
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{ .ConfirmationURL }}" 
               style="background: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                ✅ Email Adresimi Doğrula
            </a>
        </div>
        
        <p style="font-size: 14px; color: #666; margin-top: 20px;">
            Eğer buton çalışmıyorsa, aşağıdaki linki kopyalayıp tarayıcınıza yapıştırın:<br>
            <a href="{{ .ConfirmationURL }}" style="color: #2563eb; word-break: break-all;">{{ .ConfirmationURL }}</a>
        </p>
    </div>

    <!-- Welcome Message -->
    <div style="background: #ecfdf5; padding: 25px; border-radius: 10px; border-left: 4px solid #10b981; margin-bottom: 30px;">
        <h3 style="color: #065f46; margin-bottom: 15px;">🌟 JoinEscapes'te Neler Yapabilirsiniz?</h3>
        <ul style="color: #047857; margin: 0; padding-left: 20px;">
            <li>✈️ Kişiselleştirilmiş seyahat önerileri alın</li>
            <li>❤️ Beğendiğiniz yazıları favorilerinize ekleyin</li>
            <li>📚 Kendi seyahat listelerinizi oluşturun</li>
            <li>🔔 Yeni içeriklerden ilk siz haberdar olun</li>
            <li>💬 Seyahat deneyimlerinizi paylaşın</li>
        </ul>
    </div>

    <!-- Footer -->
    <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #666; font-size: 14px;">
        <p>Bu email'i almak istemiyorsanız, <a href="{{ .UnsubscribeURL }}" style="color: #2563eb;">buradan</a> abonelikten çıkabilirsiniz.</p>
        <p style="margin-top: 15px;">
            <strong>JoinEscapes</strong><br>
            Seyahat tutkunları için özel platform<br>
            <a href="https://joinescapes.com" style="color: #2563eb;">joinescapes.com</a>
        </p>
    </div>

</body>
</html>
```

### 3. Ayarlar

**Authentication → Settings:**
- ✅ **Enable email confirmations:** ON
- ✅ **Enable email change confirmations:** ON  
- ✅ **Secure email change:** ON

### 4. Site URL Ayarları

**Authentication → URL Configuration:**
- ✅ **Site URL:** `http://localhost:5173` (development)
- ✅ **Redirect URLs:** 
  - `http://localhost:5173/kullanici-girisi?verified=true`
  - `http://localhost:5173/adminlogin?verified=true`

### 5. Test Etmek İçin

1. Kayıt formunu doldur
2. "Hesap Oluştur" butonuna tıkla
3. Email'ini kontrol et
4. Doğrulama linkine tıkla
5. Giriş yap

### 6. Production Ayarları

Production'da Site URL'yi gerçek domain ile değiştir:
- `https://yourdomain.com`
- `https://yourdomain.com/kullanici-girisi?verified=true`
