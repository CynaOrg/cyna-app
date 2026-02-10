import { Product } from '@core/interfaces/product.interface';

export const MOCK_SERVICES: Product[] = [
  {
    id: '1',
    slug: 'soc-24-7',
    name: 'SOC 24/7',
    shortDescription: 'Centre de surveillance en temps reel',
    description:
      "Notre SOC 24/7 offre une surveillance continue de votre infrastructure par une equipe d'experts en cybersecurite. Detectez et neutralisez les menaces avant qu'elles n'impactent votre activite grace a une analyse en temps reel et des reponses automatisees.",
    productType: 'saas',
    priceMonthly: 299,
    isAvailable: true,
    isFeatured: true,
    primaryImageUrl:
      'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80',
    images: [
      {
        id: 'img-1-1',
        imageUrl:
          'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80',
        altText: 'SOC dashboard overview',
        displayOrder: 0,
        isPrimary: true,
      },
      {
        id: 'img-1-2',
        imageUrl:
          'https://images.unsplash.com/photo-1563986768609-322da13575f2?w=800&q=80',
        altText: 'Security operations center',
        displayOrder: 1,
        isPrimary: false,
      },
      {
        id: 'img-1-3',
        imageUrl:
          'https://images.unsplash.com/photo-1551808525-51a94da548ce?w=800&q=80',
        altText: 'Real-time monitoring',
        displayOrder: 2,
        isPrimary: false,
      },
      {
        id: 'img-1-4',
        imageUrl:
          'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800&q=80',
        altText: 'Threat analysis',
        displayOrder: 3,
        isPrimary: false,
      },
    ],
    categoryName: 'SOC',
  },
  {
    id: '2',
    slug: 'edr-enterprise',
    name: 'EDR Enterprise',
    shortDescription: 'Detection et reponse sur endpoints',
    description:
      "EDR Enterprise protege chaque terminal de votre parc informatique avec une detection comportementale avancee. Identifiez les attaques sophistiquees, isolez les machines compromises et restaurez l'integrite de vos systemes en quelques clics.",
    productType: 'saas',
    priceMonthly: 199,
    isAvailable: true,
    isFeatured: true,
    primaryImageUrl:
      'https://images.unsplash.com/photo-1510511459019-5dda7724fd87?w=800&q=80',
    images: [
      {
        id: 'img-2-1',
        imageUrl:
          'https://images.unsplash.com/photo-1510511459019-5dda7724fd87?w=800&q=80',
        altText: 'Endpoint security',
        displayOrder: 0,
        isPrimary: true,
      },
      {
        id: 'img-2-2',
        imageUrl:
          'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800&q=80',
        altText: 'EDR detection dashboard',
        displayOrder: 1,
        isPrimary: false,
      },
      {
        id: 'img-2-3',
        imageUrl:
          'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80',
        altText: 'Behavioral analysis',
        displayOrder: 2,
        isPrimary: false,
      },
      {
        id: 'img-2-4',
        imageUrl:
          'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&q=80',
        altText: 'Threat response',
        displayOrder: 3,
        isPrimary: false,
      },
      {
        id: 'img-2-5',
        imageUrl:
          'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&q=80',
        altText: 'Endpoint management',
        displayOrder: 4,
        isPrimary: false,
      },
    ],
    categoryName: 'EDR',
  },
  {
    id: '3',
    slug: 'xdr-premium',
    name: 'XDR Premium',
    shortDescription: 'Detection etendue multi-couches',
    description:
      "XDR Premium unifie la detection et la reponse sur l'ensemble de vos couches de securite : endpoints, reseau, cloud et messagerie. Correlez automatiquement les alertes pour une vision complete des incidents et une remediation acceleree.",
    productType: 'saas',
    priceMonthly: 499,
    isAvailable: false,
    isFeatured: true,
    primaryImageUrl:
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80',
    images: [
      {
        id: 'img-3-1',
        imageUrl:
          'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80',
        altText: 'XDR platform',
        displayOrder: 0,
        isPrimary: true,
      },
      {
        id: 'img-3-2',
        imageUrl:
          'https://images.unsplash.com/photo-1562813733-b31f71025d54?w=800&q=80',
        altText: 'Multi-layer detection',
        displayOrder: 1,
        isPrimary: false,
      },
      {
        id: 'img-3-3',
        imageUrl:
          'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=800&q=80',
        altText: 'Correlation engine',
        displayOrder: 2,
        isPrimary: false,
      },
      {
        id: 'img-3-4',
        imageUrl:
          'https://images.unsplash.com/photo-1504384764586-bb4ceeaecf77?w=800&q=80',
        altText: 'Cloud security',
        displayOrder: 3,
        isPrimary: false,
      },
    ],
    categoryName: 'XDR',
  },
  {
    id: '4',
    slug: 'threat-intelligence',
    name: 'Threat Intelligence',
    shortDescription: 'Veille sur les menaces',
    description:
      "Restez informe des dernieres menaces grace a notre plateforme de Threat Intelligence. Flux d'indicateurs de compromission en temps reel, rapports d'analyse et alertes personnalisees pour anticiper les attaques ciblant votre secteur.",
    productType: 'saas',
    priceMonthly: 149,
    isAvailable: true,
    isFeatured: false,
    primaryImageUrl:
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80',
    images: [
      {
        id: 'img-4-1',
        imageUrl:
          'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80',
        altText: 'Threat intelligence feed',
        displayOrder: 0,
        isPrimary: true,
      },
      {
        id: 'img-4-2',
        imageUrl:
          'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&q=80',
        altText: 'Data analysis',
        displayOrder: 1,
        isPrimary: false,
      },
      {
        id: 'img-4-3',
        imageUrl:
          'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80',
        altText: 'Threat reports',
        displayOrder: 2,
        isPrimary: false,
      },
      {
        id: 'img-4-4',
        imageUrl:
          'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800&q=80',
        altText: 'IOC monitoring',
        displayOrder: 3,
        isPrimary: false,
      },
      {
        id: 'img-4-5',
        imageUrl:
          'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
        altText: 'Alert dashboard',
        displayOrder: 4,
        isPrimary: false,
      },
    ],
    categoryName: 'Intelligence',
  },
];

