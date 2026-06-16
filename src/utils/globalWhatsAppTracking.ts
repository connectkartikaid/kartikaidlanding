/**
 * Global WhatsApp Click Tracking
 * Automatically tracks all WhatsApp links across the entire website
 * including blog content, dynamic content, etc.
 */

import { trackWhatsAppClick } from './whatsappTracking';

/**
 * Initialize global WhatsApp link tracking
 * This should be called once when the app starts
 */
export const initializeGlobalWhatsAppTracking = (): void => {
  // Track clicks on all WhatsApp links
  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    
    // Check if the clicked element is a link or inside a link
    const link = target.closest('a') as HTMLAnchorElement;
    
    if (!link) return;
    
    const href = link.getAttribute('href');
    
    // Check if it's a WhatsApp link
    if (href && (href.includes('wa.me/+6282314332942') || href.includes('wa.me/6282314332942'))) {
      // Determine the source based on context
      let source = 'unknown';
      
      // Check if it's in blog content
      if (link.closest('.blog-content') || link.closest('.about-product-content')) {
        source = 'blog_content';
      } else if (link.closest('.message-content')) {
        source = 'chatbot_message';
      } else if (link.closest('.faq-item')) {
        source = 'faq_content';
      } else if (link.closest('footer')) {
        source = 'footer_global';
      } else if (link.closest('header')) {
        source = 'header_global';
      } else {
        // Try to get more specific source from the link's context
        const parentClasses = Array.from(link.parentElement?.classList || []).join(' ');
        const grandParentClasses = Array.from(link.parentElement?.parentElement?.classList || []).join(' ');
        source = `dynamic_content_${parentClasses || grandParentClasses || 'unknown'}`.substring(0, 50);
      }
      
      // Track the click
      trackWhatsAppClick(source, {
        href: href,
        linkText: link.textContent?.trim() || 'No text',
        pageSection: getPageSection(link)
      });
    }
  }, true); // Use capture phase to ensure we catch all clicks
};

/**
 * Helper function to determine which section of the page the link is in
 */
function getPageSection(element: HTMLElement): string {
  const sections = [
    'hero',
    'about',
    'features',
    'testimonials',
    'cta',
    'contact',
    'footer',
    'header',
    'sidebar',
    'main',
    'blog',
    'product'
  ];
  
  let current: HTMLElement | null = element;
  
  while (current && current !== document.body) {
    const classList = Array.from(current.classList);
    
    for (const section of sections) {
      if (classList.some(cls => cls.toLowerCase().includes(section))) {
        return section;
      }
    }
    
    current = current.parentElement;
  }
  
  return 'unknown';
}

/**
 * Clean up the global event listener
 * Call this if you need to remove the tracking (e.g., during testing)
 */
export const cleanupGlobalWhatsAppTracking = (): void => {
  // Since we're using addEventListener with capture, we'd need to keep a reference
  // to the actual function to remove it. For now, this is a placeholder.
  // In practice, the tracking will remain active for the lifetime of the page.
  console.log('Global WhatsApp tracking cleanup requested');
};
