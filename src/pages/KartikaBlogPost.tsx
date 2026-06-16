import React, { useEffect, useRef, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link, useParams, Navigate } from 'react-router-dom'
import '../../public/style.css'
import './Home.css'
import './Blog.css'
import './BlogPost.css'
import { KARTIKA_BLOG_POSTS, type KartikaBlogPost } from '../data/kartika-blog'
import { generateBlogPostingSchema } from '../utils/structuredData'
import { generateBreadcrumbSchema } from '../utils/seoEnhancements'

// ── Helper: load post from base data + localStorage drafts ────────────────────
function loadPost(slug: string): KartikaBlogPost | undefined {
  // 1. Check localStorage for draft overrides
  try {
    const raw = localStorage.getItem('kartika_blog_drafts')
    if (raw) {
      const drafts: KartikaBlogPost[] = JSON.parse(raw)
      const draft = drafts.find(p => p.slug === slug)
      if (draft) return draft
    }
  } catch { /* ignore */ }

  // 2. Fall back to static base data
  return KARTIKA_BLOG_POSTS.find(p => p.slug === slug)
}

const KartikaBlogPostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const [isScrolled, setIsScrolled] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)
  const headerRef = useRef<HTMLElement>(null)

  const post = slug ? loadPost(slug) : undefined

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [slug])

  useEffect(() => {
    document.body.classList.add('kartika-home-active')
    return () => document.body.classList.remove('kartika-home-active')
  }, [])

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!post) return <Navigate to="/blog" replace />

  const formattedDate = new Date(post.date).toLocaleDateString('id-ID', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  const currentUrl = typeof window !== 'undefined' ? window.location.href : ''

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl)
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 3000)
    } catch { /* ignore */ }
  }

  // Render content from customContent if present
  const hasCustomContent = post.customContent && (
    post.customContent.introduction ||
    (post.customContent.sections && post.customContent.sections.length > 0) ||
    post.customContent.conclusion
  )

  const canonicalUrl = `https://kartika.id/blog/${post.slug}`
  const schemaBlogPost = generateBlogPostingSchema({
    title: post.title,
    excerpt: post.excerpt,
    slug: post.slug,
    date: post.date,
    image: post.image || 'https://kartika.id/images/Kartika-logo.png',
    category: post.category,
    author: post.author || 'Tim Kartika.id',
  })
  const schemaBreadcrumb = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Blog', url: '/blog' },
    { name: post.title, url: `/blog/${post.slug}` },
  ])

  return (
    <div className="kartika-home">
      <Helmet>
        <title>{post.title} | Kartika.id</title>
        <meta name="description" content={post.excerpt} />
        <meta name="author" content={post.author || 'Tim Kartika.id'} />
        <meta name="keywords" content={`${post.category}, perempuan teknik, women in engineering, kartika.id, STEM indonesia, ${post.title}`} />
        <link rel="canonical" href={canonicalUrl} />
        {/* Open Graph */}
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:image" content={post.image || 'https://kartika.id/images/Kartika-logo.png'} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:site_name" content="Kartika.id" />
        <meta property="og:locale" content="id_ID" />
        <meta property="article:published_time" content={post.date} />
        <meta property="article:author" content={post.author || 'Tim Kartika.id'} />
        <meta property="article:section" content={post.category} />
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={post.excerpt} />
        <meta name="twitter:image" content={post.image || 'https://kartika.id/images/Kartika-logo.png'} />
        {/* Schema.org JSON-LD */}
        <script type="application/ld+json">{JSON.stringify(schemaBlogPost)}</script>
        <script type="application/ld+json">{JSON.stringify(schemaBreadcrumb)}</script>
        <link
          href="https://fonts.googleapis.com/css2?family=Gelasio:wght@600&family=Josefin+Sans:wght@400;600&display=swap"
          rel="stylesheet"
        />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </Helmet>

      {/* ── NAV (identical to Home.tsx) ──────────────────────────────── */}
      <header
        ref={headerRef}
        className={`kartika-header ${isScrolled ? 'scrolled' : ''}`}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto', padding: '10px 20px', width: '100%', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '280px', flexShrink: 0 }}>
            <Link to="/">
              <img src="/images/Kartika-logo.png" alt="Kartika.id Logo" style={{ width: '100%', height: 'auto', display: 'block' }} />
            </Link>
            <p style={{ margin: '5px 0 0 0', color: '#FEFAE4', fontFamily: '"Josefin Sans", sans-serif', fontSize: '0.95em', fontWeight: 'normal' }}>Kartini Teknik Berdaya</p>
          </div>
          <div className="nav-links" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '15px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            <Link to="/#about-us">About Us</Link>
            <Link to="/#our-programs">Our Programs</Link>
            <Link to="/#our-team">Our Team</Link>
            <Link to="/blog">Blog</Link>
            <a href="https://bit.ly/KartikaID_3rdGen_Registration_Form" target="_blank" rel="noreferrer" className="btn">Join Now</a>
          </div>
        </div>
      </header>

      {/* ── HERO IMAGE ───────────────────────────────────────────────── */}
      <section className="blog-post-hero" style={{ marginTop: 0 }}>
        <div className="blog-post-hero-image">
          <img
            src={post.image}
            alt={post.title}
            loading="eager"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div className="blog-post-hero-overlay" />
        </div>
        <div className="blog-post-hero-content">
          <div className="blog-post-hero-inner">
            <span className="blog-post-category-tag" style={{ background: '#D04A02' }}>{post.category}</span>
            <h1 id="blog-post-title" className="blog-post-title">{post.title}</h1>
            <p className="blog-post-meta">
              {post.author || 'Tim Kartika.id'} · {formattedDate}
            </p>
          </div>
        </div>
      </section>

      {/* ── BREADCRUMB ───────────────────────────────────────────────── */}
      <div style={{ background: '#FEFAE4', padding: '12px 20px', borderBottom: '1px solid #e8e0d4' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', fontFamily: '"Josefin Sans", sans-serif', fontSize: '0.85em', color: '#888' }}>
          <Link to="/" style={{ color: '#D04A02', textDecoration: 'none' }}>Home</Link>
          {' › '}
          <Link to="/blog" style={{ color: '#D04A02', textDecoration: 'none' }}>Blog</Link>
          {' › '}
          <span style={{ color: '#555' }}>{post.category}</span>
        </div>
      </div>

      {/* ── ARTICLE BODY ─────────────────────────────────────────────── */}
      <main style={{ background: '#FEFAE4', padding: '60px 20px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>

          {hasCustomContent ? (
            /* Custom written content from Admin */
            <div className="blog-post-article">

              {/* Excerpt / intro */}
              {post.customContent?.introduction ? (
                <div
                  className="blog-post-section"
                  dangerouslySetInnerHTML={{ __html: post.customContent.introduction }}
                  style={{ fontFamily: '"Josefin Sans", sans-serif', fontSize: '1.05em', lineHeight: 1.8, color: '#333', marginBottom: '2rem' }}
                />
              ) : (
                <p style={{ fontFamily: '"Josefin Sans", sans-serif', fontSize: '1.1em', lineHeight: 1.8, color: '#555', marginBottom: '2rem', fontStyle: 'italic' }}>
                  {post.excerpt}
                </p>
              )}

              {/* Key Takeaways */}
              {post.customContent?.keyPoints && post.customContent.keyPoints.length > 0 && (
                <div style={{ background: '#fff', border: '2px solid #D04A02', borderRadius: '12px', padding: '24px', marginBottom: '2rem' }}>
                  <h3 style={{ fontFamily: '"Gelasio", serif', color: '#D04A02', margin: '0 0 16px', fontSize: '1.2em' }}>🔑 Key Takeaways</h3>
                  <ul style={{ margin: 0, paddingLeft: '1.5rem', fontFamily: '"Josefin Sans", sans-serif', lineHeight: 1.8, color: '#333' }}>
                    {post.customContent.keyPoints.map((point, i) => (
                      <li key={i}>{point}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Sections */}
              {post.customContent?.sections?.map((section, i) => (
                <section key={i} className="blog-post-section" style={{ marginBottom: '2.5rem' }}>
                  {section.heading && (
                    <h2 className="blog-post-section-heading" style={{ fontFamily: '"Gelasio", serif', color: '#2D1B00', fontSize: '1.5em', marginBottom: '1rem', borderLeft: '4px solid #D04A02', paddingLeft: '14px' }}>
                      {section.heading}
                    </h2>
                  )}
                  <div
                    className="blog-post-paragraph"
                    dangerouslySetInnerHTML={{ __html: section.content }}
                    style={{ fontFamily: '"Josefin Sans", sans-serif', fontSize: '1em', lineHeight: 1.8, color: '#444' }}
                  />
                  {section.image && (
                    <figure style={{ margin: '1.5rem 0' }}>
                      <img
                        src={section.image}
                        alt={section.imageAlt || section.heading}
                        loading="lazy"
                        style={{ width: '100%', borderRadius: '8px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}
                      />
                      {section.imageAlt && (
                        <figcaption style={{ fontFamily: '"Josefin Sans", sans-serif', fontSize: '0.85em', color: '#888', textAlign: 'center', marginTop: '8px' }}>
                          {section.imageAlt}
                        </figcaption>
                      )}
                    </figure>
                  )}
                </section>
              ))}

              {/* Conclusion */}
              {post.customContent?.conclusion && (
                <div
                  style={{ background: '#D04A02', borderRadius: '12px', padding: '24px', marginBottom: '2rem', color: '#FEFAE4' }}
                  dangerouslySetInnerHTML={{ __html: post.customContent.conclusion }}
                />
              )}
            </div>
          ) : (
            /* No custom content — show excerpt + placeholder */
            <div>
              <p style={{ fontFamily: '"Josefin Sans", sans-serif', fontSize: '1.1em', lineHeight: 1.8, color: '#555', marginBottom: '2rem', fontStyle: 'italic' }}>
                {post.excerpt}
              </p>
              <div style={{ background: '#fff', border: '1px dashed #D04A02', borderRadius: '12px', padding: '32px', textAlign: 'center', color: '#888', fontFamily: '"Josefin Sans", sans-serif' }}>
                <p style={{ fontSize: '1.1em', marginBottom: '8px' }}>📝 Konten artikel sedang disiapkan</p>
                <p style={{ fontSize: '0.9em' }}>Admin dapat melengkapi artikel ini melalui <Link to="/admin/blog" style={{ color: '#D04A02' }}>/admin/blog</Link></p>
              </div>
            </div>
          )}

          {/* ── SHARE BAR ────────────────────────────────────────────── */}
          <div style={{ borderTop: '2px solid #e8e0d4', marginTop: '3rem', paddingTop: '2rem' }}>
            <p style={{ fontFamily: '"Josefin Sans", sans-serif', fontWeight: 600, color: '#555', marginBottom: '12px' }}>
              Bagikan artikel ini:
            </p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {[
                { label: 'WhatsApp', color: '#25D366', url: `https://wa.me/?text=${encodeURIComponent(post.title + ' ' + currentUrl)}`, icon: 'fab fa-whatsapp' },
                { label: 'LinkedIn', color: '#0077B5', url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`, icon: 'fab fa-linkedin' },
                { label: 'Twitter/X', color: '#1DA1F2', url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(post.title)}`, icon: 'fab fa-twitter' },
              ].map(({ label, color, url, icon }) => (
                <a key={label} href={url} target="_blank" rel="noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: color, color: '#fff', padding: '8px 16px', borderRadius: '20px', textDecoration: 'none', fontFamily: '"Josefin Sans", sans-serif', fontSize: '0.85em', fontWeight: 600 }}>
                  <i className={icon} /> {label}
                </a>
              ))}
              <button onClick={handleCopy}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: linkCopied ? '#27ae60' : '#555', color: '#fff', padding: '8px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontFamily: '"Josefin Sans", sans-serif', fontSize: '0.85em', fontWeight: 600 }}>
                <i className={linkCopied ? 'fas fa-check' : 'fas fa-link'} /> {linkCopied ? 'Disalin!' : 'Salin Link'}
              </button>
            </div>
          </div>

          {/* ── BACK TO BLOG ─────────────────────────────────────────── */}
          <div style={{ marginTop: '3rem', textAlign: 'center' }}>
            <Link to="/blog"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#D04A02', color: '#FEFAE4', padding: '12px 28px', borderRadius: '25px', textDecoration: 'none', fontFamily: '"Josefin Sans", sans-serif', fontWeight: 600 }}>
              ← Kembali ke Blog
            </Link>
          </div>
        </div>
      </main>

      {/* ── FOOTER (identical to Home.tsx) ───────────────────────────── */}
      <footer style={{ position: 'relative', zIndex: 1000 }}>
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>Connect With Us</h3>
              <div className="footer-links-row">
                <a href="https://www.instagram.com/kartikaidn/" target="_blank" rel="noreferrer">
                  <i className="fab fa-instagram" /> Instagram
                </a>
                <a href="https://www.linkedin.com/company/kartika-id" target="_blank" rel="noreferrer">
                  <i className="fab fa-linkedin" /> LinkedIn
                </a>
                <a href="mailto:kartiniteknikberdaya@gmail.com">
                  <i className="fas fa-envelope" /> Email: kartiniteknikberdaya@gmail.com
                </a>
                <a href="https://wa.me/+6282314332942" target="_blank" rel="noreferrer" style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minWidth: '280px', width: 'auto', padding: '12px 20px', lineHeight: '1.4' }}>
                  <i className="fab fa-whatsapp" style={{ marginRight: 0, marginBottom: '8px' }} /> Contact Center <br /> (Head of Partnership)
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default KartikaBlogPostPage