export const MOCK_LICENSES: Product[] = [
  {
    id: '8',
    slug: 'microsoft-365-business',
    name: 'Microsoft 365 Business',
    shortDescription: 'Suite bureautique et collaboration securisee',
    description:
      'Licence Microsoft 365 Business Premium avec protection avancee contre les menaces, gestion des appareils et conformite. Inclut les applications Office, Teams, SharePoint et une securite renforcee pour votre entreprise.',
    productType: 'license',
    priceUnit: 22,
    isAvailable: true,
    isFeatured: true,
    primaryImageUrl:
      'https://images.unsplash.com/photo-1633419461186-7d40a38105ec?w=800&q=80',
    images: [
      {
        id: 'img-8-1',
        imageUrl:
          'https://images.unsplash.com/photo-1633419461186-7d40a38105ec?w=800&q=80',
        altText: 'Microsoft 365',
        displayOrder: 0,
        isPrimary: true,
      },
    ],
    categoryName: 'Licence',
  },
  {
    id: '9',
    slug: 'adobe-creative-cloud',
    name: 'Adobe Creative Cloud',
    shortDescription: 'Suite creative professionnelle',
    description:
      'Licence Adobe Creative Cloud complete avec Photoshop, Illustrator, Premiere Pro et plus de 20 applications. Ideal pour les equipes creatives avec stockage cloud et collaboration en temps reel.',
    productType: 'license',
    priceUnit: 54,
    isAvailable: true,
    isFeatured: true,
    primaryImageUrl:
      'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&q=80',
    images: [
      {
        id: 'img-9-1',
        imageUrl:
          'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&q=80',
        altText: 'Adobe Creative Cloud',
        displayOrder: 0,
        isPrimary: true,
      },
    ],
    categoryName: 'Licence',
  },
  {
    id: '10',
    slug: 'vmware-vsphere',
    name: 'VMware vSphere',
    shortDescription: 'Virtualisation enterprise',
    description:
      'Licence VMware vSphere pour la virtualisation de votre infrastructure. Consolidez vos serveurs, optimisez vos ressources et assurez la continuite de service avec des fonctionnalites avancees de haute disponibilite.',
    productType: 'license',
    priceUnit: 399,
    isAvailable: true,
    isFeatured: false,
    primaryImageUrl:
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80',
    images: [
      {
        id: 'img-10-1',
        imageUrl:
          'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80',
        altText: 'VMware vSphere',
        displayOrder: 0,
        isPrimary: true,
      },
    ],
    categoryName: 'Licence',
  },
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '5',
    slug: 'yubikey-5-nfc',
    name: 'YubiKey 5 NFC',
    shortDescription: 'Cle de securite hardware',
    description:
      "La YubiKey 5 NFC est une cle d'authentification multi-protocoles compatible FIDO2, U2F, PIV et OTP. Protegez vos comptes contre le phishing avec une authentification forte par simple contact NFC ou USB.",
    productType: 'physical',
    priceUnit: 59,
    isAvailable: true,
    isFeatured: true,
    primaryImageUrl:
      'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=800&q=80',
    images: [
      {
        id: 'img-5-1',
        imageUrl:
          'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=800&q=80',
        altText: 'YubiKey 5 NFC',
        displayOrder: 0,
        isPrimary: true,
      },
      {
        id: 'img-5-2',
        imageUrl:
          'https://images.unsplash.com/photo-1563206767-5b18f218e8de?w=800&q=80',
        altText: 'YubiKey close-up',
        displayOrder: 1,
        isPrimary: false,
      },
      {
        id: 'img-5-3',
        imageUrl:
          'https://images.unsplash.com/photo-1618044619888-009e412ff12a?w=800&q=80',
        altText: 'Security key usage',
        displayOrder: 2,
        isPrimary: false,
      },
      {
        id: 'img-5-4',
        imageUrl:
          'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&q=80',
        altText: 'Multi-protocol auth',
        displayOrder: 3,
        isPrimary: false,
      },
    ],
    categoryName: 'Hardware',
  },
  {
    id: '6',
    slug: 'firewall-appliance',
    name: 'Firewall Appliance',
    shortDescription: 'Pare-feu materiel haute performance',
    description:
      "Notre Firewall Appliance offre une protection perimetrique de nouvelle generation avec inspection profonde des paquets, filtrage applicatif et prevention d'intrusion integree. Debit jusqu'a 10 Gbps sans compromis sur la securite.",
    productType: 'physical',
    priceUnit: 1299,
    isAvailable: true,
    isFeatured: true,
    primaryImageUrl:
      'https://images.unsplash.com/photo-1606765962248-7ff407b51667?w=800&q=80',
    images: [
      {
        id: 'img-6-1',
        imageUrl:
          'https://images.unsplash.com/photo-1606765962248-7ff407b51667?w=800&q=80',
        altText: 'Firewall appliance',
        displayOrder: 0,
        isPrimary: true,
      },
      {
        id: 'img-6-2',
        imageUrl:
          'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80',
        altText: 'Network infrastructure',
        displayOrder: 1,
        isPrimary: false,
      },
      {
        id: 'img-6-3',
        imageUrl:
          'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&q=80',
        altText: 'Server rack',
        displayOrder: 2,
        isPrimary: false,
      },
      {
        id: 'img-6-4',
        imageUrl:
          'https://images.unsplash.com/photo-1551808525-51a94da548ce?w=800&q=80',
        altText: 'Firewall management',
        displayOrder: 3,
        isPrimary: false,
      },
      {
        id: 'img-6-5',
        imageUrl:
          'https://images.unsplash.com/photo-1562813733-b31f71025d54?w=800&q=80',
        altText: 'Network security',
        displayOrder: 4,
        isPrimary: false,
      },
    ],
    categoryName: 'Hardware',
  },
  {
    id: '7',
    slug: 'encrypted-usb',
    name: 'Encrypted USB 256GB',
    shortDescription: 'Stockage USB chiffre',
    description:
      'Cle USB 256 Go avec chiffrement materiel AES-256 et clavier physique integre pour la saisie du code PIN. Certifiee FIPS 140-2, elle garantit la protection de vos donnees sensibles meme en cas de perte ou de vol.',
    productType: 'physical',
    priceUnit: 89,
    isAvailable: false,
    isFeatured: false,
    primaryImageUrl:
      'https://images.unsplash.com/photo-1597852074816-d933c7d2b988?w=800&q=80',
    images: [
      {
        id: 'img-7-1',
        imageUrl:
          'https://images.unsplash.com/photo-1597852074816-d933c7d2b988?w=800&q=80',
        altText: 'Encrypted USB drive',
        displayOrder: 0,
        isPrimary: true,
      },
      {
        id: 'img-7-2',
        imageUrl:
          'https://images.unsplash.com/photo-1618044619888-009e412ff12a?w=800&q=80',
        altText: 'USB encryption',
        displayOrder: 1,
        isPrimary: false,
      },
      {
        id: 'img-7-3',
        imageUrl:
          'https://images.unsplash.com/photo-1563206767-5b18f218e8de?w=800&q=80',
        altText: 'Secure storage',
        displayOrder: 2,
        isPrimary: false,
      },
      {
        id: 'img-7-4',
        imageUrl:
          'https://images.unsplash.com/photo-1530893609608-32a9af3aa95c?w=800&q=80',
        altText: 'Hardware encryption',
        displayOrder: 3,
        isPrimary: false,
      },
    ],
    categoryName: 'Stockage',
  },
];
