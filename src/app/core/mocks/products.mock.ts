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
    categoryName: 'Intelligence',
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
    categoryName: 'Stockage',
  },
];
