const en = {
  nav: {
    home: 'Home',
    projects: 'Projects',
    contact: 'Contact',
  },
  hero: {
    title: 'Building Modern Software Solutions',
    subtitle:
      'We craft high-performance applications, intelligent trading systems, and AI-powered solutions that drive business growth.',
    cta1: 'View Projects',
    cta2: 'Get in Touch',
  },
  services: {
    heading: 'Our Services',
    subheading:
      'Comprehensive software development services tailored to your business needs.',
    items: [
      {
        title: 'Mobile App Development',
        description:
          'Cross-platform mobile applications built with Flutter and Dart for iOS and Android, integrated with Firebase, REST APIs, and cloud services.',
        techs: ['Flutter', 'Dart', 'Firebase', 'REST APIs'],
        icon: 'Smartphone',
      },
      {
        title: 'Web Development',
        description:
          'Modern, responsive websites and web applications using the latest frontend technologies with pixel-perfect designs and blazing-fast performance.',
        techs: ['HTML', 'CSS', 'JavaScript', 'TailwindCSS'],
        icon: 'Globe',
      },
      {
        title: 'Trading Indicators',
        description:
          'Custom Pine Script indicators for TradingView with Smart Money Concepts and ICT strategies for professional market analysis.',
        techs: ['Pine Script', 'TradingView', 'Smart Money', 'ICT'],
        icon: 'TrendingUp',
      },
      {
        title: 'AI Systems',
        description:
          'Intelligent AI agents, automation workflows, and smart assistants that streamline operations and boost productivity.',
        techs: ['AI Agents', 'Automation', 'Assistants', 'Workflows'],
        icon: 'Brain',
      },
      {
        title: 'Software Maintenance',
        description:
          'Professional bug fixing, performance optimization, code refactoring, and feature enhancement for existing software systems.',
        techs: ['Bug Fixing', 'Optimization', 'Refactoring', 'Enhancement'],
        icon: 'Wrench',
      },
    ],
  },
  stats: {
    heading: 'By the Numbers',
    projects: 'Projects Delivered',
    clients: 'Happy Clients',
    technologies: 'Technologies',
    uptime: 'Uptime Guarantee',
  },
  testimonials: {
    heading: 'What Clients Say',
    subheading: 'Trusted by businesses worldwide.',
    items: [
      {
        name: 'Ahmed Al-Rashid',
        role: 'CEO, TechVentures',
        text: 'Tech4IT delivered an exceptional mobile app that exceeded our expectations. Their attention to detail and commitment to quality is unmatched.',
        avatar: 'AR',
      },
      {
        name: 'Sarah Mitchell',
        role: 'Product Manager, FinFlow',
        text: 'The trading indicators they built for us are incredibly accurate. Their understanding of financial markets combined with technical expertise is remarkable.',
        avatar: 'SM',
      },
      {
        name: 'Omar Hassan',
        role: 'Founder, EduLearn',
        text: 'From concept to deployment, Tech4IT transformed our vision into a polished product. Their professionalism and communication were outstanding.',
        avatar: 'OH',
      },
    ],
  },
  projects: {
    heading: 'Our Portfolio',
    subheading: 'Explore our latest projects and see how we bring ideas to life.',
    searchPlaceholder: 'Search projects...',
    all: 'All',
    viewDetails: 'View Details',
    technologies: 'Technologies',
    featured: 'Featured',
    noProjects: 'No projects found.',
  },
  projectDetail: {
    features: 'Key Features',
    readme: 'Details',
    gallery: 'Gallery',
    backToProjects: 'Back to Projects',
    copyCode: 'Copy',
    copied: 'Copied!',
    tableOfContents: 'Table of Contents',
    source: 'Source',
  },
  contact: {
    heading: 'Get in Touch',
    subheading:
      'Have a project in mind? Let us help you bring it to life.',
    nameLabel: 'Full Name',
    namePlaceholder: 'Your name',
    emailLabel: 'Email Address',
    emailPlaceholder: 'your@email.com',
    projectTypeLabel: 'Project Type',
    projectTypePlaceholder: 'Select project type',
    messageLabel: 'Message',
    messagePlaceholder: 'Tell us about your project...',
    submit: 'Send Message',
    sending: 'Sending...',
    success: 'Message sent successfully!',
    error: 'Failed to send. Please try again.',
    validation: {
      nameRequired: 'Name is required',
      emailRequired: 'Email is required',
      emailInvalid: 'Invalid email address',
      messageRequired: 'Message is required',
      projectTypeRequired: 'Please select a project type',
    },
    projectTypes: [
      'Mobile Application',
      'Web Application',
      'Trading Indicator',
      'AI System',
      'Software Maintenance',
      'Other',
    ],
    whatsapp: 'WhatsApp',
    telegram: 'Telegram',
    emailCard: 'Email Us',
    socialHeading: 'Or reach out directly',
  },
  footer: {
    rights: 'All rights reserved.',
    tagline: 'Building the future of software.',
  },
};

