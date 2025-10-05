# Supabase Custom SMTP Kurulumu

## Gmail SMTP Kurulumu (Önerilen)

### 1. Gmail'de App Password Oluştur
1. Google hesabınıza giriş yapın
2. Google Account > Security > 2-Step Verification (etkinleştirin)
3. App passwords > Generate app password
4. "Mail" seçin ve password'ü kopyalayın

### 2. Supabase'de SMTP Ayarları
1. Supabase Dashboard > Authentication > Settings
2. SMTP Settings bölümüne gidin
3. Şu ayarları girin:

```
SMTP Host: smtp.gmail.com
SMTP Port: 587
SMTP User: your-email@gmail.com
SMTP Pass: [App Password]
SMTP Admin Email: your-email@gmail.com
SMTP Sender Name: JoinEscapes
```

### 3. Test Email Gönder
- Test email göndererek SMTP'nin çalıştığını kontrol edin

## Alternatif SMTP Sağlayıcıları

### SendGrid (Ücretsiz 100 email/gün)
```
SMTP Host: smtp.sendgrid.net
SMTP Port: 587
SMTP User: apikey
SMTP Pass: [SendGrid API Key]
```

### Mailgun (Ücretsiz 5000 email/ay)
```
SMTP Host: smtp.mailgun.org
SMTP Port: 587
SMTP User: [Mailgun SMTP User]
SMTP Pass: [Mailgun SMTP Pass]
```

## Email Template Güncellemesi

SMTP kurulumundan sonra email template'lerinizi güncelleyin:
- From Name: JoinEscapes
- From Email: noreply@joinescapes.com (veya domain'iniz)
