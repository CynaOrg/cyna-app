# N4 — Apple Pay live setup (notes Tom)

## Etapes Stripe Dashboard pour activer Apple Pay LIVE

1. Stripe Dashboard -> Settings -> Payments -> Apple Pay
2. "Add a new domain" -> `cyna-app.up.railway.app`
3. Stripe demande de placer un fichier `.well-known/apple-developer-merchantid-domain-association`
4. Recuperer le contenu, creer `cyna-app/public/.well-known/apple-developer-merchantid-domain-association` avec ce contenu
5. Redeployer sur Railway -> verifier que le fichier est accessible a https://cyna-app.up.railway.app/.well-known/apple-developer-merchantid-domain-association
6. Dans Stripe -> click "Verify" -> Apple Pay active en LIVE

## Pour le sideload iPhone (B9)

- Bundle id `io.cyna.app` doit matcher la config Stripe
- Free signing Xcode peut limiter Apple Pay sur device — a tester en N7

## Live vs Sandbox

- Code active en sandbox/test par defaut (cle `pk_test_*`)
- Pour live : changer `environment.prod.ts` -> `pk_live_*` une fois domain verified

## Implementation cote app (rappel)

- Wrapper `NativeStripePaymentElementComponent` (`src/app/native/components/native-stripe-payment-element.component.ts`)
- Reordering du `paymentMethodOrder` selon `Capacitor.getPlatform()` :
  - iOS : `['apple_pay', 'google_pay', 'card']`
  - autres : `['card', 'apple_pay', 'google_pay']`
- Mount d'un `paymentRequestButton` au-dessus du Payment Element quand le device peut faire Apple Pay (verifie via `paymentRequest.canMakePayment()`)
- Le bouton wallet declenche `confirmCardPayment` avec le payment method retourne par la sheet Apple Pay
- Le Payment Element (mode `tabs`) propose card + wallet en fallback

## Pages branchees sur le wrapper

- `src/app/native/pages/checkout/checkout-native.page.ts` (commande one-time)
- `src/app/native/pages/subscribe/subscribe-native.page.ts` (abonnement SaaS)

Les deux passent `amount` (centimes TTC) + `currency='eur'` + `country='FR'` au composant pour que le Payment Request affiche le bon montant dans la sheet Apple Pay.

## Tests sur device

1. `npm run build` puis `npx cap sync ios`
2. Ouvrir Xcode -> run sur iPhone connecte
3. Aller sur `/m/cart`, ajouter un item, lancer `/m/checkout`
4. A l'etape "Payment", la sheet Apple Pay doit apparaitre au-dessus du form card
5. Verifier le total affiche dans la sheet correspond au TTC du panier
