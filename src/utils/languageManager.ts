/**
 * Language management utility
 * Persists language preference across pages to maintain consistency
 * Supports: English (en), Indonesian (id), Arabic (ar), Mandarin (zh), Japanese (ja), Spanish (es), French (fr), Korean (ko)
 */

const LANGUAGE_STORAGE_KEY = 'kartika_lang_preference'

export type LanguageCode = 'id' | 'en' | 'ar' | 'zh' | 'ja' | 'es' | 'fr' | 'ko'

/**
 * Get stored language preference from localStorage
 */
export const getStoredLanguage = (): LanguageCode | null => {
  if (typeof window === 'undefined') return null
  try {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY)
    if (stored === 'id' || stored === 'en' || stored === 'ar' || stored === 'zh' || stored === 'ja' || stored === 'es' || stored === 'fr' || stored === 'ko') {
      return stored as LanguageCode
    }
  } catch (error) {
    console.log('Failed to read language from localStorage')
  }
  return null
}

/**
 * Store language preference to localStorage
 */
export const storeLanguage = (lang: LanguageCode): void => {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang)
  } catch (error) {
    console.log('Failed to store language to localStorage')
  }
}

/**
 * Get language from URL location (synchronous)
 * Checks URL path and query parameters only
 * Returns null if no language is found in URL
 */
export const getLanguageFromLocation = (
  pathname: string,
  search: string
): LanguageCode | null => {
  // 1) Check query parameter ?lang=
  const searchParams = new URLSearchParams(search)
  const langParam = searchParams.get('lang')
  if (langParam === 'id' || langParam === 'en' || langParam === 'ar' || langParam === 'zh' || langParam === 'ja' || langParam === 'es' || langParam === 'fr' || langParam === 'ko') {
    return langParam as LanguageCode
  }

  // 2) Check URL for language prefix
  if (pathname.startsWith('/id') || pathname.startsWith('/id/')) return 'id'
  if (pathname.startsWith('/eng') || pathname.startsWith('/eng/')) return 'en'
  if (pathname.startsWith('/ar') || pathname.startsWith('/ar/')) return 'ar'
  if (pathname.startsWith('/zh') || pathname.startsWith('/zh/')) return 'zh'
  if (pathname.startsWith('/ja') || pathname.startsWith('/ja/')) return 'ja'
  if (pathname.startsWith('/es') || pathname.startsWith('/es/')) return 'es'
  if (pathname.startsWith('/fr') || pathname.startsWith('/fr/')) return 'fr'
  if (pathname.startsWith('/ko') || pathname.startsWith('/ko/')) return 'ko'

  return null
}

/**
 * Get current language with consistent priority:
 * 1. URL (query param or path prefix)
 * 2. Stored preference (localStorage)
 * 3. Browser language (fallback)
 * 
 * This ensures language consistency across pages
 */
export const getCurrentLanguage = (
  pathname: string,
  search: string
): LanguageCode => {
  // 1) Check URL first (highest priority)
  const urlLang = getLanguageFromLocation(pathname, search)
  if (urlLang) {
    // Store it if found in URL
    storeLanguage(urlLang)
    return urlLang
  }

  // 2) Check stored preference (user's previous choice)
  const stored = getStoredLanguage()
  if (stored) {
    return stored
  }

  // 3) Fallback to browser language
  const browserLang = navigator.language || navigator.languages?.[0]
  if (browserLang?.startsWith('id')) {
    storeLanguage('id')
    return 'id'
  }
  if (browserLang?.startsWith('ko')) {
    storeLanguage('ko')
    return 'ko'
  }
  if (browserLang?.startsWith('fr')) {
    storeLanguage('fr')
    return 'fr'
  }
  if (browserLang?.startsWith('es')) {
    storeLanguage('es')
    return 'es'
  }
  if (browserLang?.startsWith('ja')) {
    storeLanguage('ja')
    return 'ja'
  }
  if (browserLang?.startsWith('ar')) {
    storeLanguage('ar')
    return 'ar'
  }
  if (browserLang?.startsWith('zh')) {
    storeLanguage('zh')
    return 'zh'
  }

  // Default to English
  storeLanguage('en')
  return 'en'
}

