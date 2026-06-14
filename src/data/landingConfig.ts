export interface LandingConfig {
    // Navbar
    navLogoText: string;
    // Hero
    heroTitle: string;
    heroSubtitle: string;
    heroImage: string;
    // About
    aboutText: string;
    aboutImage: string;
    // Missions
    missionsHeading: string;
    missions: { id: string; title: string; desc: string }[];
    // Programs
    programsHeading: string;
    programs: { id: string; title: string; subtitle: string; desc: string }[];
    // Stats
    statsGroupTitle: string;
    stats: { 
        events: string; eventsLabel: string; 
        students: string; studentsLabel: string; 
        satisfaction: string; satisfactionLabel: string; 
    };
    // Partners
    partnersHeading: string;
    partners: { id: string; logo: string; alt: string; description: string }[];
    // Speakers / Team
    speakersTitle: string;
    speakersImage: string;
    coreteamImage: string;
    mentorsImage: string;
    membersImage: string;
    // Testimonials
    testimonialsHeading: string;
    testimonials: { id: string; name: string; role: string; text: string }[];
    // Posters & CTAs
    posterLeftImage: string;
    posterRightImage: string;
    posterLink: string;
    joinSectionTitle: string;
    joinLink: string;
    // Footer / Contact
    footerConnectTitle: string;
    instagramLink: string;
    linkedinLink: string;
    emailAddress: string;
}

