#!/usr/bin/env node

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function autoUpdateSitemap() {
  try {
    console.log('🔄 Sitemap otomatik güncelleniyor...');
    
    // Sitemap oluştur
    await execAsync('npm run generate:sitemap');
    
    console.log('✅ Sitemap başarıyla güncellendi!');
    console.log('📅 Tarih:', new Date().toLocaleString('tr-TR'));
    
  } catch (error) {
    console.error('❌ Sitemap güncelleme hatası:', error.message);
  }
}

// Script çalıştırıldığında otomatik çalış
autoUpdateSitemap(); 