/**
 * Generate URL with language parameter
 * Used for navigation links to preserve language
 */
export const getLinkWithLanguage = (path: string, currentLanguage: LanguageCode): string => {
  // Remove leading slash if present for consistency
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  
  // If path already has query params, append lang, otherwise add it
  const hasQuery = cleanPath.includes('?')
  const separator = hasQuery ? '&' : '?'
  
  return `${cleanPath}${separator}lang=${currentLanguage}`
}

/**
 * Detect language from IP (for first visit only)
 * Should only be called if no stored preference exists
 */
export const detectLanguageFromIP = async (): Promise<LanguageCode | null> => {
  try {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Timeout')), 2000)
    })
    
    const fetchPromise = fetch('https://ipapi.co/json/')
      .then(response => response.json())
    
    const data = await Promise.race([fetchPromise, timeoutPromise]) as any
    const countryCode = data.country_code
    
    const frenchCountries = ['FR', 'BE', 'CH', 'LU', 'MC', 'CA', 'HT', 'CI', 'SN', 'ML', 'NE', 'BF', 'TG', 'BJ', 'CD', 'CG', 'GA', 'CM', 'CF', 'TD', 'MG', 'RE', 'MU', 'SC', 'KM', 'YT', 'DJ']
    const spanishCountries = ['ES', 'MX', 'AR', 'CO', 'VE', 'PE', 'CL', 'EC', 'GT', 'CU', 'BO', 'DO', 'HN', 'PY', 'SV', 'NI', 'CR', 'PA', 'UY']
    const chineseCountries = ['CN', 'TW', 'HK', 'SG', 'MO']
    const arabicCountries = ['SA', 'AE', 'KW', 'QA', 'OM', 'BH', 'EG', 'JO', 'LB', 'SY', 'IQ', 'YE', 'MA', 'DZ', 'TN', 'LY', 'SD', 'PS']
    
    if (countryCode === 'ID') {
      return 'id'
    } else if (countryCode === 'KR') {
      return 'ko'
    } else if (countryCode === 'JP') {
      return 'ja'
    } else if (frenchCountries.includes(countryCode)) {
      return 'fr'
    } else if (spanishCountries.includes(countryCode)) {
      return 'es'
    } else if (chineseCountries.includes(countryCode)) {
      return 'zh'
    } else if (arabicCountries.includes(countryCode)) {
      return 'ar'
    }
    
    return null
  } catch (error) {
    console.log('IP detection failed')
    return null
  }
}

/**
 * Detect language from various sources in priority order:
 * 1. URL query parameter (?lang=)
 * 2. URL path prefix (/id/, /eng/, /ar/, /zh/, /ja/, /es/, /fr/, /ko/)
 * 3. Stored preference in localStorage
 * 4. IP detection (Arabic-speaking, Chinese-speaking, Japanese, Spanish-speaking, French-speaking, Korean countries)
 * 5. Browser language fallback
 */
