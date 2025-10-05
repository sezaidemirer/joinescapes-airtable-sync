import { createApi } from 'unsplash-js'

// Unsplash API konfigürasyonu
const unsplash = createApi({
  accessKey: 'YOUR_UNSPLASH_ACCESS_KEY' // Buraya Unsplash API key'inizi ekleyin
})

// Destinasyon isimleri ve arama terimleri
const DESTINATION_MAPPING = {
  // Türkiye şehirleri
  'istanbul': ['istanbul turkey', 'istanbul city', 'istanbul skyline'],
  'ankara': ['ankara turkey', 'ankara city'],
  'izmir': ['izmir turkey', 'izmir city', 'izmir coast'],
  'antalya': ['antalya turkey', 'antalya beach', 'antalya coast'],
  'bursa': ['bursa turkey', 'bursa city'],
  'adana': ['adana turkey', 'adana city'],
  'mersin': ['mersin turkey', 'mersin coast'],
  'diyarbakır': ['diyarbakir turkey', 'diyarbakir city'],
  'gaziantep': ['gaziantep turkey', 'gaziantep city'],
  'konya': ['konya turkey', 'konya city'],
  'kayseri': ['kayseri turkey', 'kayseri city'],
  'eskişehir': ['eskisehir turkey', 'eskisehir city'],
  'muğla': ['mugla turkey', 'mugla coast'],
  'aydın': ['aydin turkey', 'aydin city'],
  'denizli': ['denizli turkey', 'denizli city'],
  'manisa': ['manisa turkey', 'manisa city'],
  'balıkesir': ['balikesir turkey', 'balikesir coast'],
  'çanakkale': ['canakkale turkey', 'canakkale city'],
  'edirne': ['edirne turkey', 'edirne city'],
  'tekirdağ': ['tekirdag turkey', 'tekirdag city'],
  'kırklareli': ['kirklareli turkey', 'kirklareli city'],
  'sakarya': ['sakarya turkey', 'sakarya city'],
  'kocaeli': ['kocaeli turkey', 'kocaeli city'],
  'yalova': ['yalova turkey', 'yalova city'],
  'bilecik': ['bilecik turkey', 'bilecik city'],
  'kütahya': ['kutahya turkey', 'kutahya city'],
  'afyonkarahisar': ['afyon turkey', 'afyon city'],
  'uşak': ['usak turkey', 'usak city'],
  'ısparta': ['isparta turkey', 'isparta city'],
  'burdur': ['burdur turkey', 'burdur city'],
  'antalya': ['antalya turkey', 'antalya beach'],
  'mersin': ['mersin turkey', 'mersin coast'],
  'hatay': ['hatay turkey', 'hatay city'],
  'osmaniye': ['osmaniye turkey', 'osmaniye city'],
  'kahramanmaraş': ['kahramanmaras turkey', 'kahramanmaras city'],
  'malatya': ['malatya turkey', 'malatya city'],
  'elazığ': ['elazig turkey', 'elazig city'],
  'bingöl': ['bingol turkey', 'bingol city'],
  'tunceli': ['tunceli turkey', 'tunceli city'],
  'erzincan': ['erzincan turkey', 'erzincan city'],
  'erzurum': ['erzurum turkey', 'erzurum city'],
  'kars': ['kars turkey', 'kars city'],
  'ağrı': ['agri turkey', 'agri city'],
  'ığdır': ['igdir turkey', 'igdir city'],
  'ardahan': ['ardahan turkey', 'ardahan city'],
  'artvin': ['artvin turkey', 'artvin city'],
  'rize': ['rize turkey', 'rize city'],
  'trabzon': ['trabzon turkey', 'trabzon city'],
  'giresun': ['giresun turkey', 'giresun city'],
  'ordu': ['ordu turkey', 'ordu city'],
  'samsun': ['samsun turkey', 'samsun city'],
  'amasya': ['amasya turkey', 'amasya city'],
  'tokat': ['tokat turkey', 'tokat city'],
  'sivas': ['sivas turkey', 'sivas city'],
  'çorum': ['corum turkey', 'corum city'],
  'yozgat': ['yozgat turkey', 'yozgat city'],
  'nevşehir': ['nevsehir turkey', 'nevsehir city'],
  'kırşehir': ['kirsehir turkey', 'kirsehir city'],
  'kırıkkale': ['kirikkale turkey', 'kirikkale city'],
  'çankırı': ['cankiri turkey', 'cankiri city'],
  'kastamonu': ['kastamonu turkey', 'kastamonu city'],
  'sinop': ['sinop turkey', 'sinop city'],
  'zonguldak': ['zonguldak turkey', 'zonguldak city'],
  'bartın': ['bartin turkey', 'bartin city'],
  'karabük': ['karabuk turkey', 'karabuk city'],
  'bolu': ['bolu turkey', 'bolu city'],
  'düzce': ['duzce turkey', 'duzce city'],
  'kocaeli': ['kocaeli turkey', 'kocaeli city'],
  'yalova': ['yalova turkey', 'yalova city'],
  'bursa': ['bursa turkey', 'bursa city'],
  'bilecik': ['bilecik turkey', 'bilecik city'],
  'kütahya': ['kutahya turkey', 'kutahya city'],
  'afyonkarahisar': ['afyon turkey', 'afyon city'],
  'uşak': ['usak turkey', 'usak city'],
  'ısparta': ['isparta turkey', 'isparta city'],
  'burdur': ['burdur turkey', 'burdur city'],
  'antalya': ['antalya turkey', 'antalya beach'],
  'mersin': ['mersin turkey', 'mersin coast'],
  'hatay': ['hatay turkey', 'hatay city'],
  'osmaniye': ['osmaniye turkey', 'osmaniye city'],
  'kahramanmaraş': ['kahramanmaras turkey', 'kahramanmaras city'],
  'malatya': ['malatya turkey', 'malatya city'],
  'elazığ': ['elazig turkey', 'elazig city'],
  'bingöl': ['bingol turkey', 'bingol city'],
  'tunceli': ['tunceli turkey', 'tunceli city'],
  'erzincan': ['erzincan turkey', 'erzincan city'],
  'erzurum': ['erzurum turkey', 'erzurum city'],
  'kars': ['kars turkey', 'kars city'],
  'ağrı': ['agri turkey', 'agri city'],
  'ığdır': ['igdir turkey', 'igdir city'],
  'ardahan': ['ardahan turkey', 'ardahan city'],
  'artvin': ['artvin turkey', 'artvin city'],
  'rize': ['rize turkey', 'rize city'],
  'trabzon': ['trabzon turkey', 'trabzon city'],
  'giresun': ['giresun turkey', 'giresun city'],
  'ordu': ['ordu turkey', 'ordu city'],
  'samsun': ['samsun turkey', 'samsun city'],
  'amasya': ['amasya turkey', 'amasya city'],
  'tokat': ['tokat turkey', 'tokat city'],
  'sivas': ['sivas turkey', 'sivas city'],
  'çorum': ['corum turkey', 'corum city'],
  'yozgat': ['yozgat turkey', 'yozgat city'],
  'nevşehir': ['nevsehir turkey', 'nevsehir city'],
  'kırşehir': ['kirsehir turkey', 'kirsehir city'],
  'kırıkkale': ['kirikkale turkey', 'kirikkale city'],
  'çankırı': ['cankiri turkey', 'cankiri city'],
  'kastamonu': ['kastamonu turkey', 'kastamonu city'],
  'sinop': ['sinop turkey', 'sinop city'],
  'zonguldak': ['zonguldak turkey', 'zonguldak city'],
  'bartın': ['bartin turkey', 'bartin city'],
  'karabük': ['karabuk turkey', 'karabuk city'],
  'bolu': ['bolu turkey', 'bolu city'],
  'düzce': ['duzce turkey', 'duzce city'],
  
  // Yurtdışı ülkeler
  'almanya': ['germany', 'german city', 'berlin germany'],
  'fransa': ['france', 'paris france', 'french city'],
  'italya': ['italy', 'rome italy', 'italian city'],
  'ispanya': ['spain', 'madrid spain', 'spanish city'],
  'portekiz': ['portugal', 'lisbon portugal', 'portuguese city'],
  'hollanda': ['netherlands', 'amsterdam netherlands', 'dutch city'],
  'belçika': ['belgium', 'brussels belgium', 'belgian city'],
  'avusturya': ['austria', 'vienna austria', 'austrian city'],
  'isviçre': ['switzerland', 'zurich switzerland', 'swiss city'],
  'polonya': ['poland', 'warsaw poland', 'polish city'],
  'çek cumhuriyeti': ['czech republic', 'prague czech', 'czech city'],
  'macaristan': ['hungary', 'budapest hungary', 'hungarian city'],
  'slovakya': ['slovakia', 'bratislava slovakia', 'slovak city'],
  'slovenya': ['slovenia', 'ljubljana slovenia', 'slovenian city'],
  'hırvatistan': ['croatia', 'zagreb croatia', 'croatian city'],
  'sırbistan': ['serbia', 'belgrade serbia', 'serbian city'],
  'bosna hersek': ['bosnia herzegovina', 'sarajevo bosnia', 'bosnian city'],
  'karadağ': ['montenegro', 'podgorica montenegro', 'montenegrin city'],
  'arnavutluk': ['albania', 'tirana albania', 'albanian city'],
  'makedonya': ['macedonia', 'skopje macedonia', 'macedonian city'],
  'bulgaristan': ['bulgaria', 'sofia bulgaria', 'bulgarian city'],
  'romanya': ['romania', 'bucharest romania', 'romanian city'],
  'moldova': ['moldova', 'chisinau moldova', 'moldovan city'],
  'ukrayna': ['ukraine', 'kyiv ukraine', 'ukrainian city'],
  'rusya': ['russia', 'moscow russia', 'russian city'],
  'belarus': ['belarus', 'minsk belarus', 'belarusian city'],
  'litvanya': ['lithuania', 'vilnius lithuania', 'lithuanian city'],
  'letonya': ['latvia', 'riga latvia', 'latvian city'],
  'estonya': ['estonia', 'tallinn estonia', 'estonian city'],
  'finlandiya': ['finland', 'helsinki finland', 'finnish city'],
  'isveç': ['sweden', 'stockholm sweden', 'swedish city'],
  'norveç': ['norway', 'oslo norway', 'norwegian city'],
  'danimarka': ['denmark', 'copenhagen denmark', 'danish city'],
  'izlanda': ['iceland', 'reykjavik iceland', 'icelandic city'],
  'ingiltere': ['england', 'london england', 'english city'],
  'galleri': ['wales', 'cardiff wales', 'welsh city'],
  'iskocya': ['scotland', 'edinburgh scotland', 'scottish city'],
  'kuzey irlanda': ['northern ireland', 'belfast northern ireland', 'northern irish city'],
  'irlanda': ['ireland', 'dublin ireland', 'irish city'],
  'malta': ['malta', 'valletta malta', 'maltese city'],
  'kıbrıs': ['cyprus', 'nicosia cyprus', 'cypriot city'],
  'yunanistan': ['greece', 'athens greece', 'greek city'],
  'türkiye': ['turkey', 'turkish city', 'istanbul turkey'],
  
  // Asya ülkeleri
  'japonya': ['japan', 'tokyo japan', 'japanese city'],
  'güney kore': ['south korea', 'seoul south korea', 'korean city'],
  'kuzey kore': ['north korea', 'pyongyang north korea', 'north korean city'],
  'çin': ['china', 'beijing china', 'chinese city'],
  'tayvan': ['taiwan', 'taipei taiwan', 'taiwanese city'],
  'hong kong': ['hong kong', 'hong kong city'],
  'singapur': ['singapore', 'singapore city'],
  'malezya': ['malaysia', 'kuala lumpur malaysia', 'malaysian city'],
  'tayland': ['thailand', 'bangkok thailand', 'thai city'],
  'vietnam': ['vietnam', 'hanoi vietnam', 'vietnamese city'],
  'kamboçya': ['cambodia', 'phnom penh cambodia', 'cambodian city'],
  'laos': ['laos', 'vientiane laos', 'laotian city'],
  'myanmar': ['myanmar', 'yangon myanmar', 'myanmar city'],
  'filipinler': ['philippines', 'manila philippines', 'filipino city'],
  'endonezya': ['indonesia', 'jakarta indonesia', 'indonesian city'],
  'hindistan': ['india', 'new delhi india', 'indian city'],
  'pakistan': ['pakistan', 'islamabad pakistan', 'pakistani city'],
  'bangladesh': ['bangladesh', 'dhaka bangladesh', 'bangladeshi city'],
  'sri lanka': ['sri lanka', 'colombo sri lanka', 'sri lankan city'],
  'nepal': ['nepal', 'kathmandu nepal', 'nepalese city'],
  'bhutan': ['bhutan', 'thimphu bhutan', 'bhutanese city'],
  'afganistan': ['afghanistan', 'kabul afghanistan', 'afghan city'],
  'iran': ['iran', 'tehran iran', 'iranian city'],
  'irak': ['iraq', 'baghdad iraq', 'iraqi city'],
  'suriye': ['syria', 'damascus syria', 'syrian city'],
  'lübnan': ['lebanon', 'beirut lebanon', 'lebanese city'],
  'israil': ['israel', 'jerusalem israel', 'israeli city'],
  'filistin': ['palestine', 'ramallah palestine', 'palestinian city'],
  'ürdün': ['jordan', 'amman jordan', 'jordanian city'],
  'suudi arabistan': ['saudi arabia', 'riyadh saudi arabia', 'saudi city'],
  'kuveyt': ['kuwait', 'kuwait city'],
  'bahreyn': ['bahrain', 'manama bahrain', 'bahraini city'],
  'katar': ['qatar', 'doha qatar', 'qatari city'],
  'birleşik arap emirlikleri': ['united arab emirates', 'dubai uae', 'emirati city'],
  'umman': ['oman', 'muscat oman', 'omani city'],
  'yemen': ['yemen', 'sanaa yemen', 'yemeni city'],
  
  // Afrika ülkeleri
  'mısır': ['egypt', 'cairo egypt', 'egyptian city'],
  'libya': ['libya', 'tripoli libya', 'libyan city'],
  'tunus': ['tunisia', 'tunis tunisia', 'tunisian city'],
  'cezayir': ['algeria', 'algiers algeria', 'algerian city'],
  'fas': ['morocco', 'rabat morocco', 'moroccan city'],
  'sudan': ['sudan', 'khartoum sudan', 'sudanese city'],
  'güney sudan': ['south sudan', 'juba south sudan', 'south sudanese city'],
  'etiyopya': ['ethiopia', 'addis ababa ethiopia', 'ethiopian city'],
  'somali': ['somalia', 'mogadishu somalia', 'somali city'],
  'kenya': ['kenya', 'nairobi kenya', 'kenyan city'],
  'tanzanya': ['tanzania', 'dodoma tanzania', 'tanzanian city'],
  'uganda': ['uganda', 'kampala uganda', 'ugandan city'],
  'ruanda': ['rwanda', 'kigali rwanda', 'rwandan city'],
  'burundi': ['burundi', 'gitega burundi', 'burundian city'],
  'demokratik kongo cumhuriyeti': ['democratic republic of congo', 'kinshasa drc', 'congolese city'],
  'kongo': ['republic of congo', 'brazzaville congo', 'congolese city'],
  'gabon': ['gabon', 'libreville gabon', 'gabonese city'],
  'ekvator ginesi': ['equatorial guinea', 'malabo equatorial guinea', 'equatorial guinean city'],
  'kamerun': ['cameroon', 'yaounde cameroon', 'cameroonian city'],
  'orta afrika cumhuriyeti': ['central african republic', 'bangui car', 'central african city'],
  'çad': ['chad', 'ndjamena chad', 'chadian city'],
  'nijer': ['niger', 'niamey niger', 'nigerien city'],
  'mali': ['mali', 'bamako mali', 'malian city'],
  'bukina faso': ['burkina faso', 'ouagadougou burkina faso', 'burkinabe city'],
  'senegal': ['senegal', 'dakar senegal', 'senegalese city'],
  'gambiya': ['gambia', 'banjul gambia', 'gambian city'],
  'gine-bissau': ['guinea-bissau', 'bissau guinea-bissau', 'guinea-bissauan city'],
  'gine': ['guinea', 'conakry guinea', 'guinean city'],
  'sierra leone': ['sierra leone', 'freetown sierra leone', 'sierra leonean city'],
  'liberya': ['liberia', 'monrovia liberia', 'liberian city'],
  'fildişi sahili': ['ivory coast', 'abidjan ivory coast', 'ivorian city'],
  'ghana': ['ghana', 'accra ghana', 'ghanaian city'],
  'togo': ['togo', 'lome togo', 'togolese city'],
  'benin': ['benin', 'porto-novo benin', 'beninese city'],
  'nijerya': ['nigeria', 'abuja nigeria', 'nigerian city'],
  'gabon': ['gabon', 'libreville gabon', 'gabonese city'],
  'ekvator ginesi': ['equatorial guinea', 'malabo equatorial guinea', 'equatorial guinean city'],
  'kamerun': ['cameroon', 'yaounde cameroon', 'cameroonian city'],
  'orta afrika cumhuriyeti': ['central african republic', 'bangui car', 'central african city'],
  'çad': ['chad', 'ndjamena chad', 'chadian city'],
  'nijer': ['niger', 'niamey niger', 'nigerien city'],
  'mali': ['mali', 'bamako mali', 'malian city'],
  'bukina faso': ['burkina faso', 'ouagadougou burkina faso', 'burkinabe city'],
  'senegal': ['senegal', 'dakar senegal', 'senegalese city'],
  'gambiya': ['gambia', 'banjul gambia', 'gambian city'],
  'gine-bissau': ['guinea-bissau', 'bissau guinea-bissau', 'guinea-bissauan city'],
  'gine': ['guinea', 'conakry guinea', 'guinean city'],
  'sierra leone': ['sierra leone', 'freetown sierra leone', 'sierra leonean city'],
  'liberya': ['liberia', 'monrovia liberia', 'liberian city'],
  'fildişi sahili': ['ivory coast', 'abidjan ivory coast', 'ivorian city'],
  'ghana': ['ghana', 'accra ghana', 'ghanaian city'],
  'togo': ['togo', 'lome togo', 'togolese city'],
  'benin': ['benin', 'porto-novo benin', 'beninese city'],
  'nijerya': ['nigeria', 'abuja nigeria', 'nigerian city'],
  
  // Amerika ülkeleri
  'amerika birleşik devletleri': ['united states', 'usa', 'american city'],
  'kanada': ['canada', 'ottawa canada', 'canadian city'],
  'meksika': ['mexico', 'mexico city', 'mexican city'],
  'brezilya': ['brazil', 'brasilia brazil', 'brazilian city'],
  'arjantin': ['argentina', 'buenos aires argentina', 'argentine city'],
  'şili': ['chile', 'santiago chile', 'chilean city'],
  'peru': ['peru', 'lima peru', 'peruvian city'],
  'bolivya': ['bolivia', 'la paz bolivia', 'bolivian city'],
  'paraguay': ['paraguay', 'asuncion paraguay', 'paraguayan city'],
  'uruguay': ['uruguay', 'montevideo uruguay', 'uruguayan city'],
  'kolombiya': ['colombia', 'bogota colombia', 'colombian city'],
  'venezuela': ['venezuela', 'caracas venezuela', 'venezuelan city'],
  'ekvador': ['ecuador', 'quito ecuador', 'ecuadorian city'],
  'guyana': ['guyana', 'georgetown guyana', 'guyanese city'],
  'surinam': ['suriname', 'paramaribo suriname', 'surinamese city'],
  'fransız guyanası': ['french guiana', 'cayenne french guiana', 'french guianese city'],
  
  // Okyanusya ülkeleri
  'avustralya': ['australia', 'canberra australia', 'australian city'],
  'yeni zelanda': ['new zealand', 'wellington new zealand', 'new zealand city'],
  'papua yeni gine': ['papua new guinea', 'port moresby papua new guinea', 'papua new guinean city'],
  'fiji': ['fiji', 'suva fiji', 'fijian city'],
  'samoa': ['samoa', 'apia samoa', 'samoan city'],
  'tonga': ['tonga', 'nuku alofa tonga', 'tongan city'],
  'vanuatu': ['vanuatu', 'port vila vanuatu', 'vanuatuan city'],
  'solomon adaları': ['solomon islands', 'honiara solomon islands', 'solomon islander city'],
  'kiribati': ['kiribati', 'south tarawa kiribati', 'kiribati city'],
  'tuvalu': ['tuvalu', 'funafuti tuvalu', 'tuvaluan city'],
  'nauru': ['nauru', 'yaren nauru', 'nauruan city'],
  'palau': ['palau', 'ngerulmud palau', 'palauan city'],
  'marshall adaları': ['marshall islands', 'majuro marshall islands', 'marshallese city'],
  'mikronezya': ['micronesia', 'palikir micronesia', 'micronesian city'],
  
  // Özel destinasyonlar
  'maldivler': ['maldives', 'maldives beach', 'maldives island'],
  'seyşeller': ['seychelles', 'seychelles beach', 'seychelles island'],
  'mauritius': ['mauritius', 'mauritius beach', 'mauritius island'],
  'bahamalar': ['bahamas', 'bahamas beach', 'bahamas island'],
  'jamaika': ['jamaica', 'jamaica beach', 'jamaica island'],
  'barbados': ['barbados', 'barbados beach', 'barbados island'],
  'trinidad ve tobago': ['trinidad and tobago', 'port of spain trinidad', 'trinidadian city'],
  'guyana': ['guyana', 'georgetown guyana', 'guyanese city'],
  'surinam': ['suriname', 'paramaribo suriname', 'surinamese city'],
  'fransız guyanası': ['french guiana', 'cayenne french guiana', 'french guianese city'],
  
  // Genel terimler
  'tatil': ['vacation', 'holiday', 'travel'],
  'seyahat': ['travel', 'journey', 'trip'],
  'turizm': ['tourism', 'travel', 'vacation'],
  'plaj': ['beach', 'coast', 'shore'],
  'deniz': ['sea', 'ocean', 'coast'],
  'dağ': ['mountain', 'peak', 'summit'],
  'orman': ['forest', 'woods', 'jungle'],
  'şehir': ['city', 'urban', 'metropolitan'],
  'köy': ['village', 'rural', 'countryside'],
  'kasaba': ['town', 'small city', 'settlement']
}

