import React from "react";
import ReactDOM from "react-dom/client";
import { Search, Bot, Database, Store, Bell, Fish, Sparkles, Star } from "lucide-react";
import "./styles.css";

type Offer = { id:string; productName:string; normalizedName:string; brand:string; category:string; shop:string; country:string; price:number; shipping:number; total:number; stock:string; confidence:number; score:number; url:string; };
type Result = { query:string; interpretedAs:string; category:string; confidence:number; offers:Offer[]; };

function money(v:number){return `${Number(v).toFixed(2).replace(".", ",")} €`;}
function categoryName(c:string){return ({reel:"Rullid",rod:"Ridvad",line:"Nöörid",softbait:"Jigid",lure:"Landid",hook:"Konksud / jigipead",unknown:"Täpsustamata"} as any)[c]||c;}

function App(){
 const [query,setQuery]=React.useState("Daiwa rull");
 const [result,setResult]=React.useState<Result|null>(null);
 const [loading,setLoading]=React.useState(false);
 const [status,setStatus]=React.useState("Kirjelda, mida otsid. Näiteks „Daiwa rull”, „Westin jig”, „J-Braid nöör”.");

 async function search(next=query){
   setLoading(true); setStatus("AI-agent tõlgendab otsingut ja otsib sobivaid tootegruppe..."); setResult(null);
   try{
     const r=await fetch(`/api/agent-search?q=${encodeURIComponent(next)}`);
     const data=await r.json();
     setResult(data);
     setStatus(`Otsing tõlgendati kui: ${data.interpretedAs}. Leitud ${data.offers.length} pakkumist.`);
   }catch{ setStatus("Otsingut ei õnnestunud teha. Proovi mõne hetke pärast uuesti."); }
   finally{setLoading(false);}
 }

 return <main className="page">
   <section className="hero">
     <div><div className="eyebrow"><Bot size={16}/> AI ostuagent kalastajatele</div><h1>Kaladiilid.ee</h1>
       <p className="lead">Otsi kalastustarvet loomulikus keeles: “Emajõele jigikomplekt”, “Daiwa rull”, “Westin ritv” või “J-Braid nöör”. Agent eristab rulle, ritvu, nööre, lante ja jige.</p>
       <div className="quick">{["Daiwa rull","Daiwa nöör","Westin jig","Shimano rull","Rapala lant","Emajõe jig"].map(x=><button key={x} onClick={()=>{setQuery(x);search(x)}}>{x}</button>)}</div>
     </div>
     <div className="heroBox"><Sparkles size={30}/><h2>Mitte lihtsalt otsing</h2><p>Agent tõlgendab otsingut, leiab tootegrupi, võrdleb koguhinda ja hindab pakkumist.</p></div>
   </section>

   <section className="stats">
     <div><Store/><b>Eesti poed esimesena</b><span>Jahipaun, Salmo, Vobla, WFish, JahiKala, BoBo, e-Kalastus, Kalastuskeskus</span></div>
     <div><Database/><b>Hinnalugu</b><span>Skeem on valmis hindade igapäevaseks kogumiseks</span></div>
     <div><Bell/><b>Hinnateavitused</b><span>“Anna teada, kui Certate kukub alla 280 €”</span></div>
   </section>

   <section className="searchPanel">
     <label className="searchBox"><Search size={20}/><input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==="Enter"&&search()} placeholder="Näiteks: Daiwa Certate LT 2500, Westin jig, Emajõe jigikomplekt"/></label>
     <button onClick={()=>search()} disabled={loading}>{loading?"Otsin...":"Otsi AI-agendiga"}</button>
   </section>

   <section className="status">{status}</section>

   {result && <section className="result">
     <div className="resultHeader"><div><span className="brand">AI tõlgendus</span><h2>{result.interpretedAs}</h2><p>{categoryName(result.category)} · vastavus {Math.round(result.confidence*100)}%</p></div><div className="best"><span>Parim koguhind</span><b>{result.offers[0]?money(result.offers[0].total):"-"}</b><em>{result.offers[0]?.shop||""}</em></div></div>
     <div className="offers">{result.offers.map(o=><OfferRow key={o.id} offer={o}/>)}</div>
   </section>}

   {!result&&!loading&&<section className="empty"><Fish size={46}/><h2>Alusta tootegrupist</h2><p>Kirjuta koos tootetüübiga: “Daiwa rull”, “J-Braid nöör”, “Westin jig”, “Rapala lant”.</p></section>}
 </main>
}

function OfferRow({offer}:{offer:Offer}){
 return <div className="offer">
  <div><b>{offer.shop}</b><span>{offer.country} · {offer.stock}</span></div>
  <div><strong>{money(offer.price)}</strong><span>hind</span></div>
  <div><strong>{money(offer.shipping)}</strong><span>tarne</span></div>
  <div><strong>{money(offer.total)}</strong><span>kokku</span></div>
  <div className="badges"><span>diil {offer.score}/100</span><span>vastavus {Math.round(offer.confidence*100)}%</span></div>
  <div className="stars">{Array.from({length:4}).map((_,i)=><Star key={i} size={13} fill="currentColor"/>)}</div>
  <a href={offer.url} target="_blank" rel="noreferrer">Vaata</a>
 </div>
}

ReactDOM.createRoot(document.getElementById("root")!).render(<App/>);
