import { useState, useEffect, useRef } from 'react'
import { Helmet } from 'react-helmet-async'
import { useLocation, Link } from 'react-router-dom'
import '../../public/style.css'
import './Home.css'
import { getLandingConfig, getLandingDraft } from '../data/landingConfig'
import { generateOrganizationStructuredData } from '../utils/structuredData'
import { generateBreadcrumbSchema, generateWebPageSchema, generateMetaDescription } from '../utils/seoEnhancements'
import { getCurrentLanguage } from '../utils/languageManager'
import { KARTIKA_BLOG_POSTS } from '../data/kartika-blog'

const Home = () => {
    const location = useLocation();
    const currentLanguage = getCurrentLanguage(location.pathname, location.search);

    useEffect(() => {
        document.documentElement.lang = currentLanguage;
    }, [currentLanguage]);
    const [missionType, setMissionType] = useState('women-empowerment');
    const [teamType, setTeamType] = useState('coreteam');
    const [speakerType, setSpeakerType] = useState('1stgen');
    const [activeProgram, setActiveProgram] = useState('kartishare');
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const carouselRef = useRef<HTMLDivElement>(null);
    const requestRef = useRef<number>(0);
    const scrollAmount = useRef(0);
    const headerRef = useRef<HTMLElement>(null);
    const [config, setConfig] = useState(window.location.pathname === '/sandbox' ? getLandingDraft() : getLandingConfig());

    // Listen for config changes from Editor
    useEffect(() => {
        const handleStorage = () => {
            if (window.location.pathname === '/sandbox') setConfig(getLandingDraft());
            else setConfig(getLandingConfig());
        };
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    // Auto cycle missions
    useEffect(() => {
        const missions = ['women-empowerment', 'networking', 'development'];
        const interval = setInterval(() => {
            setMissionType(prev => {
                const currentIndex = missions.indexOf(prev);
                return missions[(currentIndex + 1) % missions.length];
            });
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    // Auto cycle programs
    useEffect(() => {
        const programs = ['kartishare', 'kartiship', 'kartinection'];
        const interval = setInterval(() => {
            setActiveProgram(prev => {
                const currentIndex = programs.indexOf(prev);
                return programs[(currentIndex + 1) % programs.length];
            });
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    // Header scroll
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    // Toggle body class for Kartika background
    useEffect(() => {
        document.body.classList.add('kartika-home-active');
        return () => {
            document.body.classList.remove('kartika-home-active');
        };
    }, []);

    // Carousel scroll
    useEffect(() => {
        const carousel = carouselRef.current;
        if (!carousel) return;

        const scrollSpeed = 1;

        const autoScroll = () => {
            if (!carousel) return;
            scrollAmount.current += scrollSpeed;
            if (scrollAmount.current >= carousel.scrollWidth - carousel.clientWidth) {
                scrollAmount.current = 0;
            }
            carousel.scrollLeft = scrollAmount.current;
            requestRef.current = requestAnimationFrame(autoScroll);
        };

        requestRef.current = requestAnimationFrame(autoScroll);

        const handleMouseEnter = () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };

        const handleMouseLeave = () => {
            requestRef.current = requestAnimationFrame(autoScroll);
        };

        carousel.addEventListener('mouseenter', handleMouseEnter);
        carousel.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
            if (carousel) {
                carousel.removeEventListener('mouseenter', handleMouseEnter);
                carousel.removeEventListener('mouseleave', handleMouseLeave);
            }
        };
    }, []);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleNavClick = (e: any, targetId: string) => {
        e.preventDefault();
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            const headerOffset = 100;
            const elementPosition = targetElement.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    };

    const checkLongText = (text: string) => {
        return text.length > 120 ? 'testimonial-text long' : 'testimonial-text';
    };

    const schemaOrg = generateOrganizationStructuredData();
    const schemaWebPage = generateWebPageSchema({
        title: 'Kartika.id - Komunitas Perempuan Teknik Indonesia',
        description: generateMetaDescription('home'),
        url: '/'
    });
    const schemaBreadcrumb = generateBreadcrumbSchema([{ name: "Home", url: "/" }]);

    return (
        <div className="kartika-home">
            <Helmet>
                <html lang={currentLanguage} />
                <title>Kartika.id | Komunitas Perempuan Teknik Indonesia</title>
                <meta name="description" content={generateMetaDescription('home')} />
                <script type="application/ld+json">{JSON.stringify(schemaOrg)}</script>
                <script type="application/ld+json">{JSON.stringify(schemaWebPage)}</script>
                <script type="application/ld+json">{JSON.stringify(schemaBreadcrumb)}</script>
            </Helmet>

            <header ref={headerRef} className={`kartika-header ${isScrolled ? 'scrolled' : ''} ${isMobileMenuOpen ? 'mobile-menu-active' : ''}`}>
                <div className="header-inner">
                    <div className="logo-container" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        <img src="/images/Kartika-logo.png" alt="Kartika.id Logo" className="header-logo-img" width="180" height="40" />
                        <p className="header-logo-text">{config.navLogoText || 'Kartini Teknik Berdaya'}</p>
                    </div>

                    <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                        <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
                    </button>

                    <div className={`nav-links ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
                        <a href="#" className="nav-home-link active-mobile" onClick={(e) => { handleNavClick(e, '#'); setIsMobileMenuOpen(false); }}>Home</a>
                        <a href="#about-us" onClick={(e) => { handleNavClick(e, '#about-us'); setIsMobileMenuOpen(false); }}>About Us</a>
                        <a href="#our-programs" onClick={(e) => { handleNavClick(e, '#our-programs'); setIsMobileMenuOpen(false); }}>Our Programs</a>
                        <a href="#our-team" onClick={(e) => { handleNavClick(e, '#our-team'); setIsMobileMenuOpen(false); }}>Our Team</a>
                        <a href="/blog" onClick={() => setIsMobileMenuOpen(false)}>Blog</a>
                        <a href="#join-us" className="btn" onClick={(e) => { handleNavClick(e, '#join-us'); setIsMobileMenuOpen(false); }}>Join Now</a>
                    </div>
                </div>
            </header>

            <section className="hero">
                <div className="container hero-content-container">
                    <div className="hero-content">
                        <h1 style={{ whiteSpace: 'pre-line' }}>{config.heroTitle}</h1>
                        <p>{config.heroSubtitle}</p>
                    </div>
                </div>
                <div className="hero-image">
                    <img src={config.heroImage} alt="Kartika Engineers" />
                </div>
            </section>

            <section className="about-us" id="about-us">
                <div className="container about-us-content-container">
                    <div className="about-us-content">
                        <h2>About Us</h2>
                        <p style={{ whiteSpace: 'pre-line' }}>{config.aboutText}</p>
                    </div>
                    <div className="about-us-image">
                        <img src={config.aboutImage} alt="Kartika.id Team" width="600" height="400" loading="lazy" />
                    </div>
                </div>
            </section>

            <section className="our-missions-section" id="our-missions">
                <div className="container our-missions-content-container">
                    <div className="our-missions-header">
                        <h2>{config.missionsHeading || 'Our Missions'}</h2>
                    </div>
                    <div className="our-missions-main-content">
                        <div className="missions-nav">
                            {config.missions.map(m => (
                                <button key={m.id} className={`mission-btn ${missionType === m.id ? 'active' : ''}`} onClick={() => setMissionType(m.id)}>{m.title}</button>
                            ))}
                        </div>
                        <div className="missions-content-display">
                            {config.missions.map(m => (
                                <div key={m.id} id={m.id} className={`mission-text-content ${missionType === m.id ? 'active' : ''}`}>
                                    <p style={{ whiteSpace: 'pre-line' }}>{m.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section className="about-us" id="our-programs">
                <div className="container about-us-content-container">
                    <div className="about-us-content">
                        <h2>{config.programsHeading || 'Our Programes'}</h2>
                        <div className="programs-grid">
                            {config.programs.map((p, i) => {
                                const icons = ['fa-share-alt', 'fa-handshake', 'fa-network-wired'];
                                return (
                                    <div key={p.id} className={`program-item ${activeProgram === p.id ? 'active' : ''}`} id={p.id}>
                                        <div className="program-icon">
                                            <i className={`fas ${icons[i % icons.length]}`}></i>
                                        </div>
                                        <h3>{p.title}</h3>
                                        <p className="subtitle">{p.subtitle}</p>
                                        <p style={{ whiteSpace: 'pre-line' }}>{p.desc}</p>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </section>

            <section className="first-generation-section" id="first-generation">
                <div className="container first-generation-content-container">
                    <h2 className="section-title">{config.statsGroupTitle || 'Kartika.id First Generation'}</h2>
                    <div className="impact-metrics-grid">
                        <div className="metric-item">
                            <span className="metric-number">{config.stats.events}</span>
                            <p className="metric-description">{config.stats.eventsLabel || 'Events (Kartishare, Kartinection and Kartiship)'}</p>
                        </div>
                        <div className="metric-item">
                            <span className="metric-number">{config.stats.students}</span>
                            <p className="metric-description">{config.stats.studentsLabel || 'Female Engineering Students Involved'}</p>
                        </div>
                        <div className="metric-item">
                            <span className="metric-number">{config.stats.satisfaction}</span>
                            <p className="metric-description">{config.stats.satisfactionLabel || 'Overall Satisfaction'}</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="our-partners-section" id="our-partners">
                <div className="container our-partners-content-container">
                    <h2 className="section-title">{config.partnersHeading || 'Our Past Partners'}</h2>
                    <div className="partners-grid">
                        {(config.partners || [
                            { id: 'p1', logo: '/images/unilever-logo.png', alt: 'Unilever Logo', description: 'Kartishare x Inspiring Unileader' },
                            { id: 'p2', logo: '/images/SWE-JKT-Logo.png', alt: 'SWE Jakarta Logo', description: 'Kartishare x Society of Women Engineers' },
                            { id: 'p3', logo: '/images/aapg-logo.png', alt: 'AAPG Logo', description: 'Kartishare with AAPG Indonesia' },
                        ]).map(partner => (
                            <div key={partner.id} className="partner-item">
                                <img src={partner.logo} alt={partner.alt} className="partner-logo" />
                                <p className="partner-description">{partner.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="our-speakers-section" id="our-speakers">
                <div className="container our-speakers-content-container">
                    <h2 className="section-title" style={{ whiteSpace: 'pre-line' }}>{config.speakersTitle || 'Our Speakers'}</h2>
                    <div className="team-nav">
                        <button className={`team-btn ${speakerType === '1stgen' ? 'active' : ''}`} onClick={() => setSpeakerType('1stgen')}>1st Generation <img src="/images/Kartika-logo.png" alt="Logo" className="btn-logo" /></button>
                        <button className={`team-btn ${speakerType === '2ndgen' ? 'active' : ''}`} onClick={() => setSpeakerType('2ndgen')}>2nd Generation <img src="/images/Kartika-logo.png" alt="Logo" className="btn-logo" /></button>
                    </div>
                    <div className="team-gallery-container">
                        <div id="speakers-1st-gallery" className={`team-gallery ${speakerType === '1stgen' ? 'active' : ''}`}>
                            <div className="team-member">
                                <img src={config.speakersImage} alt="Kartika.id First Generation Speakers" className="speaker-image" width="1200" height="424" loading="lazy" />
                            </div>
                        </div>
                        <div id="speakers-2nd-gallery" className={`team-gallery ${speakerType === '2ndgen' ? 'active' : ''}`}>
                            <div className="team-member">
                                <img src={config.speakers2ndImage} alt="Kartika.id Second Generation Speakers" className="speaker-image" width="1200" height="424" loading="lazy" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="about-us" id="our-team">
                <div className="container about-us-content-container">
                    <div className="about-us-content">
                        <h2>Our Team</h2>
                        <div className="team-nav">
                            <button className={`team-btn ${teamType === 'coreteam' ? 'active' : ''}`} onClick={() => setTeamType('coreteam')}>Coreteam <img src="/images/Kartika-logo.png" alt="Logo" className="btn-logo" width="20" height="20" loading="lazy" /></button>
                            <button className={`team-btn ${teamType === 'advisors' ? 'active' : ''}`} onClick={() => setTeamType('advisors')}>Advisors <img src="/images/Kartika-logo.png" alt="Logo" className="btn-logo" width="20" height="20" loading="lazy" /></button>
                            <button className={`team-btn ${teamType === 'mentors' ? 'active' : ''}`} onClick={() => setTeamType('mentors')}>Mentors <img src="/images/Kartika-logo.png" alt="Logo" className="btn-logo" width="20" height="20" loading="lazy" /></button>
                            <button className={`team-btn ${teamType === 'members' ? 'active' : ''}`} onClick={() => setTeamType('members')}>Members <img src="/images/Kartika-logo.png" alt="Logo" className="btn-logo" width="20" height="20" loading="lazy" /></button>
                        </div>
                        <div className="team-gallery-container">
                            <div id="coreteam-gallery" className={`team-gallery ${teamType === 'coreteam' ? 'active' : ''}`}>
                                <div className="team-member">
                                    <img src={config.coreteamImage} alt="Kartika.id Core Team" width="1200" height="600" loading="lazy" />
                                </div>
                            </div>
                            <div id="advisors-gallery" className={`team-gallery ${teamType === 'advisors' ? 'active' : ''}`}>
                                <div className="team-member">
                                    <img src={config.advisorsImage} alt="Kartika.id Advisors" width="1200" height="600" loading="lazy" />
                                </div>
                            </div>
                            <div id="mentors-gallery" className={`team-gallery ${teamType === 'mentors' ? 'active' : ''}`}>
                                <div className="team-member">
                                    <img src={config.mentorsImage} alt="Kartika.id Mentors" width="1200" height="600" loading="lazy" />
                                </div>
                            </div>
                            <div id="members-gallery" className={`team-gallery ${teamType === 'members' ? 'active' : ''}`}>
                                <div className="team-member">
                                    <img src={config.membersImage} alt="Kartika.id Members" width="1200" height="600" loading="lazy" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="about-us" id="testimonials">
                <div className="container about-us-content-container">
                    <div className="about-us-content">
                        <h2>{config.testimonialsHeading || 'What they say about us'}</h2>
                    </div>
                </div>
                <div className="testimonials-carousel-wrapper">
                    <div className="testimonials-carousel" ref={carouselRef}>
                        {config.testimonials.map((t) => (
                            <div key={t.id} className="testimonial-card">
                                <div className="testimonial-content">
                                    <div className="testimonial-text-content">
                                        <p className={checkLongText(t.text)}>{`"${t.text}"`}</p>
                                        <div className="testimonial-author">
                                            <img
                                                src={`/images/testi-${t.name.split(' ')[0].toLowerCase().replace('.', '')}.png`}
                                                alt={t.name}
                                                className="testimonial-image"
                                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                                            />
                                            <p><strong>{t.name}</strong> | {t.role}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {/* Duplicated for smooth scrolling loop */}
                        {config.testimonials.map((t) => (
                            <div key={t.id + '-dup'} className="testimonial-card">
                                <div className="testimonial-content">
                                    <div className="testimonial-text-content">
                                        <p className={checkLongText(t.text)}>{`"${t.text}"`}</p>
                                        <div className="testimonial-author">
                                            <img
                                                src={`/images/testi-${t.name.split(' ')[0].toLowerCase().replace('.', '')}.png`}
                                                alt={t.name}
                                                className="testimonial-image"
                                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                                            />
                                            <p><strong>{t.name}</strong> | {t.role}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="gradient-overlay left"></div>
                <div className="gradient-overlay right"></div>
            </section>

            <section className="latest-blog-section" id="latest-blog">
                <div className="container">
                    <h2 className="section-title" style={{ color: '#2D1B00' }}>Latest Articles</h2>
                    <div className="blog-posts-grid">
                        {KARTIKA_BLOG_POSTS
                            .filter(post => post.status === 'synced')
                            .slice(0, 3)
                            .map((post) => (
                                <div key={post.id} className="blog-card">
                                    <div className="blog-card-image">
                                        <img src={post.image} alt={post.title} />
                                    </div>
                                    <div className="blog-card-content">
                                        <span className="blog-card-category">{post.category}</span>
                                        <h3 className="blog-card-title">{post.title}</h3>
                                        <p className="blog-card-excerpt">{post.excerpt}</p>
                                        <Link to={`/blog/${post.slug}`} className="blog-card-link">
                                            Read Article <i className="fas fa-arrow-right"></i>
                                        </Link>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                    <div style={{ textAlign: 'center', marginTop: '40px' }}>
                        <Link to="/blog" className="btn view-all-btn">View All Articles</Link>
                    </div>
                </div>
            </section>

            <section className="join-us-section" style={{ position: 'relative', zIndex: 1000 }}>
                <div className="container join-us-content-container">
                    <div className="join-us-image-wrapper">
                        <img src="/images/foto-coreteam-versi2.webp" alt="Join With Us" width="800" height="1413" loading="lazy" />
                        <a href={config.joinLink} target="_blank" rel="noreferrer" className="join-us-text" id="join-us" style={{ textDecoration: 'none' }}>{config.joinSectionTitle || 'Join With us'}</a>
                    </div>
                </div>
            </section>

            <footer style={{ position: 'relative', zIndex: 1000 }}>
                <div className="container">
                    <div className="footer-content">
                        <div className="footer-section" style={{ marginBottom: '30px' }}>
                            <h3>Quick Links</h3>
                            <div className="footer-links-row">
                                <a href="#" onClick={(e) => { handleNavClick(e, '#'); }}>Home</a>
                                <a href="#about-us" onClick={(e) => { handleNavClick(e, '#about-us'); }}>About Us</a>
                                <a href="#our-programs" onClick={(e) => { handleNavClick(e, '#our-programs'); }}>Our Programs</a>
                                <a href="#our-team" onClick={(e) => { handleNavClick(e, '#our-team'); }}>Our Team</a>
                                <Link to="/blog">Blog</Link>
                            </div>
                        </div>
                        <div className="footer-section">
                            <h3>{config.footerConnectTitle || 'Connect With Us'}</h3>
                            <div className="footer-links-row">
                                {config.instagramLink && <a href={config.instagramLink} target="_blank" rel="noreferrer"><i className="fab fa-instagram"></i> Instagram</a>}
                                {config.linkedinLink && <a href={config.linkedinLink} target="_blank" rel="noreferrer"><i className="fab fa-linkedin"></i> LinkedIn</a>}
                                {config.emailAddress && <a href={`mailto:${config.emailAddress}`}><i className="fas fa-envelope"></i> Email: {config.emailAddress}</a>}
                                {config.contactCenterLink && (
                                    <a href={config.contactCenterLink} target="_blank" rel="noreferrer">
                                       <i className="fab fa-whatsapp"></i> Contact Center (Head of Partnership)
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;
