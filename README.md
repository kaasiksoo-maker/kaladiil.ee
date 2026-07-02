# Kaladiil clean v1

Testitud Cloudflare Pages jaoks.

## Cloudflare Pages settings

Framework preset: React (Vite)

Build command:

```bash
npm run build
```

Build output directory:

```text
dist
```

Root directory: jäta tühjaks või `/`.

## Oluline

`main.tsx` ja `styles.css` peavad olema kaustas `src/`, mitte repo juurkaustas.

Praegu kasutab API demo-hindasid. Päris poodide hinnalugemine tuleb lisada `functions/api/deals.ts` faili.
