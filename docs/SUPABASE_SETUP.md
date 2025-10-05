# Supabase Kurulumu ve Kullanımı

## 📦 Kurulum Tamamlandı

Supabase-js başarıyla projenize kuruldu! Aşağıdaki dosyalar oluşturuldu:

- `src/lib/supabase.js` - Supabase client konfigürasyonu
- `src/hooks/useAuth.js` - Authentication hook'u
- `src/contexts/AuthContext.jsx` - Auth context
- `src/components/auth/LoginForm.jsx` - Örnek login formu

## 🔧 Konfigürasyon

### 1. Environment Variables Oluşturma

Proje kök dizininde `.env` dosyası oluşturun:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 2. Supabase Projesinden Bilgileri Alma

1. [Supabase Dashboard](https://supabase.com/dashboard)'a gidin
2. Projenizi seçin
3. **Settings > API** bölümüne gidin
4. `Project URL` ve `anon public` key'i kopyalayın
5. `.env` dosyasına yapıştırın

## 🚀 Kullanım

### AuthProvider'ı App.jsx'e ekleyin:

```jsx
import { AuthProvider } from './contexts/AuthContext'

function App() {
  return (
    <AuthProvider>
      {/* Diğer componentler */}
    </AuthProvider>
  )
}
```

### Herhangi bir componentte authentication kullanın:

```jsx
import { useAuthContext } from '../contexts/AuthContext'

function MyComponent() {
  const { user, signIn, signOut, loading, isAuthenticated } = useAuthContext()
  
  if (loading) return <div>Yükleniyor...</div>
  
  return (
    <div>
      {isAuthenticated ? (
        <div>
          <p>Hoş geldin {user.email}!</p>
          <button onClick={signOut}>Çıkış Yap</button>
        </div>
      ) : (
        <LoginForm />
      )}
    </div>
  )
}
```

### Database işlemleri:

```jsx
import { db } from '../lib/supabase'

// Veri çekme
const { data, error } = await db.select('posts')

// Veri ekleme
const { data, error } = await db.insert('posts', {
  title: 'Yeni Post',
  content: 'Post içeriği'
})

// Veri güncelleme
const { data, error } = await db.update('posts', 
  { title: 'Güncellenmiş Başlık' }, 
  { id: 1 }
)
```

## 📋 Özellikler

✅ **Authentication**
- E-posta/şifre ile giriş
- Kullanıcı kaydı
- Otomatik session yönetimi
- Auth durumu takibi

✅ **Database**
- CRUD işlemleri
- Real-time subscriptions
- RLS (Row Level Security)

✅ **Storage**
- Dosya yükleme
- Görsel optimizasyonu

## 🔒 Güvenlik

- Environment variables kullanılıyor
- RLS aktif olmalı
- API keys güvenli şekilde saklanıyor

## 📚 Daha Fazla Bilgi

- [Supabase Docs](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Authentication Guide](https://supabase.com/docs/guides/auth) 