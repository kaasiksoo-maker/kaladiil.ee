const shops = [
  { country: "EE", name: "Kalastuskeskus", searchUrl: "https://www.kalastuskeskus.ee/et/otsing?query={q}", trust: 5, shipping: 3.9 },
  { country: "EE", name: "Kalastuspood", searchUrl: "https://kalastuspood.ee/?s={q}", trust: 4, shipping: 3.9 },
  { country: "EE", name: "Ritv.ee", searchUrl: "https://ritv.ee/?s={q}", trust: 4, shipping: 4.5 },
  { country: "FI", name: "Happy Angler", searchUrl: "https://happyangler.fi/search?q={q}", trust: 5, shipping: 9.9 },
  { country: "FI", name: "Ruoto", searchUrl: "https://www.ruoto.fi/search?q={q}", trust: 5, shipping: 9.9 },
  { country: "DE", name: "Askari", searchUrl: "https://www.angelsport.de/search?sSearch={q}", trust: 4, shipping: 12.9 },
  { country: "DE", name: "Angelplatz", searchUrl: "https://www.angelplatz.de/search?sSearch={q}", trust: 4, shipping: 12.9 },
  { country: "EU", name: "Waveinn", searchUrl: "https://www.tradeinn.com/waveinn/en/search?search_text={q}", trust: 3, shipping: 7.9 },
  { country: "EU", name: "Sportfishtackle", searchUrl: "https://www.sportfishtackle.com/en/search?q={q}", trust: 5, shipping: 9.9 },
  { country: "EU", name: "Amazon DE", searchUrl: "https://www.amazon.de/s?k={q}+fishing", trust: 4, shipping: 8.9 }
];

const products = [
  { keys: ["daiwa", "certate", "rull"], title: "Daiwa Certate LT 2500", brand: "Daiwa", category: "rullid", base: 409, old: 529 },
  { keys: ["daiwa", "j-braid", "nöör"], title: "Daiwa J-Braid X8", brand: "Daiwa", category: "nöör", base: 14.9, old: 22.9 },
  { keys: ["daiwa", "prorex", "ridv"], title: "Daiwa Prorex spinning ridv", brand: "Daiwa", category: "ridvad", base: 69, old: 99 },
  { keys: ["westin", "shadteez", "jig"], title: "Westin ShadTeez 12 cm", brand: "Westin", category: "jigid", base: 4.49, old: 6.99 },
  { keys: ["westin", "w3", "ridv"], title: "Westin W3 Powercast", brand: "Westin", category: "ridvad", base: 109, old: 149 },
  { keys: ["savage", "cannibal", "jig"], title: "Savage Gear Cannibal Shad", brand: "Savage Gear", category: "jigid", base: 3.9, old: 5.9 },
  { keys: ["shimano", "nasci", "rull"], title: "Shimano Nasci 2500", brand: "Shimano", category: "rullid", base: 74.9, old: 109.9 },
  { keys: ["rapala", "shadow", "lant"], title: "Rapala Shadow Rap", brand: "Rapala", category: "landid", base: 8.9, old: 13.9 },
  { keys: ["owner", "jigipea", "jig"], title: "Owner jigipead 10 g", brand: "Owner", category: "jigid", base: 2.2, old: 3.5 }
];

function matches(product, q) {
  if (!q) return true;
  const text = q.toLowerCase();
  return product.title.toLowerCase().includes(text)
    || product.brand.toLowerCase().includes(text)
    || product.category.toLowerCase().includes(text)
    || product.keys.some(k => text.includes(k) || k.includes(text));
}

function score(price, oldPrice, shipping, trust) {
  const discountPercent = oldPrice > price ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0;
  const euroSaving = oldPrice > price ? Number((oldPrice - price).toFixed(2)) : 0;
  const total = Number((price + shipping).toFixed(2));
  const historicalLow = oldPrice * 0.68;
  const nearYearLow = price <= historicalLow * 1.08;
  const dealScore = Math.round(discountPercent * 2 + euroSaving / 2 + trust * 4 + (nearYearLow ? 20 : 0) - shipping / 2);
  return { discountPercent, euroSaving, total, nearYearLow, score: dealScore };
}

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const q = url.searchParams.get("q") || "";
  const country = url.searchParams.get("country") || "ALL";
  const category = url.searchParams.get("category") || "ALL";
  const brand = url.searchParams.get("brand") || "ALL";
  const yearLow = url.searchParams.get("yearLow") === "true";

  const selectedProducts = products
    .filter(p => matches(p, q))
    .filter(p => category === "ALL" || p.category === category)
    .filter(p => brand === "ALL" || p.brand === brand);

  const productList = selectedProducts.length ? selectedProducts : products.slice(0, 5);
  const shopList = shops.filter(s => country === "ALL" || s.country === country);
  const deals = [];

  for (let s = 0; s < shopList.length; s++) {
    for (let p = 0; p < Math.min(productList.length, 6); p++) {
      const shop = shopList[s];
      const product = productList[p];
      const variance = 1 + (((s + p) % 7) - 3) * 0.025;
      const price = Number((product.base * variance).toFixed(2));
      const metrics = score(price, product.old, shop.shipping, shop.trust);
      if (yearLow && !metrics.nearYearLow) continue;
      deals.push({
        id: `${shop.name}-${product.title}-${s}-${p}`,
        title: product.title,
        brand: product.brand,
        category: product.category,
        country: shop.country,
        shop: shop.name,
        price,
        oldPrice: product.old,
        shipping: shop.shipping,
        trust: shop.trust,
        url: shop.searchUrl.replace("{q}", encodeURIComponent(q || product.brand)),
        ...metrics
      });
    }
  }

  return Response.json({
    query: q,
    count: deals.length,
    deals: deals.sort((a, b) => b.score - a.score)
  });
}
