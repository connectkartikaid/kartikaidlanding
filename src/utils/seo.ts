import { type LanguageCode } from './languageManager'

const BASE_URL = 'https://kartika.id'

const LANGUAGE_PATH_PREFIXES: Record<LanguageCode, string> = {
  id: '/id',
  en: '/eng',
  ar: '/ar',
  zh: '/zh',
  ja: '/ja',
  es: '/es',
  fr: '/fr',
  ko: '/ko'
}

const TRACKING_PARAM_BLOCKLIST = new Set([
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'utm_id',
  'gclid',
  'fbclid',
  'igshid',
  'mc_eid',
  'mc_cid',
  'ref',
  'referrer',
  'mkt_tok',
  'vero_conv',
  'vero_id'
])

const LANGUAGE_METADATA: Record<
  LanguageCode,
  { lang: string; locale: string; direction: 'ltr' | 'rtl'; hrefLang: string }
> = {
  id: { lang: 'id', locale: 'id_ID', direction: 'ltr', hrefLang: 'id-ID' },
  en: { lang: 'en', locale: 'en_US', direction: 'ltr', hrefLang: 'en' },
  ar: { lang: 'ar', locale: 'ar_SA', direction: 'rtl', hrefLang: 'ar' },
  zh: { lang: 'zh', locale: 'zh_CN', direction: 'ltr', hrefLang: 'zh-CN' },
  ja: { lang: 'ja', locale: 'ja_JP', direction: 'ltr', hrefLang: 'ja-JP' },
  es: { lang: 'es', locale: 'es_ES', direction: 'ltr', hrefLang: 'es-ES' },
  fr: { lang: 'fr', locale: 'fr_FR', direction: 'ltr', hrefLang: 'fr-FR' },
  ko: { lang: 'ko', locale: 'ko_KR', direction: 'ltr', hrefLang: 'ko-KR' }
}

const SUPPORTED_LANGUAGES = Object.keys(LANGUAGE_METADATA) as LanguageCode[]

const normalizePath = (path: string): string => {
  if (!path) return '/'
  const hasLeadingSlash = path.startsWith('/')
  let normalized = hasLeadingSlash ? path : `/${path}`

  // Remove duplicate trailing slashes except for root
  if (normalized.length > 1 && normalized.endsWith('/')) {
    normalized = normalized.replace(/\/+$/, '')
  }

  return normalized || '/'
}

// Remove language path prefixes from paths (e.g., /id/blog/post -> /blog/post)
const removeLanguagePrefix = (path: string): string => {
  for (const prefix of Object.values(LANGUAGE_PATH_PREFIXES)) {
    if (!prefix) continue
    if (path.startsWith(`${prefix}/`)) {
      return path.substring(prefix.length) || '/'
    }
    if (path === prefix) {
      return '/'
    }
  }
  return path
}

const getLanguageFromPath = (path: string): LanguageCode | null => {
  for (const [lang, prefix] of Object.entries(LANGUAGE_PATH_PREFIXES)) {
    if (!prefix) continue
    if (path === prefix || path.startsWith(`${prefix}/`)) {
      return lang as LanguageCode
    }
  }
  return null
}

const stripLanguageFromPath = (path: string): { normalizedPath: string; detectedLang: LanguageCode | null } => {
  const normalized = normalizePath(path || '/')
  const detectedLang = getLanguageFromPath(normalized)
  if (!detectedLang) {
    return { normalizedPath: normalized, detectedLang: null }
  }
  return {
    normalizedPath: removeLanguagePrefix(normalized) || '/',
    detectedLang
  }
}

const sanitizeSearchParams = (
  params: URLSearchParams,
  { includeLang }: { includeLang: boolean }
): URLSearchParams => {
  const sanitized = new URLSearchParams()
  params.forEach((value, key) => {
    if (!value) return
    if (TRACKING_PARAM_BLOCKLIST.has(key) || key.startsWith('utm_')) {
      return
    }
    if (key === 'lang') {
      if (!includeLang) return
      if (value === 'en') return // English is the default language
    }
    sanitized.set(key, value)
  })
  return sanitized
}

const buildUrlFromParams = (path: string, params: URLSearchParams): string => {
  const normalizedPath = normalizePath(path)
  const query = params.toString()
  return `${BASE_URL}${normalizedPath}${query ? `?${query}` : ''}`
}

// SEO utility functions for canonical URLs and hreflang
export const generateCanonicalUrl = (path: string, search: string = ''): string => {
  const { normalizedPath, detectedLang } = stripLanguageFromPath(path)
  const params = new URLSearchParams(search)

  if (detectedLang && !params.has('lang')) {
    params.set('lang', detectedLang)
  }

  const canonicalParams = sanitizeSearchParams(params, { includeLang: true })
  return buildUrlFromParams(normalizedPath, canonicalParams)
}

