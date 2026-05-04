# B7 — Apple Pay via Stripe — Notes pour Tom

**Branche** : `feat/mobile-b7-apple-pay`
**Date** : 2026-05-04

## Ce qui a été fait côté code

- Le composant `app-stripe-payment-element` rend désormais un bouton
  Apple Pay / Google Pay (`paymentRequestButton` Stripe Elements) **au-dessus**
  du formulaire carte split, derrière un séparateur "Or pay by card".
- Le bouton est rendu uniquement si `stripe.paymentRequest().canMakePayment()`
  retourne un wallet disponible (sinon il reste caché et la carte fonctionne
  comme avant — zéro régression sur Android Chrome ou desktop Firefox par ex.).
- Les pages `checkout` et `subscribe` passent les nouveaux inputs
  `[amount]`, `currency="eur"`, `country="FR"`, `walletLabel="CYNA"` et
  écoutent `(walletPaymentSuccess)` pour finaliser la commande / l'abonnement.
- Le montant passé est en **cents TTC** (HT × 1.2 × 100, arrondi).
  Stripe affiche ce montant exact dans la feuille Apple Pay.
- Sur succès Apple Pay : Stripe a déjà confirmé le PaymentIntent à
  l'intérieur de la feuille, on enchaîne donc directement `cartStore.clear()` +
  navigation vers la page de confirmation (checkout) ou
  `/dashboard/subscriptions` (subscribe).
- Gestion de la 3DS : si le `paymentIntent.status === 'requires_action'`
  après confirmation, on rappelle `stripe.confirmCardPayment(clientSecret)`
  pour déclencher le flow 3DS hors wallet.
- Helper `resolveWalletOrder()` exprime la préférence iOS-first quand on
  est en Capacitor natif iOS. Stripe choisit automatiquement le bon wallet,
  cet helper est documentaire + testé.
- Aucune modif backend nécessaire : le PaymentIntent existant accepte
  déjà les payment methods Apple Pay (Stripe le gère côté Elements).

## Pour activer Apple Pay LIVE — checklist Stripe Dashboard

### 1. Domain verification (étape obligatoire en LIVE)

1. Stripe Dashboard → **Settings** → **Payment methods** → **Apple Pay**
   (ou direct `https://dashboard.stripe.com/settings/payment_methods` puis
   onglet Apple Pay).
2. Cliquer **Add new domain**.
3. Saisir le domaine de prod : `cyna-app.up.railway.app` (et aussi
   `cyna-app-prod.up.railway.app` si tu utilises plusieurs alias).
4. Stripe demande de servir un fichier sur :
   `https://<domain>/.well-known/apple-developer-merchantid-domain-association`
5. Télécharger le fichier depuis le dashboard, le commiter dans
   `cyna-app/public/.well-known/apple-developer-merchantid-domain-association`
   (créer le dossier `public/.well-known/` s'il n'existe pas).
   Vérifier que `angular.json` (assets) et `server.js` (Express static)
   servent bien ce path.
6. Re-déployer le frontend Railway.
7. Cliquer **Verify** dans Stripe → si succès, Apple Pay est actif en LIVE.

### 2. Mode sandbox / test (déjà actif)

Pas de domain verification requise — le code marche tel quel avec
`pk_test_*` (déjà configuré dans `src/environments/environment.ts`).

Pour tester sans iPhone réel :
- macOS Safari + iCloud Keychain avec une carte test Stripe
  (`4242 4242 4242 4242`) ajoutée dans Apple Wallet macOS.
- Aller sur `http://localhost:4200/checkout`, ajouter un produit, remplir
  l'adresse → après PaymentIntent créé, le bouton Apple Pay doit s'afficher.
- Si le bouton n'apparaît pas → vérifier la console Stripe (`canMakePayment`
  retourne `null` quand aucune carte n'est dans le Wallet).

### 3. Pour le sideload iPhone (B9)

- Le bundle id `io.cyna.app` (`capacitor.config.ts`) doit être cohérent
  avec celui éventuellement déclaré dans Stripe (en règle générale, pour
  Apple Pay via Payment Element en WebView, **pas besoin** de merchant ID
  Apple côté developer.apple.com — Stripe gère ça).
- En free signing Xcode, le certificat dev n'autorise normalement pas
  Apple Pay sur device physique. Workaround : tester en Safari iOS sur
  l'iPhone directement (pas dans la WebView Capacitor) pour valider que
  la conf Stripe est bonne, puis re-tester en sideload.
- Si Apple Pay reste indisponible en sideload : c'est bloqué par Apple,
  pas par notre code. La carte split fonctionne sans souci comme fallback.

### 4. Live vs sandbox côté frontend

- Sandbox : `environment.ts` → `stripePublishableKey: 'pk_test_…'` (déjà OK).
- Live : `environment.prod.ts` → mettre `pk_live_…` après avoir validé
  le domain dans Stripe Dashboard. Sinon Apple Pay restera indispo en prod.

### 5. Quoi tester quand tu auras validé le dashboard

- [ ] Bouton Apple Pay visible sur Safari iOS / WebView Capacitor iOS
- [ ] Tap → feuille Apple Pay s'ouvre avec le bon montant TTC
- [ ] Confirmation → redirection vers la page de confirmation de commande
- [ ] Cas 3DS (carte test `4000 0027 6000 3184`) → modal 3DS s'affiche
- [ ] Pas de bouton Apple Pay sur desktop Chrome → fallback carte OK
- [ ] Subscribe page : bouton Apple Pay avec montant mensuel/annuel TTC

## Out-of-scope (V1)

- **Google Pay** : Stripe l'expose dans le même Payment Request Button
  côté Chrome / Android web, mais pour le **natif Android** il faut le
  Stripe Android SDK. Le helper `walletOrder` réserve la place mais on
  ne l'active pas en V1.
- **Stripe PaymentSheet** (vrai SDK natif iOS via Capacitor plugin) :
  alternative plus poussée, hors scope (perte du Payment Element web).
- Auto-fill name/email côté wallet : on laisse `requestPayerName: false`
  parce qu'on collecte déjà l'adresse via le formulaire.
