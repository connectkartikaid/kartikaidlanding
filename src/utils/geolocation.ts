// Geolocation utility for detecting visitor's country based on IP address

export interface GeolocationData {
  country: string
  countryCode: string
  isIndonesia: boolean
}

// Shared country/region groups for language targeting
// Re-exported so other utilities (e.g. languageManager) can stay in sync
export const FRENCH_SPEAKING_COUNTRIES: string[] = [
  'FR', // France
  'BE', 'CH', 'LU', 'MC', // Europe
  'CA', // Canada (Quebec)
  'HT', // Haiti
  'CI', 'SN', 'ML', 'NE', 'BF', 'TG', 'BJ', // West Africa
  'CD', 'CG', 'GA', 'CM', 'CF', 'TD', // Central Africa
  'MG', 'RE', 'MU', 'SC', 'KM', 'YT', 'DJ' // Indian Ocean
]

export const SPANISH_SPEAKING_COUNTRIES: string[] = [
  'ES', // Spain
  // Latin America – make sure Colombia and other major markets are covered
  'MX', 'AR', 'CO', 'VE', 'PE', 'CL', 'EC', // Major
  'GT', 'CU', 'BO', 'DO', 'HN', 'PY', 'SV', // Central America & Caribbean
  'NI', 'CR', 'PA', 'UY' // More Latin America
  // Note: US / PR intentionally not forced to Spanish – they are mixed-language markets
]

export const CHINESE_SPEAKING_REGIONS: string[] = [
  'CN', // China (Mainland)
  'TW', // Taiwan
  'HK', // Hong Kong
  'SG', // Singapore
  'MO'  // Macau
]

export const ARABIC_SPEAKING_COUNTRIES: string[] = [
  'SA', 'AE', 'KW', 'QA', 'OM', 'BH', // Gulf countries
  'EG', 'JO', 'LB', 'SY', 'IQ', 'YE', // Levant & others
  'MA', 'DZ', 'TN', 'LY', 'SD', 'PS'  // North Africa
]

/**
 * Detect visitor's location using IP-based geolocation
 * Returns Indonesia as default if detection fails
 */
export const detectVisitorLocation = async (): Promise<GeolocationData> => {
  try {
    // Check if we already have cached location data
    const cachedLocation = localStorage.getItem('kartika_visitor_location')
    const cachedTimestamp = localStorage.getItem('kartika_location_timestamp')
    
    // Cache for 24 hours
    if (cachedLocation && cachedTimestamp) {
      const age = Date.now() - parseInt(cachedTimestamp)
      const twentyFourHours = 24 * 60 * 60 * 1000
      
      if (age < twentyFourHours) {
        return JSON.parse(cachedLocation)
      }
    }

    // Try multiple free geolocation APIs with fallback
    let locationData: GeolocationData | null = null

    // Try ipapi.co first (100 requests per day free)
    try {
      const response = await fetch('https://ipapi.co/json/', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        locationData = {
          country: data.country_name || 'Indonesia',
          countryCode: data.country_code || 'ID',
          isIndonesia: data.country_code === 'ID'
        }
      }
    } catch (error) {
      console.log('ipapi.co failed, trying fallback...')
    }

    // Fallback to ip-api.com (free, unlimited for non-commercial)
    if (!locationData) {
      try {
        const response = await fetch('http://ip-api.com/json/?fields=status,country,countryCode', {
          method: 'GET',
        })
        
        if (response.ok) {
          const data = await response.json()
          if (data.status === 'success') {
            locationData = {
              country: data.country || 'Indonesia',
              countryCode: data.countryCode || 'ID',
              isIndonesia: data.countryCode === 'ID'
            }
          }
        }
      } catch (error) {
        console.log('ip-api.com failed, using default...')
      }
    }

    // Default to Indonesia if all APIs fail
    if (!locationData) {
      locationData = {
        country: 'Indonesia',
        countryCode: 'ID',
        isIndonesia: true
      }
    }

    // Cache the result
    localStorage.setItem('kartika_visitor_location', JSON.stringify(locationData))
    localStorage.setItem('kartika_location_timestamp', Date.now().toString())

    return locationData
  } catch (error) {
    console.error('Error detecting location:', error)
    
    // Default to Indonesia on error
    return {
      country: 'Indonesia',
      countryCode: 'ID',
      isIndonesia: true
    }
  }
}

/**
 * Set language preference based on detected location
 * Indonesian visitors get 'id', Arabic-speaking countries get 'ar', Chinese-speaking get 'zh', Japanese get 'ja', Spanish-speaking get 'es', French-speaking get 'fr', Korean get 'ko', others get 'en'
 */
export const setLanguagePreferenceByLocation = async (): Promise<'id' | 'en' | 'ar' | 'zh' | 'ja' | 'es' | 'fr' | 'ko'> => {
  try {
    const locationData = await detectVisitorLocation()
    
    // Set language preference based on location
    let langPreference: 'id' | 'en' | 'ar' | 'zh' | 'ja' | 'es' | 'fr' | 'ko' = 'en'
    
    if (locationData.isIndonesia) {
      langPreference = 'id'
    } else if (locationData.countryCode === 'KR') {
      langPreference = 'ko'
    } else if (locationData.countryCode === 'JP') {
      langPreference = 'ja'
    } else if (FRENCH_SPEAKING_COUNTRIES.includes(locationData.countryCode)) {
      langPreference = 'fr'
    } else if (SPANISH_SPEAKING_COUNTRIES.includes(locationData.countryCode)) {
      langPreference = 'es'
    } else if (CHINESE_SPEAKING_REGIONS.includes(locationData.countryCode)) {
      langPreference = 'zh'
    } else if (ARABIC_SPEAKING_COUNTRIES.includes(locationData.countryCode)) {
      langPreference = 'ar'
    }
    
    // Store in localStorage for catalog generator
    localStorage.setItem('kartika_lang_preference', langPreference)
    
    return langPreference
  } catch (error) {
    console.error('Error setting language preference:', error)
    
    // Default to English
    localStorage.setItem('kartika_lang_preference', 'en')
    return 'en'
  }
}