export const defaultLandingConfig: LandingConfig = {
  "navLogoText": "Kartini Teknik Berdayas",
  "heroTitle": "Empowering Future Female Engineers",
  "heroSubtitle": "From Eastern Indonesia to the Nation",
  "heroImage": "/images/kartika sect-1.webp",
  "aboutText": "Kartika.id is a community initiative founded by Ugi Fitri Syawalyani, an Industrial Engineering student at Universitas Hasanuddin and an alumna of the Young Leaders for Indonesia program by McKinsey & Co. Our mission is to empower female engineering students—starting from Eastern Indonesia and now expanding nationwide. We aim to bridge the gap in support, opportunity, and access to networks through mentoring programs, career-sharing sessions, and inclusive community building. Kartika.id helps female engineering students navigate career paths in engineering, break stereotypes, and grow both professionally and personally.",
  "aboutImage": "/images/potrait-right.png",
  "missionsHeading": "Our Missions",
  "missions": [
    {
      "id": "women-empowerment",
      "title": "Women Empowerment",
      "desc": "Kartika.id aims to break down barriers and provide female engineering students with tools such as mentorship, sharing session about career, and access to networking industry professionals. This mission focuses on building confidence and skills that will help them thrive in a traditionally male-dominated field."
    },
    {
      "id": "networking",
      "title": "Networking",
      "desc": "Kartika.id facilitates valuable networking opportunities by organizing events and creating platforms where female engineering students can connect with women worker in industry professionals, alumni, and peers, fostering a supportive community that encourages collaboration and career advancement"
    },
    {
      "id": "development",
      "title": "Development",
      "desc": "Kartika.id focuses on the holistic development of its members by offering comprehensive programs. Including mentorship, skill-building workshops, and career development sessions tailored to help female engineering students grow professionally and personally."
    }
  ],
  "programsHeading": "Our Programs",
  "programs": [
    {
      "id": "kartishare",
      "title": "Kartishare",
      "subtitle": "Career Sharing Sessions",
      "desc": "Kartishare is a key program under Kartika.id, where women experts from various engineering fields share their experiences and insights. The goal is to inspire and inform students about career opportunities in engineering."
    },
    {
      "id": "kartiship",
      "title": "Kartiship",
      "subtitle": "Mentorship Program",
      "desc": "Kartiship is Kartika.id's exclusive mentorship initiative, matching participants with mentors whose backgrounds align with their engineering interests. The program provides guidance, career insights, and support for navigating challenges in male-dominated industries."
    },
    {
      "id": "kartinection",
      "title": "Kartinection",
      "subtitle": "Networking Platform",
      "desc": "Kartinection is a Kartika.id program focused on networking for female engineering students. It helps students connect with professionals, alumni, and peers to expand their networks and gain industry insights."
    }
  ],
  "statsGroupTitle": "Kartika.id First Generation",
  "stats": {
    "events": "15+",
    "eventsLabel": "Events (Kartishare, Kartinection and Kartiship)",
    "students": "75+",
    "studentsLabel": "Female Engineering Students Involved",
    "satisfaction": "4.8/5",
    "satisfactionLabel": "Overall Satisfaction"
  },
  "testimonialsHeading": "What they say about us",
  "testimonials": [
    {
      "id": "1",
      "name": "Ira Irawan",
      "role": "Electrical Engineering | Universitas Hasanuddin",
      "text": "Program pada Kartika banyak memberi dampak positif untuk kami mahasiswa teknik, khususnya perempuan. Yang di mana wanita harus punya percaya diri untuk melanjutkan karir kedepannya walaupun di teknik kadang yang terkenal dengan banyaknya laki-laki yang mendominasi"
    },
    {
      "id": "2",
      "name": "A. Safinah",
      "role": "Mining Engineering | Universitas Hasanuddin",
      "text": "Selama menjadi member kartika aku ga pernah merasa kurang sama sekali terkait setiap kegiatan yang dilakuin oleh Kartika. Aku sangat berterima kasih kepada Kak Ugi udah ciptain Kartika dan nerima aku, yang buat aku bener-bener ngerasain manfaat dari kartika"
    },
    {
      "id": "3",
      "name": "Dwi Friandini",
      "role": "Industrial Engineering | Institut Pertanian Bogor",
      "text": "Selama program Kartika.id berlangsung saya menyukai sesi sharing karena bersifat sangat terbuka dan saya bisa bertanya secara puas untuk berbagi pengalaman yang belum pernah saya rasakan"
    },
    {
      "id": "4",
      "name": "Nadifah Amalia",
      "role": "Industrial Engineering | Universitas Hasanuddin",
      "text": "Speakernya selalu keren ketceh badaii,, bagus polll⭐️⭐️⭐️⭐️⭐️"
    },
    {
      "id": "5",
      "name": "Loretha",
      "role": "Environmental Engineering | Universitas Hasanuddin",
      "text": "Glad to be part of Kartika.id! so far Kartika.id memberikan saya kesempatan (kartinection, kartishare, and kartiship) untuk bertemu orang-orang hebat, sharing, dan mengambil ilmu serta pembelajaran diluar bidang ilmu saya. Kesempatan luar biasa bisa memperluas koneksi sesama woman enginner. Thank you so much Kartika.id, semoga bisa terus berkembang menjadi satu komunitas yang mewadahi woman engineer in Indonesia."
    },
    {
      "id": "6",
      "name": "Salsabila Zulmi",
      "role": "Civil Engineering | Sungkyunkwan University",
      "text": "Kartika.id membantu saya untuk bisa bertemu dengan mentors, speakers, dan teman-teman yang memiliki visi yang sejalan dan mempunyai semangat yang sama besarnya dengan saya, walau saya sedang menempuh studi di negara lain tapi saya merasa tantangan yang dihadapi tetaplah sama."
    }
  ],
  "partnersHeading": "Our Past Partners",
  "partners": [
    {
      "id": "p1",
      "logo": "/images/unilever-logo.png",
      "alt": "Unilever Logo",
      "description": "Kartishare x Inspiring Unileader"
    },
    {
      "id": "p2",
      "logo": "/images/SWE-JKT-Logo.png",
      "alt": "SWE Jakarta Logo",
      "description": "Kartishare x Society of Women Engineers"
    },
    {
      "id": "p3",
      "logo": "/images/aapg-logo.png",
      "alt": "AAPG Logo",
      "description": "Kartishare with AAPG Indonesia"
    }
  ],
  "speakersTitle": "Our Speakers\nKartika.id First Generation",
  "speakersImage": "/images/asset speaker first gen.webp",
  "coreteamImage": "/images/asset coreteam.webp",
  "mentorsImage": "/images/asset mentor 2nd.webp",
  "membersImage": "/images/asset member first gen.webp",
  "posterLeftImage": "/images/poster left.webp",
  "posterRightImage": "/images/poster-content-right.png",
  "posterLink": "http://saraswatifellowship.com/",
  "joinSectionTitle": "Join With us",
  "joinLink": "https://forms.gle/UFg49LSrEJRQmVy9/",
  "footerConnectTitle": "Connect With Us",
  "instagramLink": "https://www.instagram.com/kartikaidn/",
  "linkedinLink": "https://www.linkedin.com/company/kartika-id",
  "emailAddress": "kartiniteknikberdaya@gmail.com"
};

export const getLandingConfig = (): LandingConfig => {
    try {
        const stored = localStorage.getItem('kartika_landing_config');
        if (stored) {
            return { ...defaultLandingConfig, ...JSON.parse(stored) };
        }
    } catch (e) {
        console.error('Error parsing landing config:', e);
    }
    return defaultLandingConfig;
};

export const saveLandingConfig = (config: LandingConfig) => {
    localStorage.setItem('kartika_landing_config', JSON.stringify(config));
};

export const getLandingDraft = (): LandingConfig => {
    try {
        const stored = localStorage.getItem('kartika_landing_draft');
        if (stored) {
            return { ...defaultLandingConfig, ...JSON.parse(stored) };
        }
    } catch (e) {
        console.error('Error parsing landing draft:', e);
    }
    // Fall back to live config if no draft exists
    return getLandingConfig();
};

export const saveLandingDraft = (config: LandingConfig) => {
    localStorage.setItem('kartika_landing_draft', JSON.stringify(config));
};
