# Notes de travail — lecture du cadrage.pdf

> Document de travail intermédiaire. Sera fold dans `mobile-native-audit.md` (L1) puis supprimé.

## Périmètre fonctionnel mandaté pour le mobile

**Section 5.3 du cadrage — fonctionnalités incluses application mobile :**

| Aspect | Décision cadrage |
|---|---|
| Framework | Ionic Angular (hybride) |
| Code partagé | 100% entre web et mobile |
| Fonctionnalités | Intégralité du front-end (miroir du site) |
| Pages | Catalogue, recherche/filtres, panier, tunnel d'achat, espace utilisateur, dashboard client, pages statiques + contact |
| Déploiement officiel | PWA installable iOS/Android + démos émulateurs |

**Note importante :** le cadrage prévoit une PWA + démo émulateur. Tom a relevé la barre dans le brainstorming en demandant un **build natif iOS sideloadable sur son iPhone**. Cette ambition dépasse le minimum cadré, ce qui est compatible (le cadrage ne l'interdit pas) mais n'est pas exigé pour la soutenance.

## Maquettes mobile validées (section 7.4)

Pages dont les maquettes sont **explicitement validées** dans le cadrage :

- **Login** : logo Cyna centré, champs email + password, "Se souvenir de moi", "Mot de passe oublié", CTA "Se connecter", lien "Pas encore de compte ? S'inscrire"
- **Register** : logo, email, password, confirmation password, CTA "S'inscrire", lien "Déjà inscrit ? Se connecter"
- **Accueil mobile** : header (logo + search + cart icon avec badge), bannière promo "Protection XDR Avancée" avec CTA "Découvrir", bloc Catalogue (Services + Produits cards), Top services du moment (carrousel horizontal), Top produits du moment, **bottom tab bar : Accueil / Catalogue / Panier / Compte**
- **Catalogue** : header identique, cards larges Services puis Produits avec image fullbleed et CTA "Voir les services / Voir les produits", section Populaires
- **Détail produit** : header avec back arrow + titre + share icon, image hero, nom + prix, badges (Disponible, catégorie), description, "Services similaires" (carrousel), bouton "Ajouter au panier" sticky bas
- **Paramètres / Compte** : avatar + nom + email, sections "Mon espace" (Mes commandes, Mes abonnements) et "Paramètres" (Informations personnelles, Carnet d'adresses, Méthodes de paiement, Aide & Contact), CTA "Se déconnecter" en rouge
- **Panier** : header avec back + "Mon panier" + compteur articles, "Vider mon panier", liste des articles (image, nom, prix, suppression), récap (Sous-total, Réduction annuelle, **Total**), CTA "Confirmer"

## Cas d'usage critiques mobile (section 4.3)

Six cas d'usage à supporter. Pour le mobile, les plus importants sont **#1, #2, #3, #6** :

1. **Abonnement service SaaS** — souscrire à un service SaaS (SOC, EDR, XDR) mensuel ou annuel
2. **Recherche et découverte** — recherche rapide produit avec filtres
3. **Achat mixte SaaS + Produit** — panier hybride (récurrent + one-time) — **complexe et critique (R1)**
6. **Gestion abonnements récurrents** — renouvellements automatiques et échecs paiement

Le cas #3 implique un panier qui distingue clairement montant récurrent vs one-time, avec affichage type "SOC 99€/mois récurrent + Station 1200€ one-time = Total aujourd'hui 1299€".

## Branding obligatoire (section 7.3)

| Élément | Valeur |
|---|---|
| Couleur principale | **Indigo lumineux #1447E6** |
| Fond | **Blanc cassé #F9F9F9** |
| Texte fort | **Noir intense #0A0A0A** |
| Police titres | **Qurova** |
| Police corps | **Inter** |

Principes UI/UX explicites : Mobile-first, Design system (composants réutilisables), Clarté/simplicité, Hiérarchie visuelle (distinction services SaaS vs produits), Accessibilité (contrastes optimisés).

## Exigences non-fonctionnelles (section 5.4)

### Performance (s'applique au mobile)
- Temps réponse API < 500ms (95% requêtes)
- **Chargement initial < 3s sur 4G**
- Disponibilité 99%

### Sécurité
- HTTPS TLS 1.2+ (obligatoire)
- **JWT avec expiration + refresh tokens**
- Bcrypt pour les mots de passe
- Paiement délégué Stripe (PCI-DSS)
- 2FA email — **uniquement back-office, pas mobile**
- Protection XSS, CSRF, SQL injection

### RGPD / Conformité
- Consentement cookies, droit accès/suppression
- Politique de confidentialité

### Accessibilité
- **WCAG 2.1 niveau A**
- Navigation clavier
- Ratios de contraste conformes
- Balises sémantiques + ARIA

### i18n
- FR + EN uniquement, pas de RTL

### Responsive
- Mobile-first
- Breakpoints : mobile, tablette, desktop
- Compatibilité Chrome, Firefox, Safari, Edge

### Tests
- "Tests unitaires sur fonctions critiques" (cadrage)
- Tom a relevé à **80% coverage minimum** dans le brainstorming
- E2E reportés en fin de projet par l'équipe humaine

## Jalons projet (section 8.3)

| Date | Jalon | Statut |
|---|---|---|
| 16/01/2026 | Rendez-vous cadrage client | passé |
| 23/01/2026 | Rendu document technique de cadrage | passé |
| 01/02/2026 | Début développement | passé |
| 16/04/2026 | MVP fonctionnel (auth + catalogue + panier) DEMO | **passé** |
| 15/05/2026 | Version complète (checkout + backoffice) | **dans 11 jours** |
| 19/05/2026 | Rendu slides soutenance | **dans 15 jours** |
| **20/05/2026** | **Démonstration orale (soutenance V1)** | **dans 16 jours** |
| 03/06/2026 | Rendu documentation architecture | dans 30 jours |

**Aujourd'hui : 2026-05-04. Soutenance dans 16 jours.** Tom vise effort fin de cette semaine (~10/05) avec marge confortable jusqu'au 20/05.

## Risques identifiés au cadrage (section 9)

| ID | Risque | Criticité | Pertinence mobile |
|---|---|---|---|
| R1 | Complexité panier mixte SaaS + Produit | Critique | **Forte** — checkout mobile doit gérer cette distinction |
| R2 | Latence recherche < 500ms | Moyenne | Pertinent pour la barre de recherche mobile |
| R3 | Sécurité paiements / webhooks | Moyenne | **Forte** — Apple Pay + Stripe webhooks |
| R4 | Scope Creep | Basse | À surveiller : Tom rajoute Face ID, Apple Pay, deep linking — non cadrés mais validés |
| R5 | Indispo services tiers | Basse | Pertinent pour Stripe et Railway |

## Hors périmètre V1 (section 6)

Le cadrage exclut explicitement :
- Chatbot IA conversationnel (remplacé par formulaire de contact)
- Recherche < 100ms (recherche < 500ms acceptée)
- Support langues RTL
- **Publication App Store / Play Store** ✅ cohérent avec ce qu'on a décidé

## Implications native (non explicites dans le cadrage)

Ces décisions ont été ajoutées dans le brainstorming par Tom, **au-dessus du cadrage minimum** :

- ✅ Build iOS sideload (objectif Tom, hors cadrage minimum)
- ✅ Face ID / Touch ID (pas dans cadrage)
- ✅ Apple Pay via Stripe (pas explicitement, mais Stripe est cadré)
- ✅ Deep linking / Universal Links (pas dans cadrage)
- ✅ Pull-to-refresh, swipe back, transitions natives, haptics (qualité native pas spécifiée mais souhaitée)
- ✅ Mode hors-ligne minimal (pas dans cadrage)

Ces ajouts ne créent pas de scope creep car ils ne modifient pas le périmètre fonctionnel cadré — ils élèvent uniquement la qualité d'exécution mobile.

## Implicites cadrage à valider

- **Bottom tab bar 4 onglets (Accueil / Catalogue / Panier / Compte)** : visible dans toutes les maquettes mobiles, donc considéré comme pattern de navigation principale obligatoire
- **Bouton retour (`<`) dans le header des écrans secondaires** : visible dans Détail produit, Paramètres, Panier — implique navigation en pile
- **Header : logo + search + cart badge** : visible sur Accueil et Catalogue, doit être un composant réutilisable
- **Carrousels horizontaux** : Top services, Top produits (scroll horizontal natif attendu)

## Open questions à confirmer avec Tom

Aucune question bloquante. Tom a déjà tranché les sujets ambigus pendant le brainstorming :

- Face ID, Apple Pay, deep linking, offline → tous validés
- iOS-first, Android plus tard sur device d'ami → validé
- Tests unitaires 80% → validé (relèvement vs cadrage)
- Pas de stores → cohérent cadrage

Un seul point à anticiper côté cyna-api :
- **Refresh token mobile-friendly** : aujourd'hui les cookies HTTP-only ne sont pas idéaux dans une WebView Capacitor sur certains chemins. À vérifier dans Task 6 (audit API).
