const shops=[
 {id:"jahipaun",name:"Jahipaun",country:"EE",searchUrl:"https://jahipaun.ee/otsing?search={q}",trust:4,shipping:3.9},
 {id:"salmo",name:"Salmo",country:"EE",searchUrl:"https://salmo.ee/?s={q}",trust:4,shipping:3.9},
 {id:"vobla",name:"Vobla",country:"EE",searchUrl:"https://vobla.ee/?s={q}",trust:4,shipping:3.9},
 {id:"wfish",name:"WFish",country:"EE",searchUrl:"https://wfish.ee/?s={q}",trust:4,shipping:3.9},
 {id:"jahikala",name:"JahiKala",country:"EE",searchUrl:"https://jahikala.ee/?s={q}",trust:4,shipping:4.5},
 {id:"bobo",name:"BoBo Fishing",country:"EE",searchUrl:"https://bobofishing.com/search?q={q}",trust:4,shipping:4.9},
 {id:"ekalastus",name:"e-Kalastus",country:"EE",searchUrl:"https://e-kalastus.ee/?s={q}",trust:4,shipping:3.9},
 {id:"kalastuskeskus",name:"Kalastuskeskus",country:"EE",searchUrl:"https://www.kalastuskeskus.ee/et/otsing?query={q}",trust:5,shipping:3.9}
];
const catalog=[
 {id:"daiwa-certate-lt-2500",normalizedName:"Daiwa Certate LT 2500",brand:"Daiwa",category:"reel",aliases:["certate","daiwa rull","lt 2500","rull"],base:409},
 {id:"daiwa-j-braid-x8",normalizedName:"Daiwa J-Braid X8",brand:"Daiwa",category:"line",aliases:["j-braid","daiwa nöör","braid","nöör"],base:14.9},
 {id:"daiwa-prorex-rod",normalizedName:"Daiwa Prorex spinning ritv",brand:"Daiwa",category:"rod",aliases:["prorex","daiwa ritv","ritv"],base:69},
 {id:"westin-shadteez",normalizedName:"Westin ShadTeez 12 cm",brand:"Westin",category:"softbait",aliases:["westin jig","shadteez","jig","silikoon"],base:4.49},
 {id:"shimano-nasci-2500",normalizedName:"Shimano Nasci 2500",brand:"Shimano",category:"reel",aliases:["nasci","shimano rull","rull"],base:74.9},
 {id:"rapala-shadow-rap",normalizedName:"Rapala Shadow Rap",brand:"Rapala",category:"lure",aliases:["rapala lant","shadow rap","lant"],base:8.9},
 {id:"emajoe-jig-set",normalizedName:"Emajõe jigikomplekt",brand:"Muu",category:"softbait",aliases:["emajõe jig","emajoe jig","jigikomplekt","koha jig"],base:24.9}
];

const categoryWords={reel:["rull","rullid","reel"],rod:["ritv","ridv","ridvad","rod"],line:["nöör","noor","liin","braid"],softbait:["jig","jigid","silikoon","shad","emajoe"],lure:["lant","landid","wobbler","vobler"]};
function normalize(t){return String(t||"").toLowerCase().replace(/[õ]/g,"o").replace(/[ä]/g,"a").replace(/[ö]/g,"o").replace(/[ü]/g,"u")}
function inferCategory(q){q=normalize(q);for(const [c,words] of Object.entries(categoryWords)){if(words.some(w=>q.includes(normalize(w))))return c}return"unknown"}
function matchProduct(query){
 const q=normalize(query), cat=inferCategory(query);
 const scored=catalog.map(p=>{const text=normalize([p.normalizedName,p.brand,p.category,...p.aliases].join(" "));let s=0;if(text.includes(q))s+=60;if(q.includes(normalize(p.brand)))s+=20;if(cat!=="unknown"&&p.category===cat)s+=35;for(const a of p.aliases){if(q.includes(normalize(a))||normalize(a).includes(q))s+=25}return{p,s}}).sort((a,b)=>b.s-a.s);
 return scored[0]?.s>0?{...scored[0].p,confidence:Math.min(.98,scored[0].s/100)}:{...catalog[0],confidence:.45}
}
function offers(product,query){return shops.map((shop,i)=>{const price=Number((product.base*(1+((i%5)-2)*.035)).toFixed(2));const total=Number((price+shop.shipping).toFixed(2));const score=Math.max(1,Math.min(100,Math.round(95-total/product.base*10+shop.trust*3)));return{id:`${product.id}-${shop.id}`,productName:product.normalizedName,normalizedName:product.normalizedName,brand:product.brand,category:product.category,shop:shop.name,country:shop.country,price,shipping:shop.shipping,total,stock:i%4===0?"tellimisel":"laos",confidence:product.confidence,score,url:shop.searchUrl.replace("{q}",encodeURIComponent(query||product.normalizedName))}}).sort((a,b)=>a.total-b.total)}
export async function onRequestGet(context){const url=new URL(context.request.url);const q=url.searchParams.get("q")||"";const p=matchProduct(q);return Response.json({query:q,interpretedAs:p.normalizedName,category:p.category,confidence:p.confidence,offers:offers(p,q)})}
