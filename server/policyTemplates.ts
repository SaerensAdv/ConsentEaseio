/**
 * Policy Templates for Privacy and Cookie Policy Generators
 * 
 * This module provides comprehensive templates for generating legally-compliant
 * privacy policies and cookie policies supporting GDPR, CCPA, and LGPD jurisdictions.
 */

// ============================================================================
// INTERFACES
// ============================================================================

export interface PolicyTemplateContext {
  businessName: string;
  businessAddress?: string;
  businessCountry?: string;
  businessEmail: string;
  businessPhone?: string;
  businessWebsite?: string;
  vatNumber?: string;
  dpoName?: string;
  dpoEmail?: string;
  dataCollected: string[];
  dataUsagePurposes: string[];
  thirdPartyServices: string[];
  dataRetentionPeriod?: string;
  allowsDataExport: boolean;
  allowsDataDeletion: boolean;
  hasMinors: boolean;
  sellsData: boolean;
  jurisdiction: 'gdpr' | 'ccpa' | 'lgpd' | 'all';
  language: string;
  lastUpdated: string;
  cookies?: Array<{
    name: string;
    provider?: string;
    purpose: string;
    expiry?: string;
    type: string;
    category: string;
  }>;
  cookieCategories?: Array<{
    name: string;
    displayName: string;
    description: string;
    isRequired: boolean;
  }>;
}

type SupportedLanguage = 'en' | 'nl' | 'fr' | 'de' | 'es' | 'it' | 'pt' | 'pl';

interface TranslationMap {
  [key: string]: Record<SupportedLanguage, string>;
}

// ============================================================================
// DATA TYPES MAPPING
// ============================================================================

export const DATA_TYPES: Record<string, Record<SupportedLanguage, string>> = {
  email: {
    en: 'Email address',
    nl: 'E-mailadres',
    fr: 'Adresse email',
    de: 'E-Mail-Adresse',
    es: 'Dirección de correo electrónico',
    it: 'Indirizzo email',
    pt: 'Endereço de email',
    pl: 'Adres e-mail'
  },
  name: {
    en: 'Full name',
    nl: 'Volledige naam',
    fr: 'Nom complet',
    de: 'Vollständiger Name',
    es: 'Nombre completo',
    it: 'Nome completo',
    pt: 'Nome completo',
    pl: 'Imię i nazwisko'
  },
  phone: {
    en: 'Phone number',
    nl: 'Telefoonnummer',
    fr: 'Numéro de téléphone',
    de: 'Telefonnummer',
    es: 'Número de teléfono',
    it: 'Numero di telefono',
    pt: 'Número de telefone',
    pl: 'Numer telefonu'
  },
  address: {
    en: 'Physical address',
    nl: 'Fysiek adres',
    fr: 'Adresse physique',
    de: 'Physische Adresse',
    es: 'Dirección física',
    it: 'Indirizzo fisico',
    pt: 'Endereço físico',
    pl: 'Adres fizyczny'
  },
  payment: {
    en: 'Payment information',
    nl: 'Betalingsgegevens',
    fr: 'Informations de paiement',
    de: 'Zahlungsinformationen',
    es: 'Información de pago',
    it: 'Informazioni di pagamento',
    pt: 'Informações de pagamento',
    pl: 'Informacje o płatności'
  },
  location: {
    en: 'Location data',
    nl: 'Locatiegegevens',
    fr: 'Données de localisation',
    de: 'Standortdaten',
    es: 'Datos de ubicación',
    it: 'Dati di posizione',
    pt: 'Dados de localização',
    pl: 'Dane lokalizacyjne'
  },
  ip_address: {
    en: 'IP address',
    nl: 'IP-adres',
    fr: 'Adresse IP',
    de: 'IP-Adresse',
    es: 'Dirección IP',
    it: 'Indirizzo IP',
    pt: 'Endereço IP',
    pl: 'Adres IP'
  },
  device_info: {
    en: 'Device information',
    nl: 'Apparaatinformatie',
    fr: 'Informations sur l\'appareil',
    de: 'Geräteinformationen',
    es: 'Información del dispositivo',
    it: 'Informazioni sul dispositivo',
    pt: 'Informações do dispositivo',
    pl: 'Informacje o urządzeniu'
  },
  browsing_history: {
    en: 'Browsing history',
    nl: 'Browsegeschiedenis',
    fr: 'Historique de navigation',
    de: 'Browserverlauf',
    es: 'Historial de navegación',
    it: 'Cronologia di navigazione',
    pt: 'Histórico de navegação',
    pl: 'Historia przeglądania'
  },
  cookies: {
    en: 'Cookies and tracking data',
    nl: 'Cookies en trackinggegevens',
    fr: 'Cookies et données de suivi',
    de: 'Cookies und Tracking-Daten',
    es: 'Cookies y datos de seguimiento',
    it: 'Cookie e dati di tracciamento',
    pt: 'Cookies e dados de rastreamento',
    pl: 'Pliki cookie i dane śledzenia'
  },
  demographics: {
    en: 'Demographic information (age, gender)',
    nl: 'Demografische informatie (leeftijd, geslacht)',
    fr: 'Informations démographiques (âge, sexe)',
    de: 'Demografische Informationen (Alter, Geschlecht)',
    es: 'Información demográfica (edad, género)',
    it: 'Informazioni demografiche (età, sesso)',
    pt: 'Informações demográficas (idade, gênero)',
    pl: 'Informacje demograficzne (wiek, płeć)'
  },
  preferences: {
    en: 'User preferences and settings',
    nl: 'Gebruikersvoorkeuren en instellingen',
    fr: 'Préférences et paramètres utilisateur',
    de: 'Benutzereinstellungen und Präferenzen',
    es: 'Preferencias y configuración del usuario',
    it: 'Preferenze e impostazioni utente',
    pt: 'Preferências e configurações do usuário',
    pl: 'Preferencje i ustawienia użytkownika'
  },
  social_profiles: {
    en: 'Social media profiles',
    nl: 'Sociale media profielen',
    fr: 'Profils de réseaux sociaux',
    de: 'Social-Media-Profile',
    es: 'Perfiles de redes sociales',
    it: 'Profili social media',
    pt: 'Perfis de redes sociais',
    pl: 'Profile w mediach społecznościowych'
  },
  purchase_history: {
    en: 'Purchase history',
    nl: 'Aankoopgeschiedenis',
    fr: 'Historique d\'achats',
    de: 'Kaufhistorie',
    es: 'Historial de compras',
    it: 'Cronologia acquisti',
    pt: 'Histórico de compras',
    pl: 'Historia zakupów'
  },
  financial_info: {
    en: 'Financial information',
    nl: 'Financiële informatie',
    fr: 'Informations financières',
    de: 'Finanzinformationen',
    es: 'Información financiera',
    it: 'Informazioni finanziarie',
    pt: 'Informações financeiras',
    pl: 'Informacje finansowe'
  },
  employment_info: {
    en: 'Employment information',
    nl: 'Werkgelegenheidsinformatie',
    fr: 'Informations sur l\'emploi',
    de: 'Beschäftigungsinformationen',
    es: 'Información laboral',
    it: 'Informazioni sull\'impiego',
    pt: 'Informações de emprego',
    pl: 'Informacje o zatrudnieniu'
  },
  biometric: {
    en: 'Biometric data',
    nl: 'Biometrische gegevens',
    fr: 'Données biométriques',
    de: 'Biometrische Daten',
    es: 'Datos biométricos',
    it: 'Dati biometrici',
    pt: 'Dados biométricos',
    pl: 'Dane biometryczne'
  },
  health: {
    en: 'Health information',
    nl: 'Gezondheidsinformatie',
    fr: 'Informations de santé',
    de: 'Gesundheitsinformationen',
    es: 'Información de salud',
    it: 'Informazioni sanitarie',
    pt: 'Informações de saúde',
    pl: 'Informacje zdrowotne'
  }
};

// ============================================================================
// USAGE PURPOSES MAPPING
// ============================================================================

export const USAGE_PURPOSES: Record<string, Record<SupportedLanguage, string>> = {
  service_delivery: {
    en: 'To provide and maintain our services',
    nl: 'Om onze diensten te leveren en te onderhouden',
    fr: 'Pour fournir et maintenir nos services',
    de: 'Um unsere Dienste bereitzustellen und zu pflegen',
    es: 'Para proporcionar y mantener nuestros servicios',
    it: 'Per fornire e mantenere i nostri servizi',
    pt: 'Para fornecer e manter nossos serviços',
    pl: 'Aby świadczyć i utrzymywać nasze usługi'
  },
  account_management: {
    en: 'To manage your account and provide customer support',
    nl: 'Om uw account te beheren en klantenondersteuning te bieden',
    fr: 'Pour gérer votre compte et fournir un support client',
    de: 'Um Ihr Konto zu verwalten und Kundensupport zu bieten',
    es: 'Para gestionar su cuenta y proporcionar soporte al cliente',
    it: 'Per gestire il tuo account e fornire assistenza clienti',
    pt: 'Para gerenciar sua conta e fornecer suporte ao cliente',
    pl: 'Aby zarządzać Twoim kontem i zapewniać obsługę klienta'
  },
  communication: {
    en: 'To communicate with you about updates, promotions, and important information',
    nl: 'Om met u te communiceren over updates, promoties en belangrijke informatie',
    fr: 'Pour communiquer avec vous sur les mises à jour, promotions et informations importantes',
    de: 'Um mit Ihnen über Updates, Werbeaktionen und wichtige Informationen zu kommunizieren',
    es: 'Para comunicarnos con usted sobre actualizaciones, promociones e información importante',
    it: 'Per comunicare con te riguardo aggiornamenti, promozioni e informazioni importanti',
    pt: 'Para nos comunicar com você sobre atualizações, promoções e informações importantes',
    pl: 'Aby komunikować się z Tobą w sprawie aktualizacji, promocji i ważnych informacji'
  },
  marketing: {
    en: 'For marketing and advertising purposes',
    nl: 'Voor marketing- en reclamedoeleinden',
    fr: 'À des fins de marketing et de publicité',
    de: 'Für Marketing- und Werbezwecke',
    es: 'Para fines de marketing y publicidad',
    it: 'Per scopi di marketing e pubblicità',
    pt: 'Para fins de marketing e publicidade',
    pl: 'W celach marketingowych i reklamowych'
  },
  analytics: {
    en: 'To analyze usage patterns and improve our services',
    nl: 'Om gebruikspatronen te analyseren en onze diensten te verbeteren',
    fr: 'Pour analyser les modèles d\'utilisation et améliorer nos services',
    de: 'Um Nutzungsmuster zu analysieren und unsere Dienste zu verbessern',
    es: 'Para analizar patrones de uso y mejorar nuestros servicios',
    it: 'Per analizzare i modelli di utilizzo e migliorare i nostri servizi',
    pt: 'Para analisar padrões de uso e melhorar nossos serviços',
    pl: 'Aby analizować wzorce użytkowania i ulepszać nasze usługi'
  },
  security: {
    en: 'For security purposes and fraud prevention',
    nl: 'Voor beveiligingsdoeleinden en fraudepreventie',
    fr: 'À des fins de sécurité et de prévention de la fraude',
    de: 'Für Sicherheitszwecke und Betrugsprävention',
    es: 'Para fines de seguridad y prevención de fraude',
    it: 'Per scopi di sicurezza e prevenzione delle frodi',
    pt: 'Para fins de segurança e prevenção de fraudes',
    pl: 'W celach bezpieczeństwa i zapobiegania oszustwom'
  },
  legal: {
    en: 'To comply with legal obligations',
    nl: 'Om te voldoen aan wettelijke verplichtingen',
    fr: 'Pour se conformer aux obligations légales',
    de: 'Um rechtlichen Verpflichtungen nachzukommen',
    es: 'Para cumplir con obligaciones legales',
    it: 'Per adempiere agli obblighi legali',
    pt: 'Para cumprir obrigações legais',
    pl: 'Aby spełniać zobowiązania prawne'
  },
  personalization: {
    en: 'To personalize your experience',
    nl: 'Om uw ervaring te personaliseren',
    fr: 'Pour personnaliser votre expérience',
    de: 'Um Ihre Erfahrung zu personalisieren',
    es: 'Para personalizar su experiencia',
    it: 'Per personalizzare la tua esperienza',
    pt: 'Para personalizar sua experiência',
    pl: 'Aby personalizować Twoje doświadczenie'
  },
  research: {
    en: 'For research and development purposes',
    nl: 'Voor onderzoeks- en ontwikkelingsdoeleinden',
    fr: 'À des fins de recherche et développement',
    de: 'Für Forschungs- und Entwicklungszwecke',
    es: 'Para fines de investigación y desarrollo',
    it: 'Per scopi di ricerca e sviluppo',
    pt: 'Para fins de pesquisa e desenvolvimento',
    pl: 'W celach badawczo-rozwojowych'
  },
  transaction_processing: {
    en: 'To process transactions and payments',
    nl: 'Om transacties en betalingen te verwerken',
    fr: 'Pour traiter les transactions et les paiements',
    de: 'Um Transaktionen und Zahlungen zu verarbeiten',
    es: 'Para procesar transacciones y pagos',
    it: 'Per elaborare transazioni e pagamenti',
    pt: 'Para processar transações e pagamentos',
    pl: 'Aby przetwarzać transakcje i płatności'
  }
};

