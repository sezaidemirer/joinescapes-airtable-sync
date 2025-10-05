# Gmail SMTP Kurulumu - Adım Adım

## 1. Gmail'de App Password Oluştur

### Adım 1: 2-Step Verification'ı Etkinleştir
1. Google hesabınıza giriş yapın
2. **Google Account** > **Security**
3. **2-Step Verification** > **Get Started**
4. Telefon numaranızı doğrulayın

### Adım 2: App Password Oluştur
1. **Security** sayfasında **App passwords** bölümünü bulun
2. **App passwords** > **Select app** > **Mail**
3. **Generate** butonuna tıklayın
4. **16 haneli password'ü kopyalayın** (örnek: abcd efgh ijkl mnop)

## 2. Supabase'de SMTP Ayarları

### Adım 1: Authentication Settings
1. Supabase Dashboard > **Authentication** > **Settings**
2. **SMTP Settings** bölümünü bulun
3. **Enable custom SMTP** seçeneğini işaretleyin

### Adım 2: Gmail SMTP Bilgileri
```
SMTP Host: smtp.gmail.com
SMTP Port: 587
SMTP User: your-email@gmail.com (Gmail adresiniz)
SMTP Pass: [App Password] (16 haneli password)
SMTP Admin Email: your-email@gmail.com
SMTP Sender Name: JoinEscapes
```

### Adım 3: Test
1. **Send test email** butonuna tıklayın
2. Email'iniz gelirse başarılı!

## 3. Alternatif: SendGrid (Ücretsiz)

Eğer Gmail çalışmazsa SendGrid kullanın:

### SendGrid Kurulumu
1. [SendGrid.com](https://sendgrid.com) > **Sign Up** (Ücretsiz)
2. **API Keys** > **Create API Key**
3. **Full Access** seçin
4. API Key'i kopyalayın

### Supabase'de SendGrid SMTP
```
SMTP Host: smtp.sendgrid.net
SMTP Port: 587
SMTP User: apikey
SMTP Pass: [SendGrid API Key]
SMTP Admin Email: your-email@domain.com
SMTP Sender Name: JoinEscapes
```

## 4. Email Template Güncellemesi

SMTP kurulumundan sonra:
1. **Authentication** > **Email Templates**
2. **Confirm signup** template'ini düzenleyin
3. **From Name:** JoinEscapes
4. **From Email:** noreply@yourdomain.com