export const detectLanguage = async (
  pathname: string,
  search: string
): Promise<LanguageCode> => {
  // 1) Check query parameter ?lang=
  const searchParams = new URLSearchParams(search)
  const langParam = searchParams.get('lang')
  if (langParam === 'id' || langParam === 'en' || langParam === 'ar' || langParam === 'zh' || langParam === 'ja' || langParam === 'es' || langParam === 'fr' || langParam === 'ko') {
    storeLanguage(langParam as LanguageCode)
    return langParam as LanguageCode
  }

  // 2) Check URL for language prefix
  if (pathname.startsWith('/id') || pathname.startsWith('/id/')) {
    storeLanguage('id')
    return 'id'
  }
  if (pathname.startsWith('/eng') || pathname.startsWith('/eng/')) {
    storeLanguage('en')
    return 'en'
  }
  if (pathname.startsWith('/ar') || pathname.startsWith('/ar/')) {
    storeLanguage('ar')
    return 'ar'
  }
  if (pathname.startsWith('/zh') || pathname.startsWith('/zh/')) {
    storeLanguage('zh')
    return 'zh'
  }
  if (pathname.startsWith('/ja') || pathname.startsWith('/ja/')) {
    storeLanguage('ja')
    return 'ja'
  }
  if (pathname.startsWith('/es') || pathname.startsWith('/es/')) {
    storeLanguage('es')
    return 'es'
  }
  if (pathname.startsWith('/fr') || pathname.startsWith('/fr/')) {
    storeLanguage('fr')
    return 'fr'
  }
  if (pathname.startsWith('/ko') || pathname.startsWith('/ko/')) {
    storeLanguage('ko')
    return 'ko'
  }

  // 3) Check stored preference
  const stored = getStoredLanguage()
  if (stored) {
    return stored
  }

  // 4) Detect from IP - Check for language-specific countries
  try {
    const response = await fetch('https://ipapi.co/json/')
    const data = await response.json()
    const countryCode = data.country_code
    
    // Korean
    if (countryCode === 'KR') {
      storeLanguage('ko')
      return 'ko'
    }
    
    // French-speaking countries
    const frenchCountries = [
      'FR', // France
      'BE', 'CH', 'LU', 'MC', // Europe
      'CA', // Canada (Quebec)
      'HT', // Haiti
      'CI', 'SN', 'ML', 'NE', 'BF', 'TG', 'BJ', // West Africa
      'CD', 'CG', 'GA', 'CM', 'CF', 'TD', // Central Africa
      'MG', 'RE', 'MU', 'SC', 'KM', 'YT', 'DJ' // Indian Ocean
    ]
    
    // Spanish-speaking countries
    const spanishCountries = [
      'ES', // Spain
      'MX', 'AR', 'CO', 'VE', 'PE', 'CL', 'EC', // Latin America major
      'GT', 'CU', 'BO', 'DO', 'HN', 'PY', 'SV', // Central America & Caribbean
      'NI', 'CR', 'PA', 'UY' // More Latin America
    ]
    
    // Japanese
    if (countryCode === 'JP') {
      storeLanguage('ja')
      return 'ja'
    }
    
    // Chinese-speaking countries/regions
    const chineseCountries = [
      'CN', // China
      'TW', // Taiwan
      'HK', // Hong Kong
      'SG', // Singapore
      'MO'  // Macau
    ]
    
    // Arabic-speaking countries
    const arabicCountries = [
      'SA', 'AE', 'KW', 'QA', 'OM', 'BH', // Gulf countries
      'EG', 'JO', 'LB', 'SY', 'IQ', 'YE', // Levant & others
      'MA', 'DZ', 'TN', 'LY', 'SD', 'PS'  // North Africa
    ]
    
    if (frenchCountries.includes(countryCode)) {
      storeLanguage('fr')
      return 'fr'
    }
    
    if (spanishCountries.includes(countryCode)) {
      storeLanguage('es')
      return 'es'
    }
    
    if (chineseCountries.includes(countryCode)) {
      storeLanguage('zh')
      return 'zh'
    }
    
    if (arabicCountries.includes(countryCode)) {
      storeLanguage('ar')
      return 'ar'
    }
    
    if (countryCode === 'ID') {
      storeLanguage('id')
      return 'id'
    }
  } catch (error) {
    console.log('IP detection failed, checking browser language')
  }

  // 5) Fallback: check browser language
  const browserLang = navigator.language || navigator.languages?.[0]
  if (browserLang?.startsWith('id')) {
    storeLanguage('id')
    return 'id'
  }
  if (browserLang?.startsWith('ko')) {
    storeLanguage('ko')
    return 'ko'
  }
  if (browserLang?.startsWith('fr')) {
    storeLanguage('fr')
    return 'fr'
  }
  if (browserLang?.startsWith('es')) {
    storeLanguage('es')
    return 'es'
  }
  if (browserLang?.startsWith('ja')) {
    storeLanguage('ja')
    return 'ja'
  }
  if (browserLang?.startsWith('ar')) {
    storeLanguage('ar')
    return 'ar'
  }
  if (browserLang?.startsWith('zh')) {
    storeLanguage('zh')
    return 'zh'
  }

  // Default to English
  storeLanguage('en')
  return 'en'
}
