import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

// In-memory storage for IP visit tracking per page
const ipPageVisits = new Map<string, number>();

async function getGeolocation(ip: string) {
  try {
    if (!ip || ip === 'unknown' || ip === '::1' || ip.startsWith('127.') || ip.startsWith('10.') || ip.startsWith('192.168.')) {
      return null;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,query`, {
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    const data = await response.json();
    return data.status === 'success' ? {
      country: data.country,
      city: data.city,
      region: data.regionName,
      isp: data.isp,
      zip: data.zip,
      timezone: data.timezone,
      lat: data.lat,
      lon: data.lon,
      org: data.org,
      countryCode: data.countryCode
    } : null;
  } catch (error) {
    console.error('Geolocation error:', error instanceof Error ? error.message : 'Unknown');
    return null;
  }
}
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const {
    firstName, email, whatsapp, notificationType,
    productName, productPrice, productCategory, productUrl,
    chatMessage, language, whatsappClickData, pageName, pageUrl,
    catalogLanguage
  } = req.body;

  console.log(`[SUBSCRIPTION] Type: ${notificationType}, Email: ${email}, Name: ${firstName}, Lang: ${catalogLanguage || 'N/A'}`);

  const forwarded = req.headers['x-forwarded-for'];
  const clientIP = (typeof forwarded === 'string' ? forwarded.split(',')[0] : 'unknown').trim();
  const geolocation = await getGeolocation(clientIP);

  console.log(`[SUBSCRIPTION] IP: ${clientIP}, Geolocation: ${geolocation ? 'Found' : 'Not Found'}`);

  // Track visits
  const visitKey = `${clientIP}-${pageName || 'unknown'}`;
  const visitNumber = (ipPageVisits.get(visitKey) || 0) + 1;
  ipPageVisits.set(visitKey, visitNumber);

  let totalVisits = 0;
  ipPageVisits.forEach((count, key) => { if (key.startsWith(clientIP)) totalVisits += count; });

  const isCatalog = notificationType === 'catalog_download';

  try {
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    if (!RESEND_API_KEY) {
      console.error('[SUBSCRIPTION] RESEND_API_KEY is missing!');
      return res.status(500).json({ error: 'Email configuration missing' });
    }

    const resend = new Resend(RESEND_API_KEY);

    let subject = '';
    let html = '';

    const loc = geolocation ? `${geolocation.city}, ${geolocation.region}, ${geolocation.country} (${geolocation.countryCode})` : 'Unknown';
    const time = new Date().toLocaleString('id-ID', {
      timeZone: 'Asia/Jakarta',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }) + ' WIB';

    const renderCommonDetails = () => `
      <div style="margin-top: 20px; border-top: 1px solid #eee; padding-top: 20px;">
        <h3 style="color: #8B7355; margin-bottom: 10px;">📍 Visitor IP Address</h3>
        <p style="margin: 5px 0;"><strong>Client IP:</strong> ${clientIP}</p>
        <p style="margin: 5px 0; color: #666; font-size: 13px;"><strong>Full Chain:</strong> ${req.headers['x-forwarded-for'] || clientIP}</p>
        
        <h3 style="color: #8B7355; margin-bottom: 10px; margin-top: 20px;">🌍 Visitor Geolocation</h3>
        <p style="margin: 5px 0;"><strong>📍 Location:</strong> ${loc}</p>
        <p style="margin: 5px 0;"><strong>📮 ZIP:</strong> ${geolocation?.zip || 'N/A'}</p>
        <p style="margin: 5px 0;"><strong>🕐 Timezone:</strong> ${geolocation?.timezone || 'N/A'}</p>
        <p style="margin: 5px 0;"><strong>📌 Coordinates:</strong> ${geolocation?.lat}, ${geolocation?.lon}</p>
        <p style="margin: 5px 0;"><strong>🌐 ISP:</strong> ${geolocation?.isp || 'Unknown'}</p>
        <p style="margin: 5px 0;"><strong>🏢 Organization:</strong> ${geolocation?.org || 'N/A'}</p>
        
        <h3 style="color: #8B7355; margin-bottom: 10px; margin-top: 20px;">🕐 Timestamp</h3>
        <p style="margin: 5px 0;">${time}</p>
        
        <h3 style="color: #8B7355; margin-bottom: 10px; margin-top: 20px;">🖥️ User Agent</h3>
        <p style="margin: 5px 0; font-size: 13px; color: #666;">${req.headers['user-agent']}</p>
        
        <h3 style="color: #8B7355; margin-bottom: 10px; margin-top: 20px;">📱 Device Information</h3>
        <p style="margin: 5px 0;"><strong>Referrer:</strong> ${req.headers['referer'] || pageUrl || 'Direct'}</p>
        <p style="margin: 5px 0;"><strong>Accept Language:</strong> ${req.headers['accept-language'] || 'Unknown'}</p>
      </div>
      <div style="margin-top: 30px; border-top: 2px solid #8B7355; padding-top: 15px; font-size: 12px; color: #777;">
        <p>This is an automated notification from kartika.id</p>
        <p>You're receiving this because a visitor interacted with your website.</p>
      </div>
    `;

    if (isCatalog || notificationType === 'order_now' || notificationType === 'whatsapp_click' || notificationType === 'chatbot_lead' || notificationType === 'chatbot_message' || notificationType === 'subscription') {
      subject = `Kartika.id Notification: ${notificationType.replace('_', ' ').toUpperCase()}`;
      html = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 25px; color: #333; line-height: 1.6; max-width: 600px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #8B7355; border-bottom: 2px solid #8B7355; padding-bottom: 10px;">🔔 New ${notificationType.replace('_', ' ').toUpperCase()}</h2>
          <div style="margin-top: 20px;">
            <p style="font-size: 16px;"><strong>Name:</strong> ${firstName || 'Visitor'}</p>
            <p style="font-size: 16px;"><strong>Email:</strong> ${email || 'N/A'}</p>
            ${whatsapp ? `<p style="font-size: 16px;"><strong>WhatsApp:</strong> ${whatsapp}</p>` : ''}
            ${catalogLanguage ? `<p style="font-size: 16px; color: #8B7355;"><strong>Catalog Language:</strong> ${catalogLanguage.toUpperCase()}</p>` : ''}
            ${productName ? `<p style="font-size: 16px;"><strong>Product:</strong> ${productName}</p>` : ''}
            ${chatMessage ? `<p style="font-size: 16px; background: #f9f9f9; padding: 10px; border-radius: 4px; border-left: 4px solid #8B7355;"><strong>Message:</strong><br/>${chatMessage}</p>` : ''}
          </div>
          
          ${renderCommonDetails()}
        </div>
      `;
    }

    if (!subject) {
      console.warn(`[SUBSCRIPTION] Invalid notification type: ${notificationType}`);
      return res.status(400).json({ error: 'Invalid notification type' });
    }

    const recipients = ['kartiniteknikberdaya@gmail.com', 'hello@kartika.id'];
    const results = [];

    // 1. Send Admin Notification (Existing Logic)
    for (const recipient of recipients) {
      console.log(`[SUBSCRIPTION] Attempting to send notification to admin: ${recipient}`);
      try {
        const { data, error } = await resend.emails.send({
          from: 'Kartika.id <hello@kartika.id>',
          to: recipient,
          subject: subject,
          html: html,
        });

        if (error) {
          console.error(`[SUBSCRIPTION] Resend notification error for ${recipient}:`, error);
          results.push({ recipient, success: false, error });
        } else {
          console.log(`[SUBSCRIPTION] Notification sent to ${recipient} successfully:`, data?.id);
          results.push({ recipient, success: true, id: data?.id });
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        results.push({ recipient, success: false, error: errorMsg });
      }
    }

    // 2. Send Catalog Delivery Email to User (New Logic)
    if ((isCatalog || notificationType === 'subscription') && email && email.includes('@')) {
      console.log(`[SUBSCRIPTION] Attempting to send catalog to customer: ${email}`);

      const pdfBaseUrl = 'https://mangala-living.com/fonts/Mangala-Living-Catalog-2026';
      const langSuffix = catalogLanguage && catalogLanguage !== 'en' && catalogLanguage !== 'id'
        ? `-${catalogLanguage.toUpperCase()}`
        : '';
      const catalogUrl = `${pdfBaseUrl}${langSuffix}.pdf`;

      const lang = catalogLanguage || 'en';

      const emailTranslations: Record<string, {
        subject: string;
        greeting: (name: string) => string;
        intro: string;
        downloadCta: string;
        fallbackText: string;
        showcaseHeading: string;
        showcaseDesc: string;
        viewDetails: string;
        viewAll: string;
        bestRegards: string;
        team: string;
        contactRemarks: string;
      }> = {
        id: {
          subject: 'Katalog Mangala Living 2026 Anda',
          greeting: (name) => `Yth. ${name},`,
          intro: 'Terima kasih telah menyatakan minat pada koleksi kami. Sesuai permintaan Anda, berikut adalah tautan untuk mengunduh Katalog Premium Mangala Living 2026 kami.',
          downloadCta: 'UNDUH KATALOG PDF',
          fallbackText: 'Jika tombol di atas tidak berfungsi, salin dan tempel tautan ini ke browser Anda:',
          showcaseHeading: 'Produk Industrial Terkait',
          showcaseDesc: 'Explore koleksi furniture industrial premium kami yang dirancang untuk memperkuat karakter bisnis Anda.',
          viewDetails: 'Lihat Detail Produk',
          viewAll: 'Lihat Semua Produk',
          bestRegards: 'Salam Hangat,',
          team: 'Tim Mangala Living',
          contactRemarks: 'Jika Anda memiliki pertanyaan, silakan hubungi kami di lifewithmangala@gmail.com. Mohon jangan membalas email no-reply ini.'
        },
        en: {
          subject: 'Your Mangala Living 2026 Catalog',
          greeting: (name) => `Dear ${name},`,
          intro: 'Thank you for your interest in our collections. As requested, here is the link to download our Mangala Living 2026 Premium Catalog.',
          downloadCta: 'DOWNLOAD PDF CATALOG',
          fallbackText: 'If the button above doesn\'t work, copy and paste this link into your browser:',
          showcaseHeading: 'Related Industrial Products',
          showcaseDesc: 'Explore our collection of premium industrial furniture designed to enhance and strengthen the character of your business.',
          viewDetails: 'View Product Details',
          viewAll: 'View All Products',
          bestRegards: 'Best Regards,',
          team: 'Mangala Living Team',
          contactRemarks: 'If you have any questions, please contact us at lifewithmangala@gmail.com. Please do not reply to this no-reply email.'
        },
        es: {
          subject: 'Su Catálogo Mangala Living 2026',
          greeting: (name) => `Estimado/a ${name},`,
          intro: 'Gracias por su interés en nuestras colecciones. Según lo solicitado, aquí tiene el enlace para descargar nuestro Catálogo Premium Mangala Living 2026.',
          downloadCta: 'DESCARGAR CATÁLOGO PDF',
          fallbackText: 'Si el botón de arriba no funciona, copie y pegue este enlace en su navegador:',
          showcaseHeading: 'Productos Industriales Relacionados',
          showcaseDesc: 'Explore nuestra colección de muebles industriales premium diseñada para mejorar y fortalecer el carácter de su negocio.',
          viewDetails: 'Ver Detalles del Producto',
          viewAll: 'Ver Todos los Productos',
          bestRegards: 'Atentamente,',
          team: 'Equipo Mangala Living',
          contactRemarks: 'Si tiene alguna pregunta, contáctenos en lifewithmangala@gmail.com. Por favor, no responda a este correo electrónico de no respuesta.'
        },
        fr: {
          subject: 'Votre Catalogue Mangala Living 2026',
          greeting: (name) => `Cher/Chère ${name},`,
          intro: 'Merci de votre intérêt pour nos collections. Comme demandé, voici le lien pour télécharger notre Catalogue Premium Mangala Living 2026.',
          downloadCta: 'TÉLÉCHARGER LE CATALOGUE PDF',
          fallbackText: 'Si le bouton ci-dessus ne fonctionne pas, copiez et collez ce lien dans votre navigateur:',
          showcaseHeading: 'Produits Industriels Associés',
          showcaseDesc: 'Explorez notre collection de meubles industriels haut de gamme conçus pour renforcer le caractère de votre entreprise.',
          viewDetails: 'Voir les Détails du Produit',
          viewAll: 'Voir Tous les Produits',
          bestRegards: 'Cordialement,',
          team: 'L\'équipe Mangala Living',
          contactRemarks: 'Si vous avez des questions, veuillez nous contacter à lifewithmangala@gmail.com. Veuillez ne pas répondre à cet e-mail de non-réponse.'
        },
        ko: {
          subject: '2026 망갈라 리빙 카탈로그',
          greeting: (name) => `친애하는 ${name}님,`,
          intro: '저희 컬렉션에 관심을 가져주셔서 감사합니다. 요청하신 대로 2026 망갈라 리빙 프리미엄 카탈로그를 다운로드할 수 있는 링크를 보내드립니다.',
          downloadCta: 'PDF 카탈로그 다운로드',
          fallbackText: '위 버튼이 작동하지 않으면 이 링크를 복사하여 브라우저에 붙여넣으세요:',
          showcaseHeading: '관련 제품 안내',
          showcaseDesc: '귀사의 비즈니스 캐릭터를 강화하고 돋보이게 디자인된 프리미엄 산업용 가구 컬렉션을 만나보세요.',
          viewDetails: '제품 상세 보기',
          viewAll: '모든 제품 보기',
          bestRegards: '감사합니다.',
          team: '망갈라 리빙 팀',
          contactRemarks: '문의 사항이 있으시면 lifewithmangala@gmail.com으로 연락주시기 바랍니다. 본 메일은 발신 전용 메일이므로 회신하지 마십시오.'
        },
        ja: {
          subject: '2026 マンガラリビングカタログ',
          greeting: (name) => `親愛なる ${name} 様、`,
          intro: '当社のコレクションにご興味をお持ちいただきありがとうございます。ご要望通り、2026マンガラリビングプレミアムカタログのダウンロードリンクをお送りいたします。',
          downloadCta: 'PDFカタログをダウンロード',
          fallbackText: '上のボタンが機能しない場合は、このリンクをコピーしてブラウザに貼り付けてください：',
          showcaseHeading: '関連する工業風製品',
          showcaseDesc: 'あなたのビジネスの個性を高め、強化するためにデザインされたプレミアムな工業風家具のコレクションをご覧ください。',
          viewDetails: '製品の詳細を見る',
          viewAll: 'すべての製品を見る',
          bestRegards: '今後ともよろしくお願いいたします。',
          team: 'マンガラリビングチーム',
          contactRemarks: 'ご不明な点がございましたら、lifewithmangala@gmail.com までお問い合わせください。このメールは送信専用ですので、返信しないでください。'
        },
        zh: {
          subject: '您的 2026 曼加拉生活目录',
          greeting: (name) => `亲爱的 ${name}，`,
          intro: '感谢您对我们系列的关注。应您的要求，这是下载我们的 2026 曼加拉生活高级目录的链接。',
          downloadCta: '下载 PDF 目录',
          fallbackText: '如果上面的按钮不起作用，请将此链接复制并粘贴到您的浏览器中：',
          showcaseHeading: '相关工业风产品',
          showcaseDesc: '探索我们专为增强和加强您的业务特色而设计的优质工业风家具系列。',
          viewDetails: '查看产品详情',
          viewAll: '查看所有产品',
          bestRegards: '致以最诚挚的问候，',
          team: '曼加拉生活团队',
          contactRemarks: '如果您有任何问题，请通过 lifewithmangala@gmail.com 与我们联系。请不要回复此自动回复邮件。'
        },
        ar: {
          subject: 'كتالوج مانجالا ليفينج 2026 الخاص بك',
          greeting: (name) => `عزيزي ${name}،`,
          intro: 'شكرًا لاهتمامك بمجموعاتنا. بناءً على طلبك، إليك الرابط لتحميل كتالوج مانجالا ليفينج 2026 المتميز.',
          downloadCta: 'تحميل كتالوج PDF',
          fallbackText: 'إذا لم يعمل الزر أعلاه، فقم بنسخ هذا الرابط ولصقه في متصفحك:',
          showcaseHeading: 'منتجات صناعية ذات صلة',
          showcaseDesc: 'استكشف مجموعتنا من الأثاث الصناعي المتميز المصمم لتعزيز وتقوية طابع عملك.',
          viewDetails: 'عرض تفاصيل المنتج',
          viewAll: 'عرض جميع المنتجات',
          bestRegards: 'مع أطيب التحيات،',
          team: 'فريق مانجالا ليفينج',
          contactRemarks: 'إذا كان لديك أي أسئلة، يرجى الاتصال بنا على lifewithmangala@gmail.com. يرجى عدم الرد على هذا البريد الإلكتروني.'
        }
      };

      const t = emailTranslations[lang] || emailTranslations['en'];

      // Random Product Showcase Logic - Using verified public image paths
      const allProducts = [
        { name: 'Frame Loft Bookshelf', slug: 'frame-loft-bookshelf', price: 'Rp3.500.000', img: 'https://mangala-living.com/images/products/frame-Loft-Bookshelf.webp' },
        { name: 'Balcony Bar Table', slug: 'balcony-bar-table', price: 'Rp350.000', img: 'https://mangala-living.com/images/products/balcony-bar-table.webp' },
        { name: 'Lounge Set Coffee Table', slug: 'lounge-set-coffee-table', price: 'Rp2.000.000', img: 'https://mangala-living.com/images/products/longue-set-coffee-table.webp' },
        { name: 'Industrial Daybed', slug: 'industrial-daybed-frame', price: 'Rp3.200.000', img: 'https://mangala-living.com/images/products/industrial-daybed-boneonly.webp' },
        { name: 'Bar Stall Chair', slug: 'bar-stall-chair', price: 'Rp450.000', img: 'https://mangala-living.com/images/products/Kursi-Bar-kursi-stall-chair.webp' },
        { name: 'Hollowline Display Rack', slug: 'hollowline-display-rack', price: 'Rp3.700.000', img: 'https://mangala-living.com/images/products/Hollowline-Display-Rack.webp' }
      ];

      const getPrice = (idr: string, targetLang: string) => {
        const val = parseInt(idr.replace(/[^0-9]/g, ''));
        if (targetLang === 'id') return idr;
        const rate = 15300;
        const usd = (val / rate).toFixed(2);
        if (targetLang === 'en' || targetLang === 'ar' || targetLang === 'zh') return `$${usd}`;
        if (targetLang === 'es' || targetLang === 'fr') return `${(val / 16500).toFixed(2)} €`;
        if (targetLang === 'ja') return `¥${(val / 102).toFixed(0)}`;
        if (targetLang === 'ko') return `₩${(val / 11.5).toFixed(0)}`;
        return `$${usd}`;
      };

      const selected = allProducts.sort(() => 0.5 - Math.random()).slice(0, 3);
      const showcaseHtml = selected.map(p => `
        <div style="border: 1px solid #eee; border-radius: 8px; margin-bottom: 20px; overflow: hidden; background: #fff;">
          <img src="${p.img}" alt="${p.name}" style="width: 100%; height: auto; display: block;" />
          <div style="padding: 15px;">
            <p style="margin: 0; color: #999; font-size: 10px; text-transform: uppercase;">MANGALA PRODUCT</p>
            <h3 style="margin: 5px 0; color: #333; font-size: 18px;">${p.name}</h3>
            <p style="margin: 0; color: #8B7355; font-weight: bold;">${getPrice(p.price, lang)}</p>
            <div style="margin-top: 15px;">
              <a href="https://mangala-living.com/product/${p.slug}" style="color: #8B7355; text-decoration: none; font-weight: bold; font-size: 14px; border-bottom: 1px solid #8B7355;">
                ${t.viewDetails} &rarr;
              </a>
            </div>
          </div>
        </div>
      `).join('');

      const userHtml = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 30px; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 12px; background-color: #fcfcfc;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #8B7355; margin: 0; letter-spacing: 2px;">MANGALA LIVING</h1>
            <p style="color: #999; text-transform: uppercase; font-size: 12px; margin-top: 5px;">Premium Industrial Furniture</p>
          </div>
          
          <h2 style="color: #444; border-bottom: 1px solid #f0f0f0; padding-bottom: 15px;">${t.greeting(firstName || 'Visitor')}</h2>
          
          <p style="font-size: 16px;">
            ${t.intro}
          </p>

          <div style="text-align: center; margin: 40px 0;">
            <a href="${catalogUrl}" style="background-color: #8B7355; color: white; padding: 15px 35px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              ${t.downloadCta}
            </a>
          </div>

          <p style="font-size: 14px; color: #666; font-style: italic;">
            ${t.fallbackText}
            <br/>
            <a href="${catalogUrl}" style="color: #8B7355; text-decoration: none; word-break: break-all;">${catalogUrl}</a>
          </p>

          <div style="margin-top: 50px; padding-top: 30px; border-top: 2px solid #eee;">
             <h2 style="color: #333; margin-bottom: 10px; text-align: center;">${t.showcaseHeading}</h2>
             <p style="color: #666; font-size: 14px; text-align: center; margin-bottom: 30px;">${t.showcaseDesc}</p>
             ${showcaseHtml}
             <div style="text-align: center; margin-top: 10px;">
               <a href="https://mangala-living.com/shop" style="color: #8B7355; text-decoration: none; font-weight: bold;">
                 ${t.viewAll} &rarr;
               </a>
             </div>
          </div>

          <div style="margin-top: 50px; padding-top: 20px; border-top: 1px solid #f0f0f0;">
            <p style="margin-bottom: 10px; color: #666; font-size: 13px;">${t.contactRemarks}</p>
            <p style="margin-bottom: 5px; font-size: 14px;"><strong>Contact Us:</strong></p>
            <p style="margin: 0; font-size: 13px;">WhatsApp: <a href="https://wa.me/6288801146881" style="color: #8B7355; text-decoration: none;">+62 888 0114 6881</a></p>
            <p style="margin: 0; font-size: 13px;">Email: <a href="mailto:lifewithmangala@gmail.com" style="color: #8B7355; text-decoration: none;">lifewithmangala@gmail.com</a></p>
            
            <div style="margin-top: 30px;">
              <p style="margin-bottom: 5px;"><strong>${t.bestRegards}</strong></p>
              <p style="margin-top: 0; color: #8B7355;"><strong>${t.team}</strong></p>
              <p style="font-size: 12px; color: #999;">
                Bekasi, West Java, Indonesia<br/>
                <a href="https://mangala-living.com" style="color: #999; text-decoration: none;">www.mangala-living.com</a>
              </p>
            </div>
          </div>
        </div>
      `;

      try {
        await resend.emails.send({
          from: 'Kartika.id <no-reply@kartika.id>',
          to: email,
          subject: t.subject,
          html: userHtml,
        });

        // WhatsApp Automation Logic (Placeholder)
        // If you have a WhatsApp API (e.g. Fonnte), you can call it here:
        // await fetch('https://api.fonnte.com/send', { ... })

        console.log(`[SUBSCRIPTION] Catalog delivered to user: ${email}`);
      } catch (err) {
        console.error(`[SUBSCRIPTION] User delivery crash:`, err);
      }
    }

    const success = results.some(r => r.success);
    return res.status(success ? 200 : 500).json({ success, results });

  } catch (error) {
    console.error('[SUBSCRIPTION] Handler crash:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
