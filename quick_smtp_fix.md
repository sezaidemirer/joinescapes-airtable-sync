# Hızlı SMTP Çözümü - 5 Dakikada

## Gmail SMTP Kurulumu (En Hızlı)

### 1. Gmail App Password Oluştur (2 dakika)
1. Google hesabınıza girin
2. **Google Account** > **Security** > **2-Step Verification** (etkinleştirin)
3. **App passwords** > **Mail** > **Generate**
4. 16 haneli password'ü kopyalayın

### 2. Supabase'de SMTP Ayarla (2 dakika)
1. Supabase Dashboard > **Authentication** > **Settings**
2. **SMTP Settings** bölümünü bulun
3. **Enable custom SMTP** ✓
4. Şu bilgileri girin:

```
SMTP Host: smtp.gmail.com
SMTP Port: 587
SMTP User: your-email@gmail.com
SMTP Pass: [16 haneli app password]
SMTP Admin Email: your-email@gmail.com
SMTP Sender Name: JoinEscapes
```

### 3. Test Et (1 dakika)
1. **Send test email** butonuna tıklayın
2. Email gelirse başarılı!

## Alternatif: SendGrid (Daha Kolay)

### SendGrid Kurulumu
1. [SendGrid.com](https://sendgrid.com) > **Sign Up** (Ücretsiz)
2. **Settings** > **API Keys** > **Create API Key**
3. **Full Access** seçin
4. API Key'i kopyalayın

### Supabase'de SendGrid
```
SMTP Host: smtp.sendgrid.net
SMTP Port: 587
SMTP User: apikey
SMTP Pass: [SendGrid API Key]
SMTP Admin Email: your-email@domain.com
SMTP Sender Name: JoinEscapes
```

## Bu Çözümler Neden Çalışır?
- Supabase'in email limitlerini bypass eder
- Gmail/SendGrid'in kendi limitlerini kullanır
- Çok daha yüksek limitler
- Rate limit sorunu ortadan kalkar

## Sonuç
5 dakikada sorun çözülür ve email doğrulama çalışır!
