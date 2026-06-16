/**
 * WhatsApp Click Tracking Utility
 * Tracks all WhatsApp link clicks and sends email notifications
 */

interface WhatsAppClickData {
  source: string; // e.g., 'footer', 'blog', 'contact_page', 'chatbot', 'product_detail'
  page: string; // current page URL
  timestamp: string;
  language?: string;
}

/**
 * Track WhatsApp link click and send email notification
 * @param source - Where the WhatsApp link was clicked from
 * @param additionalInfo - Any additional contextual information
 */
export const trackWhatsAppClick = async (
  source: string,
  additionalInfo?: Record<string, any>
): Promise<void> => {
  try {
    const clickData: WhatsAppClickData = {
      source,
      page: window.location.href,
      timestamp: new Date().toISOString(),
      language: document.documentElement.lang || 'en',
      ...additionalInfo
    };

    // Send tracking data to API
    await fetch('/api/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        notificationType: 'whatsapp_click',
        firstName: 'Visitor',
        email: 'unknown@email.com',
        whatsappClickData: clickData,
      }),
    });

    console.log('WhatsApp click tracked:', clickData);
  } catch (error) {
    console.error('Failed to track WhatsApp click:', error);
    // Don't throw error to avoid blocking user interaction
  }
};

/**
 * Wrap WhatsApp link with click tracking
 * Usage: onClick={(e) => handleWhatsAppClick(e, 'footer')}
 */
export const handleWhatsAppClick = async (
  event: React.MouseEvent<HTMLAnchorElement>,
  source: string,
  additionalInfo?: Record<string, any>
): Promise<void> => {
  // Track the click (don't wait for it to complete)
  trackWhatsAppClick(source, additionalInfo);
  
  // Let the link navigation continue normally
  // The tracking happens in the background
};

/**
 * Create a tracked WhatsApp link
 * @param source - Where the link is being used
 * @param message - Optional pre-filled message
 */
export const createTrackedWhatsAppUrl = (
  source: string,
  message?: string,
  additionalInfo?: Record<string, any>
): string => {
  // Track on URL creation (will be called when component renders)
  // We'll track again on actual click for accuracy
  const baseUrl = 'https://wa.me/+6282314332942';
  
  if (message) {
    return `${baseUrl}?text=${encodeURIComponent(message)}`;
  }
  
  return baseUrl;
};

/**
 * Higher-order function to wrap onClick handlers with WhatsApp tracking
 */
export const withWhatsAppTracking = (
  source: string,
  onClick?: () => void,
  additionalInfo?: Record<string, any>
) => {
  return () => {
    trackWhatsAppClick(source, additionalInfo);
    if (onClick) {
      onClick();
    }
  };
};