// Yazı içeriğinden destinasyon isimlerini çıkar
export function extractDestinations(text) {
  if (!text) return []
  
  const lowerText = text.toLowerCase()
  const foundDestinations = []
  
  for (const [destination, searchTerms] of Object.entries(DESTINATION_MAPPING)) {
    if (lowerText.includes(destination)) {
      foundDestinations.push({
        name: destination,
        searchTerms: searchTerms
      })
    }
  }
  
  return foundDestinations
}

// Unsplash'ten görsel al
export async function getDestinationImage(destination) {
  try {
    if (!destination || !destination.searchTerms || destination.searchTerms.length === 0) {
      return null
    }
    
    // İlk arama terimini kullan
    const searchTerm = destination.searchTerms[0]
    
    const result = await unsplash.search.getPhotos({
      query: searchTerm,
      page: 1,
      perPage: 1,
      orientation: 'landscape'
    })
    
    if (result.response && result.response.results && result.response.results.length > 0) {
      const photo = result.response.results[0]
      return {
        url: photo.urls.regular,
        alt: photo.alt_description || `${destination.name} görseli`,
        photographer: photo.user?.name || 'Unsplash',
        photographerUrl: photo.user?.links?.html || null
      }
    }
    
    return null
  } catch (error) {
    console.error('Görsel alma hatası:', error)
    return null
  }
}

