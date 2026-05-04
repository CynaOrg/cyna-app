# B3 — Native UX patterns globaux — Notes

**Branche** : `feat/mobile-b3-native-ux-patterns`
**Date** : 2026-05-04

## Décisions notables

### Selecteur de la directive haptic : `[appHapticOn]` (au lieu de `[hapticOn]`)

La règle ESLint `@angular-eslint/directive-selector` configurée à la racine
impose le préfixe `app` sur toutes les directives. Pour rester conforme,
le sélecteur est `[appHapticOn]` mais l'input utilise une alias DOM directe
(`@Input('appHapticOn') level`), ce qui permet aux consommateurs d'écrire :

```html
<button appHapticOn="medium" (click)="action()">CTA</button>
```

Aucune attribut séparée n'est nécessaire — la valeur est passée via le
sélecteur lui-même, exactement comme l'usage attendu dans le brief.

### Test de `PullToRefreshComponent.complete()`

Le HTMLElement standard n'expose pas de méthode `complete()` (c'est une
méthode propre à `<ion-refresher>`, web component Stencil). Pour le test
unitaire, on patch le node via `Object.defineProperty` afin de simuler
l'API Ionic sans avoir à booter le Stencil runtime.

### IonicModule mode iOS

Forcé à `mode: 'ios'` + `animated: true` dans `app.module.ts`. Précédemment,
le projet bootait avec `animated: false` (probablement legacy starter) —
ce qui désactivait toutes les transitions natives. Cette bascule donne
les transitions d'écran iOS, le swipe back natif, et l'esthétique
cohérente attendue par le cadrage mobile-native.

## Hors scope observés (non corrigés)

Aucun. Le scope B3 est purement infrastructurel et toutes les briques
ont été créées dans `src/app/shared/`.

## Tests

- 264 tests SUCCESS / 0 failed
- Nouveaux tests : 6 (skeleton) + 6 (haptic) + 5 (pull-to-refresh) = 17
- Coverage des nouveaux fichiers : rendu complet + cas limites
  (count négatif clampé, fail-silent du haptic, fallback sans
  `complete()` natif).

## Validation

- `npm run lint` : OK
- `npm run build` : OK (warnings pré-existants uniquement, aucun nouveau
  warning émis par les fichiers B3)
- Karma : 264/264 SUCCESS