// ============================================================================
// THIRD-PARTY SERVICES
// ============================================================================

export const THIRD_PARTY_SERVICES: Record<string, { name: string; purpose: string; privacy_url: string }> = {
  google_analytics: {
    name: 'Google Analytics',
    purpose: 'Website analytics and traffic analysis',
    privacy_url: 'https://policies.google.com/privacy'
  },
  google_ads: {
    name: 'Google Ads',
    purpose: 'Online advertising and remarketing',
    privacy_url: 'https://policies.google.com/privacy'
  },
  google_tag_manager: {
    name: 'Google Tag Manager',
    purpose: 'Tag management and tracking',
    privacy_url: 'https://policies.google.com/privacy'
  },
  facebook_pixel: {
    name: 'Meta Pixel (Facebook)',
    purpose: 'Advertising, analytics, and remarketing',
    privacy_url: 'https://www.facebook.com/privacy/policy'
  },
  stripe: {
    name: 'Stripe',
    purpose: 'Payment processing',
    privacy_url: 'https://stripe.com/privacy'
  },
  paypal: {
    name: 'PayPal',
    purpose: 'Payment processing',
    privacy_url: 'https://www.paypal.com/webapps/mpp/ua/privacy-full'
  },
  mailchimp: {
    name: 'Mailchimp',
    purpose: 'Email marketing and newsletters',
    privacy_url: 'https://mailchimp.com/legal/privacy/'
  },
  hubspot: {
    name: 'HubSpot',
    purpose: 'CRM, marketing automation, and analytics',
    privacy_url: 'https://legal.hubspot.com/privacy-policy'
  },
  intercom: {
    name: 'Intercom',
    purpose: 'Customer support and messaging',
    privacy_url: 'https://www.intercom.com/legal/privacy'
  },
  hotjar: {
    name: 'Hotjar',
    purpose: 'User behavior analytics and heatmaps',
    privacy_url: 'https://www.hotjar.com/legal/policies/privacy/'
  },
  clarity: {
    name: 'Microsoft Clarity',
    purpose: 'User behavior analytics and session recordings',
    privacy_url: 'https://privacy.microsoft.com/privacystatement'
  },
  zendesk: {
    name: 'Zendesk',
    purpose: 'Customer support and ticketing',
    privacy_url: 'https://www.zendesk.com/company/agreements-and-terms/privacy-notice/'
  },
  salesforce: {
    name: 'Salesforce',
    purpose: 'CRM and customer data management',
    privacy_url: 'https://www.salesforce.com/company/privacy/'
  },
  linkedin: {
    name: 'LinkedIn',
    purpose: 'Professional networking and advertising',
    privacy_url: 'https://www.linkedin.com/legal/privacy-policy'
  },
  twitter: {
    name: 'X (Twitter)',
    purpose: 'Social media integration and advertising',
    privacy_url: 'https://twitter.com/privacy'
  },
  tiktok: {
    name: 'TikTok',
    purpose: 'Social media advertising',
    privacy_url: 'https://www.tiktok.com/legal/privacy-policy'
  },
  pinterest: {
    name: 'Pinterest',
    purpose: 'Social media and advertising',
    privacy_url: 'https://policy.pinterest.com/privacy-policy'
  },
  amazon_advertising: {
    name: 'Amazon Advertising',
    purpose: 'Advertising and remarketing',
    privacy_url: 'https://www.amazon.com/gp/help/customer/display.html?nodeId=GX7NJQ4ZB8MHFRNJ'
  },
  cloudflare: {
    name: 'Cloudflare',
    purpose: 'Content delivery and security',
    privacy_url: 'https://www.cloudflare.com/privacypolicy/'
  },
  aws: {
    name: 'Amazon Web Services',
    purpose: 'Cloud hosting and infrastructure',
    privacy_url: 'https://aws.amazon.com/privacy/'
  },
  sentry: {
    name: 'Sentry',
    purpose: 'Error tracking and monitoring',
    privacy_url: 'https://sentry.io/privacy/'
  },
  segment: {
    name: 'Segment',
    purpose: 'Customer data platform',
    privacy_url: 'https://segment.com/legal/privacy/'
  },
  mixpanel: {
    name: 'Mixpanel',
    purpose: 'Product analytics',
    privacy_url: 'https://mixpanel.com/legal/privacy-policy/'
  },
  amplitude: {
    name: 'Amplitude',
    purpose: 'Product analytics',
    privacy_url: 'https://amplitude.com/privacy'
  },
  crisp: {
    name: 'Crisp',
    purpose: 'Live chat and customer support',
    privacy_url: 'https://crisp.chat/en/privacy/'
  },
  drift: {
    name: 'Drift',
    purpose: 'Conversational marketing and sales',
    privacy_url: 'https://www.drift.com/privacy-policy/'
  },
  recaptcha: {
    name: 'Google reCAPTCHA',
    purpose: 'Spam protection and bot detection',
    privacy_url: 'https://policies.google.com/privacy'
  },
  youtube: {
    name: 'YouTube',
    purpose: 'Video embedding and analytics',
    privacy_url: 'https://policies.google.com/privacy'
  },
  vimeo: {
    name: 'Vimeo',
    purpose: 'Video hosting and embedding',
    privacy_url: 'https://vimeo.com/privacy'
  },
  typeform: {
    name: 'Typeform',
    purpose: 'Online forms and surveys',
    privacy_url: 'https://admin.typeform.com/to/dwk6gt'
  }
};

// ============================================================================
// TRANSLATION STRINGS
// ============================================================================