// Ana fonksiyon - yazıya otomatik görsel ekle
export async function addAutoImageToPost(post) {
  // Eğer zaten görsel varsa, işlem yapma
  if (post.featured_image_url) {
    return post
  }
  
  // Yazı içeriğinden destinasyonları çıkar
  const content = `${post.title} ${post.excerpt} ${post.content}`
  const destinations = extractDestinations(content)
  
  if (destinations.length === 0) {
    console.log('📝 Destinasyon bulunamadı, varsayılan görsel kullanılacak')
    return {
      ...post,
      featured_image_url: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=600&fit=crop',
      featured_image_alt: 'Seyahat ve tatil görseli'
    }
  }
  
  // İlk bulunan destinasyon için görsel al
  const destination = destinations[0]
  console.log(`🏖️ ${destination.name} için görsel aranıyor...`)
  
  const image = await getDestinationImage(destination)
  
  if (image) {
    console.log(`✅ ${destination.name} için görsel bulundu`)
    return {
      ...post,
      featured_image_url: image.url,
      featured_image_alt: image.alt
    }
  } else {
    console.log(`❌ ${destination.name} için görsel bulunamadı`)
    return post
  }
}

// Toplu işlem için fonksiyon
export async function addAutoImagesToPosts(posts) {
  const updatedPosts = []
  
  for (const post of posts) {
    const updatedPost = await addAutoImageToPost(post)
    updatedPosts.push(updatedPost)
  }
  
  return updatedPosts
}