export const generateLocalizedUrls = (pathname: string, search: string = '') => {
  const { normalizedPath, detectedLang } = stripLanguageFromPath(pathname)
  const params = new URLSearchParams(search)

  if (detectedLang && !params.has('lang')) {
    params.set('lang', detectedLang)
  }

  const canonicalParams = sanitizeSearchParams(params, { includeLang: true })
  const canonical = buildUrlFromParams(normalizedPath, canonicalParams)

  const baseParams = sanitizeSearchParams(params, { includeLang: false })
  const baseParamsString = baseParams.toString()

  const buildLangHref = (lang: LanguageCode) => {
    if (lang === 'en') {
      return buildUrlFromParams(normalizedPath, new URLSearchParams(baseParamsString))
    }
    const langParams = new URLSearchParams(baseParamsString)
    langParams.set('lang', lang)
    return buildUrlFromParams(normalizedPath, langParams)
  }

  const alternates = [
    ...SUPPORTED_LANGUAGES.map((code) => ({
      hrefLang: LANGUAGE_METADATA[code].hrefLang,
      href: buildLangHref(code)
    })),
    {
      hrefLang: 'x-default',
      href: buildUrlFromParams(normalizedPath, new URLSearchParams(baseParamsString))
    }
  ]

  return { canonical, alternates }
}

export const generateHreflangTags = (path: string, search: string = '') => {
  const { normalizedPath, detectedLang } = stripLanguageFromPath(path)
  const params = new URLSearchParams(search)

  if (detectedLang && !params.has('lang')) {
    params.set('lang', detectedLang)
  }

  const baseParams = sanitizeSearchParams(params, { includeLang: false })
  const baseParamsString = baseParams.toString()

  const entries = SUPPORTED_LANGUAGES.reduce<Record<string, string>>((acc, code) => {
    const langParams = new URLSearchParams(baseParamsString)
    if (code !== 'en') {
      langParams.set('lang', code)
    }
    acc[LANGUAGE_METADATA[code].hrefLang] = buildUrlFromParams(normalizedPath, langParams)
    return acc
  }, {})

  entries['x-default'] = buildUrlFromParams(normalizedPath, new URLSearchParams(baseParamsString))
  return entries
}

export const generateLanguageSpecificMeta = (
  languageOrIndonesian: boolean | LanguageCode
) => {
  const language: LanguageCode =
    typeof languageOrIndonesian === 'boolean'
      ? (languageOrIndonesian ? 'id' : 'en')
      : languageOrIndonesian

  const metadata = LANGUAGE_METADATA[language] ?? LANGUAGE_METADATA.en

  return {
    locale: metadata.locale,
    lang: metadata.lang,
    direction: metadata.direction
  }
}

// Generate structured data with proper language
export const generateLocalizedStructuredData = (data: any, isIndonesian: boolean) => {
  return {
    ...data,
    inLanguage: isIndonesian ? 'id' : 'en',
    ...(data.name && { 
      name: isIndonesian ? data.name : data.name 
    }),
    ...(data.description && { 
      description: isIndonesian ? data.description : data.description 
    })
  }
}

// Convert image path to full URL
export const getImageUrl = (imagePath: string): string => {
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath
  }
  
  let filename = ''
  if (imagePath.includes('/')) {
    filename = imagePath.split('/').pop() || ''
  } else {
    filename = imagePath
  }
  
  if (filename.includes('.')) {
    return `https://kartika.id/images/${filename}`
  }
  
  if (imagePath.includes('images')) {
    const parts = imagePath.split('images')
    if (parts.length > 1) {
      const assetPath = parts[1].startsWith('/') ? parts[1] : `/${parts[1]}`
      return `https://kartika.id${assetPath}`
    }
  }
  
  return `https://kartika.id/images/${filename}`
}

/**
 * Truncate title to optimal SEO length (50-60 characters)
 */
export const truncateTitle = (title: string, maxLength: number = 60): string => {
  if (!title) return ''
  if (title.length <= maxLength) return title
  const truncated = title.substring(0, maxLength - 3).trim()
  const lastSpace = truncated.lastIndexOf(' ')
  if (lastSpace > 0 && lastSpace > maxLength - 20) {
    return truncated.substring(0, lastSpace) + '...'
  }
  return truncated + '...'
}

/**
 * Truncate meta description to optimal SEO length (120-160 characters)
 */
export const truncateMetaDescription = (description: string, minLength: number = 120, maxLength: number = 160): string => {
  if (!description) return ''
  if (description.length < minLength) return description
  if (description.length <= maxLength) return description
  const truncated = description.substring(0, maxLength - 3).trim()
  const lastSpace = truncated.lastIndexOf(' ')
  if (lastSpace > 0 && lastSpace > minLength) {
    return truncated.substring(0, lastSpace) + '...'
  }
  return truncated + '...'
}

// Alias used by Shop.tsx and ProductDetail.tsx
export const getProductImageUrl = (imagePath: string, _slug?: string): string => {
  return getImageUrl(imagePath)
}
