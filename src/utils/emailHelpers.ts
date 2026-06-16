/**
 * Utility functions for sending background emails
 */

/**
 * Send email notification to kartiniteknikberdaya@gmail.com in the background
 * This function does not block the main action and silently handles errors
 */
export const sendBackgroundEmail = async (
  type: 'order_now' | 'catalog_download' | 'page_visit',
  data: {
    productName?: string
    productSlug?: string
    productPrice?: string
    productCategory?: string
    productUrl?: string
    firstName?: string
    email?: string
    whatsapp?: string
    pageName?: string
    pageUrl?: string
    catalogLanguage?: string
  }
) => {
  // Don't await - fire and forget
  fetch('/api/subscribe', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      firstName: data.firstName || 'Visitor',
      email: data.email || 'unknown@email.com',
      whatsapp: data.whatsapp || '',
      notificationType: type,
      pageName: data.pageName,
      pageUrl: data.pageUrl,
      catalogLanguage: data.catalogLanguage,
      ...(type === 'order_now' && {
        productName: data.productName,
        productSlug: data.productSlug,
        productPrice: data.productPrice,
        productCategory: data.productCategory,
        productUrl: data.productUrl || window.location.href,
      }),
    }),
  }).catch((error) => {
    // Silently log error without blocking user action
    console.error('Background email error:', error)
  })
}