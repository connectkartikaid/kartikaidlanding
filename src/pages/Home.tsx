import React, { useState, useEffect, useRef } from 'react'
import { Helmet } from 'react-helmet-async'
import '../../public/style.css'
import './Home.css'
import { getLandingConfig, getLandingDraft } from '../data/landingConfig'
import { generateOrganizationStructuredData } from '../utils/structuredData'
import { generateBreadcrumbSchema, generateWebPageSchema, generateMetaDescription } from '../utils/seoEnhancements'

const Home = () => {
    const [missionType, setMissionType] = useState('women-empowerment');
    const [teamType, setTeamType] = useState('coreteam');
    const [activeProgram, setActiveProgram] = useState('kartishare');
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [heroMarginTop, setHeroMarginTop] = useState('0px');
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

    // Header scroll and margin adjustment
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        const adjustHeroMargin = () => {
            if (headerRef.current) {
                setHeroMarginTop(`${headerRef.current.offsetHeight}px`);
            }
        };

        window.addEventListener('scroll', handleScroll);
        window.addEventListener('resize', adjustHeroMargin);

        // Slight delay to ensure header has rendered and measured correctly
        setTimeout(adjustHeroMargin, 50);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', adjustHeroMargin);
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
        title: 'Kartika.id - Kartini Teknik Berdaya',
        description: generateMetaDescription('home'),
        url: '/'
    });
    const schemaBreadcrumb = generateBreadcrumbSchema([{ name: "Home", url: "/" }]);

    return (
        <div className="kartika-home">
            <Helmet>
                <title>Kartika.id | Kartini Teknik Berdaya</title>
                <meta name="description" content={generateMetaDescription('home')} />
                <script type="application/ld+json">{JSON.stringify(schemaOrg)}</script>
                <script type="application/ld+json">{JSON.stringify(schemaWebPage)}</script>
                <script type="application/ld+json">{JSON.stringify(schemaBreadcrumb)}</script>
                <link href="https://fonts.googleapis.com/css2?family=Gelasio:wght@600&amp;family=Josefin+Sans:wght@600&amp;display=swap" rel="stylesheet" />
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
            </Helmet>

            <header ref={headerRef} className={`kartika-header ${isScrolled ? 'scrolled' : ''}`}>
                <div className="header-inner">
                    <div className="logo-container">
                        <img src="/images/Kartika-logo.png" alt="Kartika.id Logo" className="header-logo-img" />
                        <p className="header-logo-text">{config.navLogoText || 'Kartini Teknik Berdaya'}</p>
                    </div>
                    
                    <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                        <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
                    </button>

                    <div className={`nav-links ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
                        <a href="#about-us" onClick={(e) => { handleNavClick(e, '#about-us'); setIsMobileMenuOpen(false); }}>About Us</a>
                        <a href="#our-programs" onClick={(e) => { handleNavClick(e, '#our-programs'); setIsMobileMenuOpen(false); }}>Our Programs</a>
                        <a href="#our-team" onClick={(e) => { handleNavClick(e, '#our-team'); setIsMobileMenuOpen(false); }}>Our Team</a>
                        <a href="/blog" onClick={() => setIsMobileMenuOpen(false)}>Blog</a>
                        <a href="#join-us" className="btn" onClick={(e) => { handleNavClick(e, '#join-us'); setIsMobileMenuOpen(false); }}>Join Now</a>
                    </div>
                </div>
            </header>

            <section className="hero" style={{ marginTop: heroMarginTop }}>
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
                        <h1>About Us</h1>
                        <p style={{ whiteSpace: 'pre-line' }}>{config.aboutText}</p>
                    </div>
                    <div className="about-us-image">
                        <img src={config.aboutImage} alt="Kartika.id Team" />
                    </div>
                </div>
            </section>

            <section className="our-missions-section" id="our-missions">
                <div className="container our-missions-content-container">
                    <div className="our-missions-header">
                        <h1>{config.missionsHeading || 'Our Missions'}</h1>
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
                        <h1>{config.programsHeading || 'Our Programes'}</h1>
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
                    <h1 className="section-title">{config.statsGroupTitle || 'Kartika.id First Generation'}</h1>
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
                    <h1 className="section-title">{config.partnersHeading || 'Our Past Partners'}</h1>
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
                    <h1 className="section-title" style={{ whiteSpace: 'pre-line' }}>{config.speakersTitle || 'Our Speakers\nKartika.id First Generation'}</h1>
                    <div className="speaker-image-wrapper">
                        <img src={config.speakersImage} alt="Kartika.id First Generation Speakers" className="speaker-image" />
                    </div>
                </div>
            </section>

            <section className="about-us" id="our-team">
                <div className="container about-us-content-container">
                    <div className="about-us-content">
                        <h1>Our Team</h1>
                        <div className="team-nav">
                            <button className={`team-btn ${teamType === 'coreteam' ? 'active' : ''}`} onClick={() => setTeamType('coreteam')}>Coreteam <img src="/images/Kartika-logo.png" alt="Logo" className="btn-logo" /></button>
                            <button className={`team-btn ${teamType === 'mentors' ? 'active' : ''}`} onClick={() => setTeamType('mentors')}>Mentors <img src="/images/Kartika-logo.png" alt="Logo" className="btn-logo" /></button>
                            <button className={`team-btn ${teamType === 'members' ? 'active' : ''}`} onClick={() => setTeamType('members')}>Members <img src="/images/Kartika-logo.png" alt="Logo" className="btn-logo" /></button>
                        </div>
                        <div className="team-gallery-container">
                            <div id="coreteam-gallery" className={`team-gallery ${teamType === 'coreteam' ? 'active' : ''}`}>
                                <div className="team-member">
                                    <img src={config.coreteamImage} alt="Kartika.id Core Team" />
                                </div>
                            </div>
                            <div id="mentors-gallery" className={`team-gallery ${teamType === 'mentors' ? 'active' : ''}`}>
                                <div className="team-member">
                                    <img src={config.mentorsImage} alt="Kartika.id Mentors" />
                                </div>
                            </div>
                            <div id="members-gallery" className={`team-gallery ${teamType === 'members' ? 'active' : ''}`}>
                                <div className="team-member">
                                    <img src={config.membersImage} alt="Kartika.id Members" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="about-us" id="testimonials">
                <div className="container about-us-content-container">
                    <div className="about-us-content">
                        <h1>{config.testimonialsHeading || 'What they say about us'}</h1>
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

            <section className="poster-section">
                <div className="poster-content-container">
                    <div className="poster-left">
                        <a href={config.posterLink} target="_blank" rel="noreferrer">
                            <img src={config.posterLeftImage} alt="Poster Left" />
                        </a>
                    </div>
                    <div className="poster-right">
                        <a href={config.posterLink} target="_blank" rel="noreferrer">
                            <img src={config.posterRightImage} alt="Poster Content Right" />
                        </a>
                    </div>
                </div>
            </section>
            <section className="join-us-section" id="join-us" style={{ position: 'relative', zIndex: 1000 }}>
                <div className="container join-us-content-container">
                    <div className="join-us-image-wrapper">
                        <img src="/images/Frame 8.webp" alt="Join With Us" />
                        <a href={config.joinLink} target="_blank" rel="noreferrer" className="join-us-text" style={{ textDecoration: 'none' }}>{config.joinSectionTitle || 'Join With us'}</a>
                    </div>
                </div>
            </section>

            <footer style={{ position: 'relative', zIndex: 1000 }}>
                <div className="container">
                    <div className="footer-content">
                        <div className="footer-section">
                            <h3>{config.footerConnectTitle || 'Connect With Us'}</h3>
                            <div className="footer-links-row">
                                {config.instagramLink && <a href={config.instagramLink} target="_blank" rel="noreferrer"><i className="fab fa-instagram"></i> Instagram</a>}
                                {config.linkedinLink && <a href={config.linkedinLink} target="_blank" rel="noreferrer"><i className="fab fa-linkedin"></i> LinkedIn</a>}
                                {config.emailAddress && <a href={`mailto:${config.emailAddress}`}><i className="fas fa-envelope"></i> Email: {config.emailAddress}</a>}
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;