const ar: {
  nav: { home: string; projects: string; contact: string };
  hero: { title: string; subtitle: string; cta1: string; cta2: string };
  services: {
    heading: string;
    subheading: string;
    items: {
      title: string;
      description: string;
      techs: string[];
      icon: string;
    }[];
  };
  stats: { heading: string; projects: string; clients: string; technologies: string; uptime: string };
  testimonials: {
    heading: string;
    subheading: string;
    items: { name: string; role: string; text: string; avatar: string }[];
  };
  projects: {
    heading: string;
    subheading: string;
    searchPlaceholder: string;
    all: string;
    viewDetails: string;
    technologies: string;
    featured: string;
    noProjects: string;
  };
  projectDetail: {
    features: string;
    readme: string;
    gallery: string;
    backToProjects: string;
    copyCode: string;
    copied: string;
    tableOfContents: string;
    source: string;
  };
  contact: {
    heading: string;
    subheading: string;
    nameLabel: string;
    namePlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    projectTypeLabel: string;
    projectTypePlaceholder: string;
    messageLabel: string;
    messagePlaceholder: string;
    submit: string;
    sending: string;
    success: string;
    error: string;
    validation: {
      nameRequired: string;
      emailRequired: string;
      emailInvalid: string;
      messageRequired: string;
      projectTypeRequired: string;
    };
    projectTypes: string[];
    whatsapp: string;
    telegram: string;
    emailCard: string;
    socialHeading: string;
  };
  footer: { rights: string; tagline: string };
} = {
  nav: {
    home: 'الرئيسية',
    projects: 'المشاريع',
    contact: 'تواصل',
  },
  hero: {
    title: 'بناء حلول برمجية حديثة',
    subtitle:
      'نصنع تطبيقات عالية الأداء، وأنظمة تداول ذكية، وحلول مدعومة بالذكاء الاصطناعي تدفع أعمالك نحو النمو.',
    cta1: 'عرض المشاريع',
    cta2: 'تواصل معنا',
  },
  services: {
    heading: 'خدماتنا',
    subheading: 'خدمات تطوير برمجية شاملة مصممة خصيصاً لاحتياجات عملك.',
    items: [
      {
        title: 'تطوير تطبيقات الجوال',
        description:
          'تطبيقات جوال متعددة المنصات مبنية بـ Flutter و Dart لنظامي iOS و Android، متكاملة مع Firebase و REST APIs.',
        techs: ['Flutter', 'Dart', 'Firebase', 'REST APIs'],
        icon: 'Smartphone',
      },
      {
        title: 'تطوير مواقع الويب',
        description:
          'مواقع وتطبيقات ويب حديثة ومتجاوبة باستخدام أحدث التقنيات مع تصميمات دقيقة وأداء فائق السرعة.',
        techs: ['HTML', 'CSS', 'JavaScript', 'TailwindCSS'],
        icon: 'Globe',
      },
      {
        title: 'مؤشرات التداول',
        description:
          'مؤشرات Pine Script مخصصة لـ TradingView مع مفاهيم الأموال الذكية واستراتيجيات ICT.',
        techs: ['Pine Script', 'TradingView', 'Smart Money', 'ICT'],
        icon: 'TrendingUp',
      },
      {
        title: 'أنظمة الذكاء الاصطناعي',
        description:
          'وكلاء ذكاء اصطناعي، أتمتة عمليات، ومساعدين أذكياء لتبسيط العمليات وتعزيز الإنتاجية.',
        techs: ['AI Agents', 'Automation', 'Assistants', 'Workflows'],
        icon: 'Brain',
      },
      {
        title: 'صيانة البرمجيات',
        description:
          'إصلاح الأخطاء، تحسين الأداء، إعادة هيكلة الكود، وتطوير الميزات للأنظمة البرمجية الحالية.',
        techs: ['Bug Fixing', 'Optimization', 'Refactoring', 'Enhancement'],
        icon: 'Wrench',
      },
    ],
  },
  stats: {
    heading: 'بالأرقام',
    projects: 'مشروع منجز',
    clients: 'عميل سعيد',
    technologies: 'تقنية مستخدمة',
    uptime: 'ضمان التشغيل',
  },
  testimonials: {
    heading: 'ماذا يقول عملاؤنا',
    subheading: 'موثوق من قبل الشركات حول العالم.',
    items: [
      {
        name: 'أحمد الراشد',
        role: 'مدير تنفيذي، TechVentures',
        text: 'Tech4IT قدموا تطبيق جوال استثنائي تجاوز توقعاتنا. اهتمامهم بالتفاصيل والالتزام بالجودة لا مثيل له.',
        avatar: 'أر',
      },
      {
        name: 'سارة ميتشل',
        role: 'مديرة منتجات، FinFlow',
        text: 'مؤشرات التداول التي بنوها لنا دقيقة للغاية. فهمهم للأسواق المالية مقترن بالخبرة التقنية مذهل.',
        avatar: 'سم',
      },
      {
        name: 'عمر حسن',
        role: 'مؤسس، EduLearn',
        text: 'من الفكرة إلى النشر، حوّل Tech4IT رؤيتنا إلى منتج متقن. احترافيتهم وتواصلهم كانا رائعين.',
        avatar: 'عح',
      },
    ],
  },
  projects: {
    heading: 'معرض أعمالنا',
    subheading: 'استكشف أحدث مشاريعنا وشاهد كيف نحوّل الأفكار واقعاً.',
    searchPlaceholder: 'ابحث في المشاريع...',
    all: 'الكل',
    viewDetails: 'عرض التفاصيل',
    technologies: 'التقنيات',
    featured: 'مميز',
    noProjects: 'لا توجد مشاريع.',
  },
  projectDetail: {
    features: 'المميزات',
    readme: 'التفاصيل',
    gallery: 'المعرض',
    backToProjects: 'العودة للمشاريع',
    copyCode: 'نسخ',
    copied: 'تم النسخ!',
    tableOfContents: 'جدول المحتويات',
    source: 'المصدر',
  },
  contact: {
    heading: 'تواصل معنا',
    subheading: 'هل لديك مشروع؟ دعنا نساعدك في تحويله واقعاً.',
    nameLabel: 'الاسم الكامل',
    namePlaceholder: 'اسمك',
    emailLabel: 'البريد الإلكتروني',
    emailPlaceholder: 'your@email.com',
    projectTypeLabel: 'نوع المشروع',
    projectTypePlaceholder: 'اختر نوع المشروع',
    messageLabel: 'الرسالة',
    messagePlaceholder: 'أخبرنا عن مشروعك...',
    submit: 'إرسال الرسالة',
    sending: 'جاري الإرسال...',
    success: 'تم إرسال الرسالة بنجاح!',
    error: 'فشل الإرسال. يرجى المحاولة مرة أخرى.',
    validation: {
      nameRequired: 'الاسم مطلوب',
      emailRequired: 'البريد الإلكتروني مطلوب',
      emailInvalid: 'عنوان بريد إلكتروني غير صالح',
      messageRequired: 'الرسالة مطلوبة',
      projectTypeRequired: 'يرجى اختيار نوع المشروع',
    },
    projectTypes: [
      'تطبيق جوال',
      'تطبيق ويب',
      'مؤشر تداول',
      'نظام ذكاء اصطناعي',
      'صيانة برمجيات',
      'أخرى',
    ],
    whatsapp: 'واتساب',
    telegram: 'تيليجرام',
    emailCard: 'راسلنا',
    socialHeading: 'أو تواصل مباشرة',
  },
  footer: {
    rights: 'جميع الحقوق محفوظة.',
    tagline: 'نبني مستقبل البرمجيات.',
  },
};

export type Translations = typeof en;
export const translations: Record<'en' | 'ar', Translations> = { en, ar };