const TRANSLATIONS: TranslationMap = {
  // Legal disclaimer
  legal_disclaimer: {
    en: 'This policy document was generated using automated tools and is provided for informational purposes only. It does not constitute legal advice. We recommend consulting with a qualified legal professional to ensure compliance with applicable laws and regulations in your jurisdiction.',
    nl: 'Dit beleidsdocument is gegenereerd met behulp van geautomatiseerde tools en wordt alleen voor informatieve doeleinden verstrekt. Het vormt geen juridisch advies. Wij raden aan om een gekwalificeerde juridische professional te raadplegen om naleving van de toepasselijke wet- en regelgeving in uw rechtsgebied te waarborgen.',
    fr: 'Ce document de politique a été généré à l\'aide d\'outils automatisés et est fourni à titre informatif uniquement. Il ne constitue pas un avis juridique. Nous vous recommandons de consulter un professionnel juridique qualifié pour garantir la conformité aux lois et réglementations applicables dans votre juridiction.',
    de: 'Dieses Richtliniendokument wurde mit automatisierten Tools erstellt und dient nur zu Informationszwecken. Es stellt keine Rechtsberatung dar. Wir empfehlen, einen qualifizierten Rechtsexperten zu konsultieren, um die Einhaltung der geltenden Gesetze und Vorschriften in Ihrer Gerichtsbarkeit sicherzustellen.',
    es: 'Este documento de política fue generado utilizando herramientas automatizadas y se proporciona solo con fines informativos. No constituye asesoramiento legal. Recomendamos consultar con un profesional legal calificado para garantizar el cumplimiento de las leyes y regulaciones aplicables en su jurisdicción.',
    it: 'Questo documento di policy è stato generato utilizzando strumenti automatizzati ed è fornito solo a scopo informativo. Non costituisce consulenza legale. Si consiglia di consultare un professionista legale qualificato per garantire la conformità alle leggi e ai regolamenti applicabili nella propria giurisdizione.',
    pt: 'Este documento de política foi gerado usando ferramentas automatizadas e é fornecido apenas para fins informativos. Não constitui aconselhamento jurídico. Recomendamos consultar um profissional jurídico qualificado para garantir a conformidade com as leis e regulamentos aplicáveis em sua jurisdição.',
    pl: 'Ten dokument polityki został wygenerowany przy użyciu zautomatyzowanych narzędzi i jest udostępniany wyłącznie w celach informacyjnych. Nie stanowi porady prawnej. Zalecamy skonsultowanie się z wykwalifikowanym specjalistą prawnym w celu zapewnienia zgodności z obowiązującymi przepisami prawa w Twojej jurysdykcji.'
  },

  // Section headings - Privacy Policy
  privacy_policy_title: {
    en: 'Privacy Policy',
    nl: 'Privacybeleid',
    fr: 'Politique de Confidentialité',
    de: 'Datenschutzerklärung',
    es: 'Política de Privacidad',
    it: 'Informativa sulla Privacy',
    pt: 'Política de Privacidade',
    pl: 'Polityka Prywatności'
  },
  last_updated: {
    en: 'Last updated',
    nl: 'Laatst bijgewerkt',
    fr: 'Dernière mise à jour',
    de: 'Zuletzt aktualisiert',
    es: 'Última actualización',
    it: 'Ultimo aggiornamento',
    pt: 'Última atualização',
    pl: 'Ostatnia aktualizacja'
  },
  introduction: {
    en: 'Introduction',
    nl: 'Inleiding',
    fr: 'Introduction',
    de: 'Einleitung',
    es: 'Introducción',
    it: 'Introduzione',
    pt: 'Introdução',
    pl: 'Wprowadzenie'
  },
  what_data_we_collect: {
    en: 'What Data We Collect',
    nl: 'Welke Gegevens We Verzamelen',
    fr: 'Quelles Données Nous Collectons',
    de: 'Welche Daten Wir Erheben',
    es: 'Qué Datos Recopilamos',
    it: 'Quali Dati Raccogliamo',
    pt: 'Quais Dados Coletamos',
    pl: 'Jakie Dane Zbieramy'
  },
  why_we_collect_data: {
    en: 'Why We Collect Your Data',
    nl: 'Waarom We Uw Gegevens Verzamelen',
    fr: 'Pourquoi Nous Collectons Vos Données',
    de: 'Warum Wir Ihre Daten Erheben',
    es: 'Por Qué Recopilamos Sus Datos',
    it: 'Perché Raccogliamo i Tuoi Dati',
    pt: 'Por Que Coletamos Seus Dados',
    pl: 'Dlaczego Zbieramy Twoje Dane'
  },
  third_party_services: {
    en: 'Third-Party Services',
    nl: 'Diensten van Derden',
    fr: 'Services Tiers',
    de: 'Drittanbieterdienste',
    es: 'Servicios de Terceros',
    it: 'Servizi di Terze Parti',
    pt: 'Serviços de Terceiros',
    pl: 'Usługi Stron Trzecich'
  },
  data_retention: {
    en: 'Data Retention',
    nl: 'Gegevensbewaring',
    fr: 'Conservation des Données',
    de: 'Datenspeicherung',
    es: 'Retención de Datos',
    it: 'Conservazione dei Dati',
    pt: 'Retenção de Dados',
    pl: 'Przechowywanie Danych'
  },
  your_rights: {
    en: 'Your Rights',
    nl: 'Uw Rechten',
    fr: 'Vos Droits',
    de: 'Ihre Rechte',
    es: 'Sus Derechos',
    it: 'I Tuoi Diritti',
    pt: 'Seus Direitos',
    pl: 'Twoje Prawa'
  },
  childrens_privacy: {
    en: 'Children\'s Privacy',
    nl: 'Privacy van Kinderen',
    fr: 'Confidentialité des Enfants',
    de: 'Datenschutz für Kinder',
    es: 'Privacidad de los Niños',
    it: 'Privacy dei Minori',
    pt: 'Privacidade das Crianças',
    pl: 'Prywatność Dzieci'
  },
  policy_changes: {
    en: 'Changes to This Policy',
    nl: 'Wijzigingen in Dit Beleid',
    fr: 'Modifications de Cette Politique',
    de: 'Änderungen Dieser Richtlinie',
    es: 'Cambios en Esta Política',
    it: 'Modifiche a Questa Informativa',
    pt: 'Alterações Nesta Política',
    pl: 'Zmiany w Tej Polityce'
  },
  contact_us: {
    en: 'Contact Us',
    nl: 'Neem Contact Op',
    fr: 'Nous Contacter',
    de: 'Kontaktieren Sie Uns',
    es: 'Contáctenos',
    it: 'Contattaci',
    pt: 'Entre em Contato',
    pl: 'Skontaktuj Się z Nami'
  },

  // Cookie Policy headings
  cookie_policy_title: {
    en: 'Cookie Policy',
    nl: 'Cookiebeleid',
    fr: 'Politique en Matière de Cookies',
    de: 'Cookie-Richtlinie',
    es: 'Política de Cookies',
    it: 'Politica sui Cookie',
    pt: 'Política de Cookies',
    pl: 'Polityka Cookies'
  },
  what_are_cookies: {
    en: 'What Are Cookies',
    nl: 'Wat Zijn Cookies',
    fr: 'Que Sont les Cookies',
    de: 'Was Sind Cookies',
    es: 'Qué Son las Cookies',
    it: 'Cosa Sono i Cookie',
    pt: 'O Que São Cookies',
    pl: 'Czym Są Pliki Cookie'
  },
  how_we_use_cookies: {
    en: 'How We Use Cookies',
    nl: 'Hoe We Cookies Gebruiken',
    fr: 'Comment Nous Utilisons les Cookies',
    de: 'Wie Wir Cookies Verwenden',
    es: 'Cómo Usamos las Cookies',
    it: 'Come Utilizziamo i Cookie',
    pt: 'Como Usamos Cookies',
    pl: 'Jak Używamy Plików Cookie'
  },
  cookie_categories: {
    en: 'Cookie Categories',
    nl: 'Cookie Categorieën',
    fr: 'Catégories de Cookies',
    de: 'Cookie-Kategorien',
    es: 'Categorías de Cookies',
    it: 'Categorie di Cookie',
    pt: 'Categorias de Cookies',
    pl: 'Kategorie Plików Cookie'
  },
  cookies_we_use: {
    en: 'Cookies We Use',
    nl: 'Cookies Die We Gebruiken',
    fr: 'Cookies Que Nous Utilisons',
    de: 'Von Uns Verwendete Cookies',
    es: 'Cookies Que Usamos',
    it: 'Cookie Che Utilizziamo',
    pt: 'Cookies Que Usamos',
    pl: 'Pliki Cookie, Których Używamy'
  },
  managing_cookies: {
    en: 'Managing Cookies',
    nl: 'Cookies Beheren',
    fr: 'Gérer les Cookies',
    de: 'Cookies Verwalten',
    es: 'Gestión de Cookies',
    it: 'Gestione dei Cookie',
    pt: 'Gerenciando Cookies',
    pl: 'Zarządzanie Plikami Cookie'
  },

  // GDPR Rights
  gdpr_right_access: {
    en: 'Right of Access: You have the right to request copies of your personal data.',
    nl: 'Recht op Inzage: U hebt het recht om kopieën van uw persoonsgegevens op te vragen.',
    fr: 'Droit d\'Accès: Vous avez le droit de demander des copies de vos données personnelles.',
    de: 'Auskunftsrecht: Sie haben das Recht, Kopien Ihrer personenbezogenen Daten anzufordern.',
    es: 'Derecho de Acceso: Tiene derecho a solicitar copias de sus datos personales.',
    it: 'Diritto di Accesso: Hai il diritto di richiedere copie dei tuoi dati personali.',
    pt: 'Direito de Acesso: Você tem o direito de solicitar cópias de seus dados pessoais.',
    pl: 'Prawo Dostępu: Masz prawo do żądania kopii swoich danych osobowych.'
  },
  gdpr_right_rectification: {
    en: 'Right to Rectification: You have the right to request that we correct any information you believe is inaccurate or complete information you believe is incomplete.',
    nl: 'Recht op Rectificatie: U hebt het recht om te verzoeken dat wij informatie corrigeren waarvan u denkt dat deze onjuist is of informatie aanvullen waarvan u denkt dat deze onvolledig is.',
    fr: 'Droit de Rectification: Vous avez le droit de demander que nous corrigions toute information que vous estimez inexacte ou que nous complétions toute information que vous estimez incomplète.',
    de: 'Recht auf Berichtigung: Sie haben das Recht zu verlangen, dass wir Informationen berichtigen, die Sie für unrichtig halten, oder Informationen vervollständigen, die Sie für unvollständig halten.',
    es: 'Derecho de Rectificación: Tiene derecho a solicitar que corrijamos cualquier información que considere inexacta o que completemos la información que considere incompleta.',
    it: 'Diritto di Rettifica: Hai il diritto di richiedere che correggiamo qualsiasi informazione che ritieni inesatta o che completiamo le informazioni che ritieni incomplete.',
    pt: 'Direito de Retificação: Você tem o direito de solicitar que corrijamos qualquer informação que você acredite estar incorreta ou complete informações que você acredite estarem incompletas.',
    pl: 'Prawo do Sprostowania: Masz prawo żądać poprawienia informacji, które uważasz za nieprawidłowe, lub uzupełnienia informacji, które uważasz za niekompletne.'
  },
  gdpr_right_erasure: {
    en: 'Right to Erasure: You have the right to request that we erase your personal data, under certain conditions.',
    nl: 'Recht op Verwijdering: U hebt het recht om te verzoeken dat wij uw persoonsgegevens wissen, onder bepaalde voorwaarden.',
    fr: 'Droit à l\'Effacement: Vous avez le droit de demander que nous effacions vos données personnelles, sous certaines conditions.',
    de: 'Recht auf Löschung: Sie haben das Recht zu verlangen, dass wir Ihre personenbezogenen Daten unter bestimmten Bedingungen löschen.',
    es: 'Derecho de Supresión: Tiene derecho a solicitar que eliminemos sus datos personales, bajo ciertas condiciones.',
    it: 'Diritto alla Cancellazione: Hai il diritto di richiedere che cancelliamo i tuoi dati personali, a determinate condizioni.',
    pt: 'Direito ao Apagamento: Você tem o direito de solicitar que apaguemos seus dados pessoais, sob certas condições.',
    pl: 'Prawo do Usunięcia: Masz prawo żądać usunięcia swoich danych osobowych pod pewnymi warunkami.'
  },
  gdpr_right_portability: {
    en: 'Right to Data Portability: You have the right to request that we transfer the data we have collected to another organization, or directly to you, under certain conditions.',
    nl: 'Recht op Gegevensoverdraagbaarheid: U hebt het recht om te verzoeken dat wij de gegevens die we hebben verzameld overdragen aan een andere organisatie, of rechtstreeks aan u, onder bepaalde voorwaarden.',
    fr: 'Droit à la Portabilité des Données: Vous avez le droit de demander que nous transférions les données que nous avons collectées à une autre organisation, ou directement à vous, sous certaines conditions.',
    de: 'Recht auf Datenübertragbarkeit: Sie haben das Recht zu verlangen, dass wir die von uns erhobenen Daten unter bestimmten Bedingungen an eine andere Organisation oder direkt an Sie übertragen.',
    es: 'Derecho a la Portabilidad de Datos: Tiene derecho a solicitar que transfiramos los datos que hemos recopilado a otra organización, o directamente a usted, bajo ciertas condiciones.',
    it: 'Diritto alla Portabilità dei Dati: Hai il diritto di richiedere che trasferiamo i dati che abbiamo raccolto a un\'altra organizzazione, o direttamente a te, a determinate condizioni.',
    pt: 'Direito à Portabilidade de Dados: Você tem o direito de solicitar que transfiramos os dados que coletamos para outra organização, ou diretamente para você, sob certas condições.',
    pl: 'Prawo do Przenoszenia Danych: Masz prawo żądać przekazania zebranych przez nas danych do innej organizacji lub bezpośrednio do Ciebie, pod pewnymi warunkami.'
  },
  gdpr_right_object: {
    en: 'Right to Object: You have the right to object to our processing of your personal data, under certain conditions.',
    nl: 'Recht van Bezwaar: U hebt het recht om bezwaar te maken tegen onze verwerking van uw persoonsgegevens, onder bepaalde voorwaarden.',
    fr: 'Droit d\'Opposition: Vous avez le droit de vous opposer au traitement de vos données personnelles, sous certaines conditions.',
    de: 'Widerspruchsrecht: Sie haben das Recht, der Verarbeitung Ihrer personenbezogenen Daten unter bestimmten Bedingungen zu widersprechen.',
    es: 'Derecho de Oposición: Tiene derecho a oponerse al tratamiento de sus datos personales, bajo ciertas condiciones.',
    it: 'Diritto di Opposizione: Hai il diritto di opporti al trattamento dei tuoi dati personali, a determinate condizioni.',
    pt: 'Direito de Oposição: Você tem o direito de se opor ao processamento de seus dados pessoais, sob certas condições.',
    pl: 'Prawo do Sprzeciwu: Masz prawo sprzeciwić się przetwarzaniu swoich danych osobowych pod pewnymi warunkami.'
  },
  gdpr_right_restrict: {
    en: 'Right to Restrict Processing: You have the right to request that we restrict the processing of your personal data, under certain conditions.',
    nl: 'Recht op Beperking van Verwerking: U hebt het recht om te verzoeken dat wij de verwerking van uw persoonsgegevens beperken, onder bepaalde voorwaarden.',
    fr: 'Droit à la Limitation du Traitement: Vous avez le droit de demander que nous limitions le traitement de vos données personnelles, sous certaines conditions.',
    de: 'Recht auf Einschränkung der Verarbeitung: Sie haben das Recht zu verlangen, dass wir die Verarbeitung Ihrer personenbezogenen Daten unter bestimmten Bedingungen einschränken.',
    es: 'Derecho a Restringir el Tratamiento: Tiene derecho a solicitar que restrinjamos el tratamiento de sus datos personales, bajo ciertas condiciones.',
    it: 'Diritto di Limitazione del Trattamento: Hai il diritto di richiedere che limitiamo il trattamento dei tuoi dati personali, a determinate condizioni.',
    pt: 'Direito à Restrição de Processamento: Você tem o direito de solicitar que restrinjamos o processamento de seus dados pessoais, sob certas condições.',
    pl: 'Prawo do Ograniczenia Przetwarzania: Masz prawo żądać ograniczenia przetwarzania swoich danych osobowych pod pewnymi warunkami.'
  },

  // CCPA Rights
  ccpa_right_know: {
    en: 'Right to Know: You have the right to request that we disclose what personal information we collect, use, disclose, and sell about you.',
    nl: 'Recht om te Weten: U hebt het recht om te verzoeken dat wij openbaar maken welke persoonlijke informatie wij over u verzamelen, gebruiken, openbaar maken en verkopen.',
    fr: 'Droit de Savoir: Vous avez le droit de demander que nous divulguions quelles informations personnelles nous collectons, utilisons, divulguons et vendons à votre sujet.',
    de: 'Auskunftsrecht: Sie haben das Recht zu verlangen, dass wir offenlegen, welche personenbezogenen Daten wir über Sie erheben, verwenden, offenlegen und verkaufen.',
    es: 'Derecho a Saber: Tiene derecho a solicitar que divulguemos qué información personal recopilamos, usamos, divulgamos y vendemos sobre usted.',
    it: 'Diritto di Sapere: Hai il diritto di richiedere che divulghiamo quali informazioni personali raccogliamo, utilizziamo, divulghiamo e vendiamo su di te.',
    pt: 'Direito de Saber: Você tem o direito de solicitar que divulguemos quais informações pessoais coletamos, usamos, divulgamos e vendemos sobre você.',
    pl: 'Prawo do Wiedzy: Masz prawo żądać ujawnienia, jakie dane osobowe zbieramy, wykorzystujemy, ujawniamy i sprzedajemy na Twój temat.'
  },
  ccpa_right_delete: {
    en: 'Right to Delete: You have the right to request that we delete the personal information we have collected from you, subject to certain exceptions.',
    nl: 'Recht op Verwijdering: U hebt het recht om te verzoeken dat wij de persoonlijke informatie die we van u hebben verzameld verwijderen, behoudens bepaalde uitzonderingen.',
    fr: 'Droit de Suppression: Vous avez le droit de demander que nous supprimions les informations personnelles que nous avons collectées auprès de vous, sous réserve de certaines exceptions.',
    de: 'Recht auf Löschung: Sie haben das Recht zu verlangen, dass wir die personenbezogenen Daten löschen, die wir von Ihnen erhoben haben, vorbehaltlich bestimmter Ausnahmen.',
    es: 'Derecho a Eliminar: Tiene derecho a solicitar que eliminemos la información personal que hemos recopilado de usted, sujeto a ciertas excepciones.',
    it: 'Diritto alla Cancellazione: Hai il diritto di richiedere che eliminiamo le informazioni personali che abbiamo raccolto da te, salvo alcune eccezioni.',
    pt: 'Direito de Exclusão: Você tem o direito de solicitar que excluamos as informações pessoais que coletamos de você, sujeito a certas exceções.',
    pl: 'Prawo do Usunięcia: Masz prawo żądać usunięcia danych osobowych, które od Ciebie zebraliśmy, z zastrzeżeniem pewnych wyjątków.'
  },
  ccpa_right_optout: {
    en: 'Right to Opt-Out: You have the right to opt-out of the sale of your personal information.',
    nl: 'Recht om Af te Melden: U hebt het recht om u af te melden voor de verkoop van uw persoonlijke informatie.',
    fr: 'Droit de Refus: Vous avez le droit de refuser la vente de vos informations personnelles.',
    de: 'Widerspruchsrecht: Sie haben das Recht, dem Verkauf Ihrer personenbezogenen Daten zu widersprechen.',
    es: 'Derecho de Exclusión: Tiene derecho a optar por no participar en la venta de su información personal.',
    it: 'Diritto di Opt-Out: Hai il diritto di rifiutare la vendita delle tue informazioni personali.',
    pt: 'Direito de Opt-Out: Você tem o direito de optar por não participar da venda de suas informações pessoais.',
    pl: 'Prawo do Rezygnacji: Masz prawo zrezygnować ze sprzedaży swoich danych osobowych.'
  },
  ccpa_right_nondiscrimination: {
    en: 'Right to Non-Discrimination: We will not discriminate against you for exercising any of your CCPA rights.',
    nl: 'Recht op Non-Discriminatie: Wij zullen u niet discrimineren voor het uitoefenen van uw CCPA-rechten.',
    fr: 'Droit à la Non-Discrimination: Nous ne vous discriminerons pas pour avoir exercé vos droits CCPA.',
    de: 'Recht auf Nichtdiskriminierung: Wir werden Sie nicht diskriminieren, wenn Sie Ihre CCPA-Rechte ausüben.',
    es: 'Derecho a la No Discriminación: No le discriminaremos por ejercer sus derechos de CCPA.',
    it: 'Diritto alla Non Discriminazione: Non ti discrimineremo per aver esercitato i tuoi diritti CCPA.',
    pt: 'Direito à Não Discriminação: Não discriminaremos você por exercer qualquer um de seus direitos CCPA.',
    pl: 'Prawo do Niedyskryminacji: Nie będziemy Cię dyskryminować za korzystanie z praw wynikających z CCPA.'
  },

  // LGPD Rights
  lgpd_right_confirmation: {
    en: 'Confirmation: You have the right to confirmation of the existence of processing of your data.',
    nl: 'Bevestiging: U hebt het recht op bevestiging van het bestaan van verwerking van uw gegevens.',
    fr: 'Confirmation: Vous avez le droit à la confirmation de l\'existence du traitement de vos données.',
    de: 'Bestätigung: Sie haben das Recht auf Bestätigung der Existenz einer Verarbeitung Ihrer Daten.',
    es: 'Confirmación: Tiene derecho a la confirmación de la existencia del tratamiento de sus datos.',
    it: 'Conferma: Hai il diritto alla conferma dell\'esistenza del trattamento dei tuoi dati.',
    pt: 'Confirmação: Você tem o direito à confirmação da existência de tratamento dos seus dados.',
    pl: 'Potwierdzenie: Masz prawo do potwierdzenia istnienia przetwarzania swoich danych.'
  },
  lgpd_right_access: {
    en: 'Access: You have the right to access your data.',
    nl: 'Toegang: U hebt het recht om toegang te krijgen tot uw gegevens.',
    fr: 'Accès: Vous avez le droit d\'accéder à vos données.',
    de: 'Zugang: Sie haben das Recht auf Zugang zu Ihren Daten.',
    es: 'Acceso: Tiene derecho a acceder a sus datos.',
    it: 'Accesso: Hai il diritto di accedere ai tuoi dati.',
    pt: 'Acesso: Você tem o direito de acesso aos seus dados.',
    pl: 'Dostęp: Masz prawo dostępu do swoich danych.'
  },
  lgpd_right_correction: {
    en: 'Correction: You have the right to correct incomplete, inaccurate, or outdated data.',
    nl: 'Correctie: U hebt het recht om onvolledige, onjuiste of verouderde gegevens te corrigeren.',
    fr: 'Correction: Vous avez le droit de corriger les données incomplètes, inexactes ou obsolètes.',
    de: 'Berichtigung: Sie haben das Recht, unvollständige, ungenaue oder veraltete Daten zu berichtigen.',
    es: 'Corrección: Tiene derecho a corregir datos incompletos, inexactos o desactualizados.',
    it: 'Correzione: Hai il diritto di correggere dati incompleti, inesatti o obsoleti.',
    pt: 'Correção: Você tem o direito de correção de dados incompletos, inexatos ou desatualizados.',
    pl: 'Korekta: Masz prawo do korekty niekompletnych, niedokładnych lub nieaktualnych danych.'
  },
  lgpd_right_anonymization: {
    en: 'Anonymization: You have the right to anonymization, blocking, or elimination of unnecessary or excessive data.',
    nl: 'Anonimisering: U hebt het recht op anonimisering, blokkering of verwijdering van onnodige of overmatige gegevens.',
    fr: 'Anonymisation: Vous avez le droit à l\'anonymisation, au blocage ou à l\'élimination des données inutiles ou excessives.',
    de: 'Anonymisierung: Sie haben das Recht auf Anonymisierung, Sperrung oder Löschung unnötiger oder übermäßiger Daten.',
    es: 'Anonimización: Tiene derecho a la anonimización, bloqueo o eliminación de datos innecesarios o excesivos.',
    it: 'Anonimizzazione: Hai il diritto all\'anonimizzazione, blocco o eliminazione di dati non necessari o eccessivi.',
    pt: 'Anonimização: Você tem o direito à anonimização, bloqueio ou eliminação de dados desnecessários ou excessivos.',
    pl: 'Anonimizacja: Masz prawo do anonimizacji, zablokowania lub usunięcia niepotrzebnych lub nadmiernych danych.'
  },
  lgpd_right_portability: {
    en: 'Portability: You have the right to data portability to another service or product provider.',
    nl: 'Overdraagbaarheid: U hebt het recht op overdraagbaarheid van gegevens naar een andere dienst- of productaanbieder.',
    fr: 'Portabilité: Vous avez le droit à la portabilité des données vers un autre fournisseur de services ou de produits.',
    de: 'Portabilität: Sie haben das Recht auf Datenübertragbarkeit an einen anderen Dienst- oder Produktanbieter.',
    es: 'Portabilidad: Tiene derecho a la portabilidad de datos a otro proveedor de servicios o productos.',
    it: 'Portabilità: Hai il diritto alla portabilità dei dati a un altro fornitore di servizi o prodotti.',
    pt: 'Portabilidade: Você tem o direito à portabilidade dos dados a outro fornecedor de serviço ou produto.',
    pl: 'Przenośność: Masz prawo do przenoszenia danych do innego dostawcy usług lub produktów.'
  },
  lgpd_right_deletion: {
    en: 'Deletion: You have the right to deletion of personal data processed with your consent.',
    nl: 'Verwijdering: U hebt het recht op verwijdering van persoonsgegevens die met uw toestemming zijn verwerkt.',
    fr: 'Suppression: Vous avez le droit à la suppression des données personnelles traitées avec votre consentement.',
    de: 'Löschung: Sie haben das Recht auf Löschung personenbezogener Daten, die mit Ihrer Einwilligung verarbeitet wurden.',
    es: 'Eliminación: Tiene derecho a la eliminación de datos personales tratados con su consentimiento.',
    it: 'Cancellazione: Hai il diritto alla cancellazione dei dati personali trattati con il tuo consenso.',
    pt: 'Eliminação: Você tem o direito à eliminação dos dados pessoais tratados com o seu consentimento.',
    pl: 'Usunięcie: Masz prawo do usunięcia danych osobowych przetwarzanych za Twoją zgodą.'
  },
  lgpd_right_information: {
    en: 'Information: You have the right to information about public and private entities with which we have shared data.',
    nl: 'Informatie: U hebt het recht op informatie over publieke en private entiteiten waarmee wij gegevens hebben gedeeld.',
    fr: 'Information: Vous avez le droit d\'être informé sur les entités publiques et privées avec lesquelles nous avons partagé des données.',
    de: 'Information: Sie haben das Recht auf Information über öffentliche und private Stellen, mit denen wir Daten geteilt haben.',
    es: 'Información: Tiene derecho a información sobre entidades públicas y privadas con las que hemos compartido datos.',
    it: 'Informazione: Hai il diritto di essere informato sugli enti pubblici e privati con cui abbiamo condiviso i dati.',
    pt: 'Informação: Você tem o direito à informação sobre as entidades públicas e privadas com as quais compartilhamos seus dados.',
    pl: 'Informacja: Masz prawo do informacji o podmiotach publicznych i prywatnych, z którymi udostępniliśmy dane.'
  },
  lgpd_right_revocation: {
    en: 'Revocation: You have the right to revocation of consent at any time.',
    nl: 'Intrekking: U hebt het recht om uw toestemming op elk moment in te trekken.',
    fr: 'Révocation: Vous avez le droit de révoquer votre consentement à tout moment.',
    de: 'Widerruf: Sie haben das Recht, Ihre Einwilligung jederzeit zu widerrufen.',
    es: 'Revocación: Tiene derecho a revocar su consentimiento en cualquier momento.',
    it: 'Revoca: Hai il diritto di revocare il consenso in qualsiasi momento.',
    pt: 'Revogação: Você tem o direito à revogação do consentimento a qualquer momento.',
    pl: 'Odwołanie: Masz prawo do odwołania zgody w dowolnym momencie.'
  },
  lgpd_right_review: {
    en: 'Review: You have the right to review decisions made solely on the basis of automated processing.',
    nl: 'Herziening: U hebt het recht op herziening van beslissingen die uitsluitend op basis van geautomatiseerde verwerking zijn genomen.',
    fr: 'Révision: Vous avez le droit de réviser les décisions prises uniquement sur la base d\'un traitement automatisé.',
    de: 'Überprüfung: Sie haben das Recht auf Überprüfung von Entscheidungen, die ausschließlich auf automatisierter Verarbeitung beruhen.',
    es: 'Revisión: Tiene derecho a revisar las decisiones tomadas únicamente sobre la base del tratamiento automatizado.',
    it: 'Revisione: Hai il diritto di rivedere le decisioni prese esclusivamente sulla base del trattamento automatizzato.',
    pt: 'Revisão: Você tem o direito à revisão de decisões tomadas unicamente com base em tratamento automatizado.',
    pl: 'Przegląd: Masz prawo do przeglądu decyzji podjętych wyłącznie na podstawie zautomatyzowanego przetwarzania.'
  },

  // Common phrases
  we_collect_following_data: {
    en: 'We collect the following types of personal data:',
    nl: 'Wij verzamelen de volgende soorten persoonsgegevens:',
    fr: 'Nous collectons les types de données personnelles suivants:',
    de: 'Wir erheben die folgenden Arten personenbezogener Daten:',
    es: 'Recopilamos los siguientes tipos de datos personales:',
    it: 'Raccogliamo i seguenti tipi di dati personali:',
    pt: 'Coletamos os seguintes tipos de dados pessoais:',
    pl: 'Zbieramy następujące rodzaje danych osobowych:'
  },
  we_use_data_for: {
    en: 'We use your personal data for the following purposes:',
    nl: 'Wij gebruiken uw persoonsgegevens voor de volgende doeleinden:',
    fr: 'Nous utilisons vos données personnelles aux fins suivantes:',
    de: 'Wir verwenden Ihre personenbezogenen Daten zu folgenden Zwecken:',
    es: 'Utilizamos sus datos personales para los siguientes fines:',
    it: 'Utilizziamo i tuoi dati personali per i seguenti scopi:',
    pt: 'Usamos seus dados pessoais para os seguintes fins:',
    pl: 'Używamy Twoich danych osobowych w następujących celach:'
  },
  we_use_third_party_services: {
    en: 'We use the following third-party services that may collect and process your data:',
    nl: 'Wij gebruiken de volgende diensten van derden die uw gegevens kunnen verzamelen en verwerken:',
    fr: 'Nous utilisons les services tiers suivants qui peuvent collecter et traiter vos données:',
    de: 'Wir nutzen die folgenden Drittanbieterdienste, die Ihre Daten erheben und verarbeiten können:',
    es: 'Utilizamos los siguientes servicios de terceros que pueden recopilar y procesar sus datos:',
    it: 'Utilizziamo i seguenti servizi di terze parti che possono raccogliere e trattare i tuoi dati:',
    pt: 'Usamos os seguintes serviços de terceiros que podem coletar e processar seus dados:',
    pl: 'Korzystamy z następujących usług stron trzecich, które mogą zbierać i przetwarzać Twoje dane:'
  },
  data_retention_period: {
    en: 'We retain your personal data for the following period:',
    nl: 'Wij bewaren uw persoonsgegevens gedurende de volgende periode:',
    fr: 'Nous conservons vos données personnelles pendant la période suivante:',
    de: 'Wir speichern Ihre personenbezogenen Daten für den folgenden Zeitraum:',
    es: 'Conservamos sus datos personales durante el siguiente período:',
    it: 'Conserviamo i tuoi dati personali per il seguente periodo:',
    pt: 'Mantemos seus dados pessoais pelo seguinte período:',
    pl: 'Przechowujemy Twoje dane osobowe przez następujący okres:'
  },
  do_not_sell_data: {
    en: 'We do not sell your personal information.',
    nl: 'Wij verkopen uw persoonlijke informatie niet.',
    fr: 'Nous ne vendons pas vos informations personnelles.',
    de: 'Wir verkaufen Ihre personenbezogenen Daten nicht.',
    es: 'No vendemos su información personal.',
    it: 'Non vendiamo le tue informazioni personali.',
    pt: 'Não vendemos suas informações pessoais.',
    pl: 'Nie sprzedajemy Twoich danych osobowych.'
  },
  may_sell_data: {
    en: 'We may sell or share certain personal information as permitted by applicable law. You have the right to opt out of such sales.',
    nl: 'Wij kunnen bepaalde persoonlijke informatie verkopen of delen zoals toegestaan door de toepasselijke wetgeving. U hebt het recht om u af te melden voor dergelijke verkopen.',
    fr: 'Nous pouvons vendre ou partager certaines informations personnelles comme le permet la loi applicable. Vous avez le droit de refuser de telles ventes.',
    de: 'Wir können bestimmte personenbezogene Daten verkaufen oder weitergeben, wie es das geltende Recht erlaubt. Sie haben das Recht, solchen Verkäufen zu widersprechen.',
    es: 'Podemos vender o compartir cierta información personal según lo permita la ley aplicable. Tiene derecho a optar por no participar en dichas ventas.',
    it: 'Potremmo vendere o condividere alcune informazioni personali come consentito dalla legge applicabile. Hai il diritto di rifiutare tali vendite.',
    pt: 'Podemos vender ou compartilhar certas informações pessoais conforme permitido pela lei aplicável. Você tem o direito de optar por não participar de tais vendas.',
    pl: 'Możemy sprzedawać lub udostępniać pewne dane osobowe zgodnie z obowiązującym prawem. Masz prawo zrezygnować z takiej sprzedaży.'
  },
  children_privacy_text: {
    en: 'Our services are not directed to individuals under the age of 16. We do not knowingly collect personal information from children. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.',
    nl: 'Onze diensten zijn niet gericht op personen jonger dan 16 jaar. Wij verzamelen niet bewust persoonlijke informatie van kinderen. Als u een ouder of voogd bent en denkt dat uw kind ons persoonlijke informatie heeft verstrekt, neem dan contact met ons op.',
    fr: 'Nos services ne s\'adressent pas aux personnes de moins de 16 ans. Nous ne collectons pas sciemment d\'informations personnelles auprès d\'enfants. Si vous êtes un parent ou un tuteur et pensez que votre enfant nous a fourni des informations personnelles, veuillez nous contacter.',
    de: 'Unsere Dienste richten sich nicht an Personen unter 16 Jahren. Wir erheben wissentlich keine personenbezogenen Daten von Kindern. Wenn Sie ein Elternteil oder Erziehungsberechtigter sind und glauben, dass Ihr Kind uns personenbezogene Daten zur Verfügung gestellt hat, kontaktieren Sie uns bitte.',
    es: 'Nuestros servicios no están dirigidos a menores de 16 años. No recopilamos intencionalmente información personal de niños. Si usted es padre o tutor y cree que su hijo nos ha proporcionado información personal, contáctenos.',
    it: 'I nostri servizi non sono destinati a persone di età inferiore a 16 anni. Non raccogliamo consapevolmente informazioni personali dai minori. Se sei un genitore o tutore e ritieni che tuo figlio ci abbia fornito informazioni personali, contattaci.',
    pt: 'Nossos serviços não são direcionados a menores de 16 anos. Não coletamos intencionalmente informações pessoais de crianças. Se você é pai ou responsável e acredita que seu filho nos forneceu informações pessoais, entre em contato conosco.',
    pl: 'Nasze usługi nie są skierowane do osób poniżej 16 roku życia. Nie zbieramy świadomie danych osobowych od dzieci. Jeśli jesteś rodzicem lub opiekunem i uważasz, że Twoje dziecko przekazało nam dane osobowe, skontaktuj się z nami.'
  },
  children_privacy_minors_text: {
    en: 'We are aware that our services may be used by individuals under the age of 16. We take special care to protect the privacy of minors and comply with applicable laws regarding children\'s privacy. We obtain verifiable parental consent before collecting personal information from children under 16.',
    nl: 'Wij zijn ons ervan bewust dat onze diensten kunnen worden gebruikt door personen jonger dan 16 jaar. Wij nemen speciale maatregelen om de privacy van minderjarigen te beschermen en voldoen aan de toepasselijke wetgeving inzake de privacy van kinderen. Wij verkrijgen verifieerbare ouderlijke toestemming voordat we persoonlijke informatie verzamelen van kinderen jonger dan 16 jaar.',
    fr: 'Nous savons que nos services peuvent être utilisés par des personnes de moins de 16 ans. Nous prenons des précautions particulières pour protéger la vie privée des mineurs et respectons les lois applicables concernant la vie privée des enfants. Nous obtenons le consentement parental vérifiable avant de collecter des informations personnelles auprès d\'enfants de moins de 16 ans.',
    de: 'Wir sind uns bewusst, dass unsere Dienste von Personen unter 16 Jahren genutzt werden können. Wir achten besonders auf den Schutz der Privatsphäre von Minderjährigen und halten die geltenden Gesetze zum Datenschutz von Kindern ein. Wir holen eine überprüfbare elterliche Einwilligung ein, bevor wir personenbezogene Daten von Kindern unter 16 Jahren erheben.',
    es: 'Somos conscientes de que nuestros servicios pueden ser utilizados por menores de 16 años. Tomamos especial cuidado para proteger la privacidad de los menores y cumplimos con las leyes aplicables sobre la privacidad de los niños. Obtenemos el consentimiento parental verificable antes de recopilar información personal de niños menores de 16 años.',
    it: 'Siamo consapevoli che i nostri servizi possono essere utilizzati da persone di età inferiore a 16 anni. Prestiamo particolare attenzione alla protezione della privacy dei minori e rispettiamo le leggi applicabili sulla privacy dei minori. Otteniamo il consenso parentale verificabile prima di raccogliere informazioni personali da minori di 16 anni.',
    pt: 'Estamos cientes de que nossos serviços podem ser usados por menores de 16 anos. Tomamos cuidado especial para proteger a privacidade de menores e cumprimos as leis aplicáveis sobre privacidade de crianças. Obtemos consentimento parental verificável antes de coletar informações pessoais de crianças menores de 16 anos.',
    pl: 'Jesteśmy świadomi, że z naszych usług mogą korzystać osoby poniżej 16 roku życia. Szczególnie dbamy o ochronę prywatności nieletnich i przestrzegamy obowiązujących przepisów dotyczących prywatności dzieci. Uzyskujemy weryfikowalną zgodę rodziców przed zebraniem danych osobowych od dzieci poniżej 16 roku życia.'
  },
  policy_changes_text: {
    en: 'We may update this policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date. We encourage you to review this policy periodically for any changes.',
    nl: 'Wij kunnen dit beleid van tijd tot tijd bijwerken. Wij zullen u op de hoogte stellen van eventuele wijzigingen door het nieuwe beleid op deze pagina te plaatsen en de datum "Laatst bijgewerkt" bij te werken. Wij moedigen u aan om dit beleid periodiek te bekijken op eventuele wijzigingen.',
    fr: 'Nous pouvons mettre à jour cette politique de temps en temps. Nous vous informerons de tout changement en publiant la nouvelle politique sur cette page et en mettant à jour la date de "Dernière mise à jour". Nous vous encourageons à consulter régulièrement cette politique pour prendre connaissance des éventuelles modifications.',
    de: 'Wir können diese Richtlinie von Zeit zu Zeit aktualisieren. Wir werden Sie über Änderungen informieren, indem wir die neue Richtlinie auf dieser Seite veröffentlichen und das Datum "Zuletzt aktualisiert" aktualisieren. Wir empfehlen Ihnen, diese Richtlinie regelmäßig auf Änderungen zu überprüfen.',
    es: 'Podemos actualizar esta política de vez en cuando. Le notificaremos cualquier cambio publicando la nueva política en esta página y actualizando la fecha de "Última actualización". Le recomendamos que revise esta política periódicamente para ver si hay cambios.',
    it: 'Potremmo aggiornare questa informativa di tanto in tanto. Ti informeremo di eventuali modifiche pubblicando la nuova informativa su questa pagina e aggiornando la data dell\'"Ultimo aggiornamento". Ti invitiamo a consultare periodicamente questa informativa per eventuali modifiche.',
    pt: 'Podemos atualizar esta política de tempos em tempos. Notificaremos você sobre quaisquer alterações publicando a nova política nesta página e atualizando a data de "Última atualização". Encorajamos você a revisar esta política periodicamente para quaisquer alterações.',
    pl: 'Możemy od czasu do czasu aktualizować tę politykę. Poinformujemy Cię o wszelkich zmianach, publikując nową politykę na tej stronie i aktualizując datę "Ostatnia aktualizacja". Zachęcamy do okresowego przeglądania tej polityki w celu sprawdzenia zmian.'
  },
  contact_text: {
    en: 'If you have any questions about this policy or our data practices, please contact us at:',
    nl: 'Als u vragen heeft over dit beleid of onze gegevenspraktijken, neem dan contact met ons op via:',
    fr: 'Si vous avez des questions concernant cette politique ou nos pratiques en matière de données, veuillez nous contacter à:',
    de: 'Wenn Sie Fragen zu dieser Richtlinie oder unseren Datenpraktiken haben, kontaktieren Sie uns bitte unter:',
    es: 'Si tiene alguna pregunta sobre esta política o nuestras prácticas de datos, contáctenos en:',
    it: 'Se hai domande su questa informativa o sulle nostre pratiche relative ai dati, contattaci a:',
    pt: 'Se você tiver alguma dúvida sobre esta política ou nossas práticas de dados, entre em contato conosco em:',
    pl: 'Jeśli masz pytania dotyczące tej polityki lub naszych praktyk dotyczących danych, skontaktuj się z nami pod adresem:'
  },

  // Cookie-specific translations
  cookies_intro_text: {
    en: 'This Cookie Policy explains how we use cookies and similar tracking technologies on our website.',
    nl: 'Dit cookiebeleid legt uit hoe wij cookies en vergelijkbare trackingtechnologieën op onze website gebruiken.',
    fr: 'Cette politique en matière de cookies explique comment nous utilisons les cookies et les technologies de suivi similaires sur notre site web.',
    de: 'Diese Cookie-Richtlinie erklärt, wie wir Cookies und ähnliche Tracking-Technologien auf unserer Website verwenden.',
    es: 'Esta política de cookies explica cómo utilizamos cookies y tecnologías de seguimiento similares en nuestro sitio web.',
    it: 'Questa politica sui cookie spiega come utilizziamo i cookie e tecnologie di tracciamento simili sul nostro sito web.',
    pt: 'Esta política de cookies explica como usamos cookies e tecnologias de rastreamento semelhantes em nosso site.',
    pl: 'Niniejsza polityka plików cookie wyjaśnia, w jaki sposób używamy plików cookie i podobnych technologii śledzenia na naszej stronie internetowej.'
  },
  what_are_cookies_text: {
    en: 'Cookies are small text files that are placed on your device when you visit a website. They are widely used to make websites work more efficiently and to provide information to website owners. Cookies can be "first-party" (set by the website you are visiting) or "third-party" (set by other domains).',
    nl: 'Cookies zijn kleine tekstbestanden die op uw apparaat worden geplaatst wanneer u een website bezoekt. Ze worden veel gebruikt om websites efficiënter te laten werken en om informatie te verstrekken aan website-eigenaren. Cookies kunnen "first-party" zijn (ingesteld door de website die u bezoekt) of "third-party" (ingesteld door andere domeinen).',
    fr: 'Les cookies sont de petits fichiers texte qui sont placés sur votre appareil lorsque vous visitez un site web. Ils sont largement utilisés pour faire fonctionner les sites web plus efficacement et pour fournir des informations aux propriétaires de sites web. Les cookies peuvent être "first-party" (définis par le site web que vous visitez) ou "third-party" (définis par d\'autres domaines).',
    de: 'Cookies sind kleine Textdateien, die auf Ihrem Gerät gespeichert werden, wenn Sie eine Website besuchen. Sie werden häufig verwendet, um Websites effizienter zu gestalten und den Website-Betreibern Informationen zu liefern. Cookies können "Erstanbieter-Cookies" (von der besuchten Website gesetzt) oder "Drittanbieter-Cookies" (von anderen Domains gesetzt) sein.',
    es: 'Las cookies son pequeños archivos de texto que se colocan en su dispositivo cuando visita un sitio web. Se utilizan ampliamente para hacer que los sitios web funcionen de manera más eficiente y para proporcionar información a los propietarios del sitio web. Las cookies pueden ser "propias" (establecidas por el sitio web que está visitando) o "de terceros" (establecidas por otros dominios).',
    it: 'I cookie sono piccoli file di testo che vengono memorizzati sul tuo dispositivo quando visiti un sito web. Sono ampiamente utilizzati per far funzionare i siti web in modo più efficiente e per fornire informazioni ai proprietari dei siti web. I cookie possono essere "di prima parte" (impostati dal sito web che stai visitando) o "di terze parti" (impostati da altri domini).',
    pt: 'Cookies são pequenos arquivos de texto que são colocados em seu dispositivo quando você visita um site. Eles são amplamente usados para fazer os sites funcionarem de forma mais eficiente e para fornecer informações aos proprietários do site. Os cookies podem ser "primários" (definidos pelo site que você está visitando) ou "de terceiros" (definidos por outros domínios).',
    pl: 'Pliki cookie to małe pliki tekstowe umieszczane na Twoim urządzeniu podczas odwiedzania strony internetowej. Są szeroko stosowane, aby strony internetowe działały wydajniej i dostarczały informacji właścicielom stron. Pliki cookie mogą być "pierwszej strony" (ustawione przez odwiedzaną stronę) lub "trzeciej strony" (ustawione przez inne domeny).'
  },
  managing_cookies_text: {
    en: 'You can manage your cookie preferences at any time by clicking the cookie settings button on our website. You can also control cookies through your browser settings. Please note that disabling certain cookies may affect the functionality of our website.',
    nl: 'U kunt uw cookievoorkeuren op elk moment beheren door op de cookie-instellingenknop op onze website te klikken. U kunt cookies ook beheren via uw browserinstellingen. Houd er rekening mee dat het uitschakelen van bepaalde cookies de functionaliteit van onze website kan beïnvloeden.',
    fr: 'Vous pouvez gérer vos préférences en matière de cookies à tout moment en cliquant sur le bouton des paramètres des cookies sur notre site web. Vous pouvez également contrôler les cookies via les paramètres de votre navigateur. Veuillez noter que la désactivation de certains cookies peut affecter le fonctionnement de notre site web.',
    de: 'Sie können Ihre Cookie-Einstellungen jederzeit verwalten, indem Sie auf die Schaltfläche Cookie-Einstellungen auf unserer Website klicken. Sie können Cookies auch über Ihre Browsereinstellungen steuern. Bitte beachten Sie, dass das Deaktivieren bestimmter Cookies die Funktionalität unserer Website beeinträchtigen kann.',
    es: 'Puede gestionar sus preferencias de cookies en cualquier momento haciendo clic en el botón de configuración de cookies en nuestro sitio web. También puede controlar las cookies a través de la configuración de su navegador. Tenga en cuenta que deshabilitar ciertas cookies puede afectar la funcionalidad de nuestro sitio web.',
    it: 'Puoi gestire le tue preferenze sui cookie in qualsiasi momento cliccando sul pulsante delle impostazioni dei cookie sul nostro sito web. Puoi anche controllare i cookie attraverso le impostazioni del tuo browser. Tieni presente che la disabilitazione di alcuni cookie potrebbe influire sulla funzionalità del nostro sito web.',
    pt: 'Você pode gerenciar suas preferências de cookies a qualquer momento clicando no botão de configurações de cookies em nosso site. Você também pode controlar os cookies através das configurações do seu navegador. Observe que desabilitar certos cookies pode afetar a funcionalidade do nosso site.',
    pl: 'Możesz zarządzać swoimi preferencjami dotyczącymi plików cookie w dowolnym momencie, klikając przycisk ustawień plików cookie na naszej stronie. Możesz także kontrolować pliki cookie poprzez ustawienia przeglądarki. Pamiętaj, że wyłączenie niektórych plików cookie może wpłynąć na funkcjonalność naszej strony.'
  },

  // Table headers
  cookie_name: {
    en: 'Cookie Name',
    nl: 'Cookie Naam',
    fr: 'Nom du Cookie',
    de: 'Cookie-Name',
    es: 'Nombre de Cookie',
    it: 'Nome del Cookie',
    pt: 'Nome do Cookie',
    pl: 'Nazwa Pliku Cookie'
  },
  provider: {
    en: 'Provider',
    nl: 'Aanbieder',
    fr: 'Fournisseur',
    de: 'Anbieter',
    es: 'Proveedor',
    it: 'Fornitore',
    pt: 'Provedor',
    pl: 'Dostawca'
  },
  purpose: {
    en: 'Purpose',
    nl: 'Doel',
    fr: 'Finalité',
    de: 'Zweck',
    es: 'Propósito',
    it: 'Scopo',
    pt: 'Finalidade',
    pl: 'Cel'
  },
  expiry: {
    en: 'Expiry',
    nl: 'Vervaldatum',
    fr: 'Expiration',
    de: 'Ablauf',
    es: 'Caducidad',
    it: 'Scadenza',
    pt: 'Expiração',
    pl: 'Wygaśnięcie'
  },
  type: {
    en: 'Type',
    nl: 'Type',
    fr: 'Type',
    de: 'Typ',
    es: 'Tipo',
    it: 'Tipo',
    pt: 'Tipo',
    pl: 'Typ'
  },
  required: {
    en: 'Required',
    nl: 'Vereist',
    fr: 'Requis',
    de: 'Erforderlich',
    es: 'Requerido',
    it: 'Obbligatorio',
    pt: 'Obrigatório',
    pl: 'Wymagane'
  }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function t(key: string, lang: string): string {
  const translation = TRANSLATIONS[key];
  if (!translation) return key;
  return translation[lang as SupportedLanguage] || translation['en'] || key;
}

function getDataTypeLabel(type: string, lang: string): string {
  const dataType = DATA_TYPES[type];
  if (!dataType) return type;
  return dataType[lang as SupportedLanguage] || dataType['en'] || type;
}

function getUsagePurposeLabel(purpose: string, lang: string): string {
  const usagePurpose = USAGE_PURPOSES[purpose];
  if (!usagePurpose) return purpose;
  return usagePurpose[lang as SupportedLanguage] || usagePurpose['en'] || purpose;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ============================================================================
// PRIVACY POLICY GENERATOR
// ============================================================================

export function generatePrivacyPolicy(context: PolicyTemplateContext): { html: string; markdown: string } {
  const lang = context.language || 'en';
  const includeGdpr = context.jurisdiction === 'gdpr' || context.jurisdiction === 'all';
  const includeCcpa = context.jurisdiction === 'ccpa' || context.jurisdiction === 'all';
  const includeLgpd = context.jurisdiction === 'lgpd' || context.jurisdiction === 'all';

  // Build HTML
  let html = `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${t('privacy_policy_title', lang)} - ${escapeHtml(context.businessName)}</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 2rem; color: #1a1a1a; }
    h1 { font-size: 2rem; margin-bottom: 0.5rem; }
    h2 { font-size: 1.5rem; margin-top: 2rem; border-bottom: 1px solid #e5e5e5; padding-bottom: 0.5rem; }
    h3 { font-size: 1.25rem; margin-top: 1.5rem; }
    ul { padding-left: 1.5rem; }
    li { margin-bottom: 0.5rem; }
    .disclaimer { background: #fef3c7; border: 1px solid #f59e0b; padding: 1rem; border-radius: 0.5rem; margin-bottom: 2rem; }
    .disclaimer strong { color: #92400e; }
    .meta { color: #666; font-size: 0.875rem; margin-bottom: 2rem; }
    .contact-info { background: #f5f5f5; padding: 1rem; border-radius: 0.5rem; }
    a { color: #2563eb; }
    table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
    th, td { border: 1px solid #e5e5e5; padding: 0.75rem; text-align: left; }
    th { background: #f9fafb; }
  </style>
</head>
<body>

<div class="disclaimer">
  <strong>Legal Disclaimer:</strong> ${t('legal_disclaimer', lang)}
</div>

<h1 id="title">${t('privacy_policy_title', lang)}</h1>
<p class="meta">${t('last_updated', lang)}: ${context.lastUpdated}</p>

<h2 id="introduction">${t('introduction', lang)}</h2>
<p>${escapeHtml(context.businessName)} ("we", "us", or "our") operates ${context.businessWebsite ? `<a href="${escapeHtml(context.businessWebsite)}">${escapeHtml(context.businessWebsite)}</a>` : 'this website'}. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website.</p>

<h2 id="what-data-we-collect">${t('what_data_we_collect', lang)}</h2>
<p>${t('we_collect_following_data', lang)}</p>
<ul>
${context.dataCollected.map(type => `  <li>${escapeHtml(getDataTypeLabel(type, lang))}</li>`).join('\n')}
</ul>

<h2 id="why-we-collect-data">${t('why_we_collect_data', lang)}</h2>
<p>${t('we_use_data_for', lang)}</p>
<ul>
${context.dataUsagePurposes.map(purpose => `  <li>${escapeHtml(getUsagePurposeLabel(purpose, lang))}</li>`).join('\n')}
</ul>

${context.thirdPartyServices.length > 0 ? `
<h2 id="third-party-services">${t('third_party_services', lang)}</h2>
<p>${t('we_use_third_party_services', lang)}</p>
<table>
  <thead>
    <tr>
      <th>Service</th>
      <th>${t('purpose', lang)}</th>
      <th>Privacy Policy</th>
    </tr>
  </thead>
  <tbody>
${context.thirdPartyServices.map(service => {
  const serviceInfo = THIRD_PARTY_SERVICES[service];
  if (serviceInfo) {
    return `    <tr>
      <td>${escapeHtml(serviceInfo.name)}</td>
      <td>${escapeHtml(serviceInfo.purpose)}</td>
      <td><a href="${escapeHtml(serviceInfo.privacy_url)}" target="_blank" rel="noopener">View Policy</a></td>
    </tr>`;
  }
  return `    <tr>
      <td>${escapeHtml(service)}</td>
      <td>-</td>
      <td>-</td>
    </tr>`;
}).join('\n')}
  </tbody>
</table>
` : ''}

<h2 id="data-retention">${t('data_retention', lang)}</h2>
<p>${t('data_retention_period', lang)} ${context.dataRetentionPeriod || 'as long as necessary to fulfill the purposes outlined in this policy'}.</p>

<h2 id="your-rights">${t('your_rights', lang)}</h2>

${includeGdpr ? `
<h3>Your Rights Under GDPR (European Economic Area)</h3>
<p>If you are a resident of the European Economic Area (EEA), you have certain data protection rights:</p>
<ul>
  <li>${t('gdpr_right_access', lang)}</li>
  <li>${t('gdpr_right_rectification', lang)}</li>
  <li>${t('gdpr_right_erasure', lang)}</li>
  <li>${t('gdpr_right_portability', lang)}</li>
  <li>${t('gdpr_right_object', lang)}</li>
  <li>${t('gdpr_right_restrict', lang)}</li>
</ul>
${context.dpoName ? `<p>Our Data Protection Officer can be reached at: ${escapeHtml(context.dpoName)}${context.dpoEmail ? ` (<a href="mailto:${escapeHtml(context.dpoEmail)}">${escapeHtml(context.dpoEmail)}</a>)` : ''}</p>` : ''}
` : ''}

${includeCcpa ? `
<h3>Your Rights Under CCPA (California)</h3>
<p>If you are a California resident, you have specific rights regarding your personal information:</p>
<ul>
  <li>${t('ccpa_right_know', lang)}</li>
  <li>${t('ccpa_right_delete', lang)}</li>
  <li>${t('ccpa_right_optout', lang)}</li>
  <li>${t('ccpa_right_nondiscrimination', lang)}</li>
</ul>
<p>${context.sellsData ? t('may_sell_data', lang) : t('do_not_sell_data', lang)}</p>
` : ''}

${includeLgpd ? `
<h3>Your Rights Under LGPD (Brazil)</h3>
<p>If you are a resident of Brazil, you have the following rights under the Lei Geral de Proteção de Dados:</p>
<ul>
  <li>${t('lgpd_right_confirmation', lang)}</li>
  <li>${t('lgpd_right_access', lang)}</li>
  <li>${t('lgpd_right_correction', lang)}</li>
  <li>${t('lgpd_right_anonymization', lang)}</li>
  <li>${t('lgpd_right_portability', lang)}</li>
  <li>${t('lgpd_right_deletion', lang)}</li>
  <li>${t('lgpd_right_information', lang)}</li>
  <li>${t('lgpd_right_revocation', lang)}</li>
  <li>${t('lgpd_right_review', lang)}</li>
</ul>
` : ''}

${context.allowsDataExport || context.allowsDataDeletion ? `
<h3>Exercising Your Rights</h3>
<p>To exercise your rights, please contact us using the information provided below. We will respond to your request within the timeframe required by applicable law.</p>
${context.allowsDataExport ? '<p>You can request a copy of your data in a portable format.</p>' : ''}
${context.allowsDataDeletion ? '<p>You can request deletion of your personal data from our systems.</p>' : ''}
` : ''}

<h2 id="childrens-privacy">${t('childrens_privacy', lang)}</h2>
<p>${context.hasMinors ? t('children_privacy_minors_text', lang) : t('children_privacy_text', lang)}</p>

<h2 id="policy-changes">${t('policy_changes', lang)}</h2>
<p>${t('policy_changes_text', lang)}</p>

<h2 id="contact-us">${t('contact_us', lang)}</h2>
<p>${t('contact_text', lang)}</p>
<div class="contact-info">
  <p><strong>${escapeHtml(context.businessName)}</strong></p>
  ${context.businessAddress ? `<p>${escapeHtml(context.businessAddress)}</p>` : ''}
  ${context.businessCountry ? `<p>${escapeHtml(context.businessCountry)}</p>` : ''}
  <p>Email: <a href="mailto:${escapeHtml(context.businessEmail)}">${escapeHtml(context.businessEmail)}</a></p>
  ${context.businessPhone ? `<p>Phone: ${escapeHtml(context.businessPhone)}</p>` : ''}
  ${context.vatNumber ? `<p>VAT Number: ${escapeHtml(context.vatNumber)}</p>` : ''}
</div>

</body>
</html>`;

  // Build Markdown
  let markdown = `# ${t('privacy_policy_title', lang)}

> **Legal Disclaimer:** ${t('legal_disclaimer', lang)}

**${t('last_updated', lang)}:** ${context.lastUpdated}

---

## ${t('introduction', lang)}

${context.businessName} ("we", "us", or "our") operates ${context.businessWebsite || 'this website'}. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website.

## ${t('what_data_we_collect', lang)}

${t('we_collect_following_data', lang)}

${context.dataCollected.map(type => `- ${getDataTypeLabel(type, lang)}`).join('\n')}

## ${t('why_we_collect_data', lang)}

${t('we_use_data_for', lang)}

${context.dataUsagePurposes.map(purpose => `- ${getUsagePurposeLabel(purpose, lang)}`).join('\n')}

${context.thirdPartyServices.length > 0 ? `
## ${t('third_party_services', lang)}

${t('we_use_third_party_services', lang)}

| Service | ${t('purpose', lang)} | Privacy Policy |
|---------|----------|----------------|
${context.thirdPartyServices.map(service => {
  const serviceInfo = THIRD_PARTY_SERVICES[service];
  if (serviceInfo) {
    return `| ${serviceInfo.name} | ${serviceInfo.purpose} | [View Policy](${serviceInfo.privacy_url}) |`;
  }
  return `| ${service} | - | - |`;
}).join('\n')}
` : ''}

## ${t('data_retention', lang)}

${t('data_retention_period', lang)} ${context.dataRetentionPeriod || 'as long as necessary to fulfill the purposes outlined in this policy'}.

## ${t('your_rights', lang)}

${includeGdpr ? `
### Your Rights Under GDPR (European Economic Area)

If you are a resident of the European Economic Area (EEA), you have certain data protection rights:

- ${t('gdpr_right_access', lang)}
- ${t('gdpr_right_rectification', lang)}
- ${t('gdpr_right_erasure', lang)}
- ${t('gdpr_right_portability', lang)}
- ${t('gdpr_right_object', lang)}
- ${t('gdpr_right_restrict', lang)}

${context.dpoName ? `Our Data Protection Officer can be reached at: ${context.dpoName}${context.dpoEmail ? ` (${context.dpoEmail})` : ''}` : ''}
` : ''}

${includeCcpa ? `
### Your Rights Under CCPA (California)

If you are a California resident, you have specific rights regarding your personal information:

- ${t('ccpa_right_know', lang)}
- ${t('ccpa_right_delete', lang)}
- ${t('ccpa_right_optout', lang)}
- ${t('ccpa_right_nondiscrimination', lang)}

${context.sellsData ? t('may_sell_data', lang) : t('do_not_sell_data', lang)}
` : ''}

${includeLgpd ? `
### Your Rights Under LGPD (Brazil)

If you are a resident of Brazil, you have the following rights under the Lei Geral de Proteção de Dados:

- ${t('lgpd_right_confirmation', lang)}
- ${t('lgpd_right_access', lang)}
- ${t('lgpd_right_correction', lang)}
- ${t('lgpd_right_anonymization', lang)}
- ${t('lgpd_right_portability', lang)}
- ${t('lgpd_right_deletion', lang)}
- ${t('lgpd_right_information', lang)}
- ${t('lgpd_right_revocation', lang)}
- ${t('lgpd_right_review', lang)}
` : ''}

${context.allowsDataExport || context.allowsDataDeletion ? `
### Exercising Your Rights

To exercise your rights, please contact us using the information provided below. We will respond to your request within the timeframe required by applicable law.

${context.allowsDataExport ? '- You can request a copy of your data in a portable format.' : ''}
${context.allowsDataDeletion ? '- You can request deletion of your personal data from our systems.' : ''}
` : ''}

## ${t('childrens_privacy', lang)}

${context.hasMinors ? t('children_privacy_minors_text', lang) : t('children_privacy_text', lang)}

## ${t('policy_changes', lang)}

${t('policy_changes_text', lang)}

## ${t('contact_us', lang)}

${t('contact_text', lang)}

**${context.businessName}**
${context.businessAddress ? `${context.businessAddress}  ` : ''}
${context.businessCountry ? `${context.businessCountry}  ` : ''}
Email: ${context.businessEmail}
${context.businessPhone ? `Phone: ${context.businessPhone}  ` : ''}
${context.vatNumber ? `VAT Number: ${context.vatNumber}` : ''}
`;

  return { html, markdown };
}

// ============================================================================
// COOKIE POLICY GENERATOR
// ============================================================================

export function generateCookiePolicy(context: PolicyTemplateContext): { html: string; markdown: string } {
  const lang = context.language || 'en';
  const cookies = context.cookies || [];
  const categories = context.cookieCategories || [];

  // Build HTML
  let html = `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${t('cookie_policy_title', lang)} - ${escapeHtml(context.businessName)}</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 2rem; color: #1a1a1a; }
    h1 { font-size: 2rem; margin-bottom: 0.5rem; }
    h2 { font-size: 1.5rem; margin-top: 2rem; border-bottom: 1px solid #e5e5e5; padding-bottom: 0.5rem; }
    h3 { font-size: 1.25rem; margin-top: 1.5rem; }
    ul { padding-left: 1.5rem; }
    li { margin-bottom: 0.5rem; }
    .disclaimer { background: #fef3c7; border: 1px solid #f59e0b; padding: 1rem; border-radius: 0.5rem; margin-bottom: 2rem; }
    .disclaimer strong { color: #92400e; }
    .meta { color: #666; font-size: 0.875rem; margin-bottom: 2rem; }
    .contact-info { background: #f5f5f5; padding: 1rem; border-radius: 0.5rem; }
    a { color: #2563eb; }
    table { width: 100%; border-collapse: collapse; margin: 1rem 0; font-size: 0.875rem; }
    th, td { border: 1px solid #e5e5e5; padding: 0.75rem; text-align: left; }
    th { background: #f9fafb; font-weight: 600; }
    .category-badge { display: inline-block; padding: 0.25rem 0.5rem; background: #e5e7eb; border-radius: 0.25rem; font-size: 0.75rem; }
    .category-badge.required { background: #fee2e2; color: #991b1b; }
  </style>
</head>
<body>

<div class="disclaimer">
  <strong>Legal Disclaimer:</strong> ${t('legal_disclaimer', lang)}
</div>

<h1 id="title">${t('cookie_policy_title', lang)}</h1>
<p class="meta">${t('last_updated', lang)}: ${context.lastUpdated}</p>

<p>${t('cookies_intro_text', lang)}</p>

<h2 id="what-are-cookies">${t('what_are_cookies', lang)}</h2>
<p>${t('what_are_cookies_text', lang)}</p>

<h2 id="how-we-use-cookies">${t('how_we_use_cookies', lang)}</h2>
<p>We use cookies for various purposes including:</p>
<ul>
  <li><strong>Essential cookies:</strong> Required for the website to function properly</li>
  <li><strong>Functional cookies:</strong> Remember your preferences and settings</li>
  <li><strong>Analytics cookies:</strong> Help us understand how visitors use our website</li>
  <li><strong>Marketing cookies:</strong> Used to deliver relevant advertisements</li>
</ul>

${categories.length > 0 ? `
<h2 id="cookie-categories">${t('cookie_categories', lang)}</h2>
${categories.map(category => `
<h3>${escapeHtml(category.displayName)} ${category.isRequired ? '<span class="category-badge required">Required</span>' : ''}</h3>
<p>${escapeHtml(category.description)}</p>
`).join('\n')}
` : ''}

${cookies.length > 0 ? `
<h2 id="cookies-we-use">${t('cookies_we_use', lang)}</h2>
<table>
  <thead>
    <tr>
      <th>${t('cookie_name', lang)}</th>
      <th>${t('provider', lang)}</th>
      <th>${t('purpose', lang)}</th>
      <th>${t('expiry', lang)}</th>
      <th>${t('type', lang)}</th>
    </tr>
  </thead>
  <tbody>
${cookies.map(cookie => `    <tr>
      <td><code>${escapeHtml(cookie.name)}</code></td>
      <td>${escapeHtml(cookie.provider || '-')}</td>
      <td>${escapeHtml(cookie.purpose)}</td>
      <td>${escapeHtml(cookie.expiry || '-')}</td>
      <td>${escapeHtml(cookie.type)}</td>
    </tr>`).join('\n')}
  </tbody>
</table>
` : ''}

<h2 id="managing-cookies">${t('managing_cookies', lang)}</h2>
<p>${t('managing_cookies_text', lang)}</p>

<h3>Browser Settings</h3>
<p>Most web browsers allow you to control cookies through their settings. Here are links to manage cookies in popular browsers:</p>
<ul>
  <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener">Google Chrome</a></li>
  <li><a href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop" target="_blank" rel="noopener">Mozilla Firefox</a></li>
  <li><a href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac" target="_blank" rel="noopener">Safari</a></li>
  <li><a href="https://support.microsoft.com/en-us/windows/manage-cookies-in-microsoft-edge-view-allow-block-delete-and-use-168dab11-0753-043d-7c16-ede5947fc64d" target="_blank" rel="noopener">Microsoft Edge</a></li>
</ul>

<h2 id="contact-us">${t('contact_us', lang)}</h2>
<p>${t('contact_text', lang)}</p>
<div class="contact-info">
  <p><strong>${escapeHtml(context.businessName)}</strong></p>
  ${context.businessAddress ? `<p>${escapeHtml(context.businessAddress)}</p>` : ''}
  ${context.businessCountry ? `<p>${escapeHtml(context.businessCountry)}</p>` : ''}
  <p>Email: <a href="mailto:${escapeHtml(context.businessEmail)}">${escapeHtml(context.businessEmail)}</a></p>
  ${context.businessPhone ? `<p>Phone: ${escapeHtml(context.businessPhone)}</p>` : ''}
</div>

</body>
</html>`;

  // Build Markdown
  let markdown = `# ${t('cookie_policy_title', lang)}

> **Legal Disclaimer:** ${t('legal_disclaimer', lang)}

**${t('last_updated', lang)}:** ${context.lastUpdated}

---

${t('cookies_intro_text', lang)}

## ${t('what_are_cookies', lang)}

${t('what_are_cookies_text', lang)}

## ${t('how_we_use_cookies', lang)}

We use cookies for various purposes including:

- **Essential cookies:** Required for the website to function properly
- **Functional cookies:** Remember your preferences and settings
- **Analytics cookies:** Help us understand how visitors use our website
- **Marketing cookies:** Used to deliver relevant advertisements

${categories.length > 0 ? `
## ${t('cookie_categories', lang)}

${categories.map(category => `
### ${category.displayName} ${category.isRequired ? '*(Required)*' : ''}

${category.description}
`).join('\n')}
` : ''}

${cookies.length > 0 ? `
## ${t('cookies_we_use', lang)}

| ${t('cookie_name', lang)} | ${t('provider', lang)} | ${t('purpose', lang)} | ${t('expiry', lang)} | ${t('type', lang)} |
|-------------|----------|---------|--------|------|
${cookies.map(cookie => `| \`${cookie.name}\` | ${cookie.provider || '-'} | ${cookie.purpose} | ${cookie.expiry || '-'} | ${cookie.type} |`).join('\n')}
` : ''}

## ${t('managing_cookies', lang)}

${t('managing_cookies_text', lang)}

### Browser Settings

Most web browsers allow you to control cookies through their settings. Here are links to manage cookies in popular browsers:

- [Google Chrome](https://support.google.com/chrome/answer/95647)
- [Mozilla Firefox](https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop)
- [Safari](https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac)
- [Microsoft Edge](https://support.microsoft.com/en-us/windows/manage-cookies-in-microsoft-edge-view-allow-block-delete-and-use-168dab11-0753-043d-7c16-ede5947fc64d)

## ${t('contact_us', lang)}

${t('contact_text', lang)}

**${context.businessName}**
${context.businessAddress ? `${context.businessAddress}  ` : ''}
${context.businessCountry ? `${context.businessCountry}  ` : ''}
Email: ${context.businessEmail}
${context.businessPhone ? `Phone: ${context.businessPhone}` : ''}
`;

  return { html, markdown };
}

// ============================================================================
// ADDITIONAL EXPORTS
// ============================================================================

export { TRANSLATIONS };
export type { SupportedLanguage, TranslationMap };
