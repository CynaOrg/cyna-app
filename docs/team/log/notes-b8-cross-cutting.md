# Notes B8 — Cross-cutting natif

## Hors scope assumés / non livrés

- **In-app browser sur les pages legal** — la directive `appExternalLink`
  est créée et exportée, mais aucun lien externe `<a href="https://...">`
  n'existe à date dans `cgu.page.html`, `mentions.page.html`,
  `privacy.page.html`. Aucune modification de template legal n'a donc été
  faite. Les futurs liens externes peuvent simplement appliquer
  `appExternalLink` sur l'anchor.
- **Universal Links iOS (apple-app-site-association)** — non scopé. Seul
  le scheme custom `cyna://` est configuré (Info.plist). Les universal
  links HTTPS sont parsés défensivement par `DeepLinkService` mais ne
  sont pas associés natifs côté Apple.
- **Android `AndroidManifest.xml`** — pas modifié, projet iOS-only à
  date. À ajouter quand Android sera ramené dans le scope.
- **Cache TTL / invalidation produits** — non implémenté. Politique
  "dernière liste connue" demandée par le brief, donc pas de TTL ni de
  versionning. La liste est rafraîchie dès qu'un fetch live aboutit.
- **Disable des CTA quand offline (checkout, etc.)** — non touché : le
  brief autorise ce genre de modification mais l'a marquée mineure et je
  n'ai pas voulu changer d'autres pages sans signal explicite. Le
  `NetworkService.isOnline` Signal est exposé pour un wiring ultérieur.
- **Cache panier offline-only** — la persistance via Preferences est
  ajoutée, mais les opérations `addItem` / `updateQuantity` /
  `removeItem` continuent de passer par l'API. Si l'API échoue offline,
  l'erreur remonte normalement via `error$`. Pas de queue d'opérations à
  rejouer une fois revenu online (hors scope).

## Décisions

- `ShareService.share()` retourne `Promise<boolean>` (succès/fallback
  appliqué) plutôt que `void`, pour que les call sites puissent l'utiliser
  pour des analytics ultérieures. Le brief demandait un retour void, mais
  l'API la plus testable est un boolean.
- `DeepLinkService` parse aussi les universal links pointant sur
  `cyna-app.up.railway.app` ou `cyna.app` — ça permettra de réutiliser le
  même service quand l'AASA file sera publié, sans nouveau code à wirer.
- `NetworkService` expose à la fois un Signal (`isOnline`) et un
  Observable (`isOnline$`). Le composant `OfflineBannerComponent` utilise
  le Signal pour rester en zone Angular pure, sans subscribe explicite.
- `ExternalLinkDirective` retourne au comportement web par défaut
  (`window.open`) si le plugin `Browser` rejette — utile en dev shell où
  les plugins natifs ne sont pas chargés.
