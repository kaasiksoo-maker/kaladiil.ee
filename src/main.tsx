import React from "react";
import ReactDOM from "react-dom/client";
import { Bell, Fish, Flame, Search, Star, Store, Truck } from "lucide-react";
import "./styles.css";

type Deal = {
  id: string;
  title: string;
  brand: string;
  category: string;
  country: "EE" | "FI" | "DE" | "EU";
  shop: string;
  price: number;
  oldPrice: number;
  shipping: number;
  total: number;
  discountPercent: number;
  euroSaving: number;
  nearYearLow: boolean;
  trust: number;
  score: number;
  url: string;
};

const quickSearches = ["Daiwa Certate", "Westin", "Savage Gear", "Shimano", "jig", "nöör"];
const countries = ["ALL", "EE", "FI", "DE", "EU"];
const categories = ["Kõik", "jigid", "ridvad", "rullid", "nöör", "landid"];
const brands = ["Kõik", "Daiwa", "Westin", "Savage Gear", "Shimano", "Rapala", "Owner", "Keitech"];

function money(value: number) {
  return `${value.toFixed(2).replace(".", ",")} €`;
}

function countryLabel(value: string) {
  return {
    ALL: "Kõik",
    EE: "🇪🇪 Eesti",
    FI: "🇫🇮 Soome",
    DE: "🇩🇪 Saksamaa",
    EU: "🇪🇺 EU"
  }[value] ?? value;
}

function App() {
  const [query, setQuery] = React.useState("");
  const [country, setCountry] = React.useState("ALL");
  const [category, setCategory] = React.useState("Kõik");
  const [brand, setBrand] = React.useState("Kõik");
  const [yearLow, setYearLow] = React.useState(false);
  const [activeCountry, setActiveCountry] = React.useState("ALL");
  const [loading, setLoading] = React.useState(false);
  const [status, setStatus] = React.useState("Vali otsing ja vajuta „Otsi diile“.");
  const [deals, setDeals] = React.useState<Deal[]>([]);

  async function search(nextQuery = query) {
    setLoading(true);
    setStatus("Otsin pakkumisi...");
    setDeals([]);

    const params = new URLSearchParams({
      q: nextQuery,
      country,
      category: category === "Kõik" ? "ALL" : category,
      brand: brand === "Kõik" ? "ALL" : brand,
      yearLow: String(yearLow)
    });

    try {
      const response = await fetch(`/api/deals?${params.toString()}`);
      const data = await response.json();
      const nextDeals = data.deals ?? [];
      setDeals(nextDeals);
      setActiveCountry("ALL");

      if (!nextDeals.length) {
        setStatus("Pakkumisi ei leitud.");
      } else {
        setStatus(`Leitud ${nextDeals.length} pakkumist. Parim diil: ${nextDeals[0].title} – ${money(nextDeals[0].price)}.`);
      }
    } catch {
      setStatus("Päring ebaõnnestus. Kui leht on alles avaldatud, proovi minuti pärast uuesti.");
    } finally {
      setLoading(false);
    }
  }

  function quick(value: string) {
    setQuery(value);
    search(value);
  }

  const visibleDeals = activeCountry === "ALL" ? deals : deals.filter((deal) => deal.country === activeCountry);

  return (
    <main className="page">
      <section className="hero">
        <div>
          <div className="eyebrow"><Fish size={17} /> Kalastustarvete pakkumised Euroopast</div>
          <h1>Kaladiil</h1>
          <p className="lead">
            Leia kalastustarvete parimad hinnad ühest kohast. Otsi Daiwa, Westin, Savage Geari,
            Shimano, Rapala, jige, ritvu, rulle ja nööre.
          </p>
          <div className="quickRow">
            {quickSearches.map((item) => <button key={item} onClick={() => quick(item)}>{item}</button>)}
          </div>
        </div>
        <div className="scoreCard">
          <Flame size={32} />
          <strong>Diiliskoor</strong>
          <span>Arvestab allahindlust, säästu eurodes, tarnekulu, poe usaldust ja aasta madala hinna lähedust.</span>
        </div>
      </section>

      <section className="stats">
        <div><Store /><strong>Euroopa poed</strong><span>Eesti, Soome, Saksamaa ja EU poed</span></div>
        <div><Truck /><strong>Koguhind</strong><span>Hind + hinnanguline tarne Eestisse</span></div>
        <div><Bell /><strong>Teavitused</strong><span>Valmis järgmises arendusetapis</span></div>
      </section>

      <section className="panel">
        <div className="searchBox">
          <Search size={18} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => event.key === "Enter" && search()} placeholder="Näiteks Daiwa Certate, Westin, jig või nöör" />
        </div>
        <select value={country} onChange={(event) => setCountry(event.target.value)}>{countries.map((item) => <option key={item} value={item}>{countryLabel(item)}</option>)}</select>
        <select value={category} onChange={(event) => setCategory(event.target.value)}>{categories.map((item) => <option key={item}>{item}</option>)}</select>
        <select value={brand} onChange={(event) => setBrand(event.target.value)}>{brands.map((item) => <option key={item}>{item}</option>)}</select>
        <label className="check"><input type="checkbox" checked={yearLow} onChange={(event) => setYearLow(event.target.checked)} /> aasta madala hinna lähedal</label>
        <button className="primary" onClick={() => search()} disabled={loading}>{loading ? "Otsin..." : "Otsi diile"}</button>
      </section>

      <section className="summary">{status}</section>

      <section className="tabs">
        {countries.map((item) => <button key={item} className={activeCountry === item ? "active" : ""} onClick={() => setActiveCountry(item)}>{countryLabel(item)}</button>)}
      </section>

      <section className="deals">
        {visibleDeals.map((deal) => <DealCard key={deal.id} deal={deal} />)}
      </section>

      {!visibleDeals.length && !loading && <section className="empty"><Fish size={44} /><h2>Proovi otsingut</h2><p>Näiteks „Daiwa“, „Westin“, „jig“ või „nöör“.</p></section>}
    </main>
  );
}

function DealCard({ deal }: { deal: Deal }) {
  return <article className="card">
    <div className="cardTop">
      <div><span className="brand">{deal.brand}</span><h2>{deal.title}</h2></div>
      <span className="country">{countryLabel(deal.country)}</span>
    </div>
    <div className="priceRow"><span className="price">{money(deal.price)}</span><span className="old">{money(deal.oldPrice)}</span></div>
    <div className="badges">
      <span className="badge hot">-{deal.discountPercent}%</span>
      <span className="badge">sääst {money(deal.euroSaving)}</span>
      <span className="badge">koos tarnega {money(deal.total)}</span>
      {deal.nearYearLow && <span className="badge blue">aasta madala hinna lähedal</span>}
      <span className="badge dark">skoor {deal.score}</span>
    </div>
    <div className="shop"><span>{deal.shop} · {deal.category}</span><span>{Array.from({ length: deal.trust }).map((_, i) => <Star key={i} size={13} fill="currentColor" />)}</span></div>
    <a href={deal.url} target="_blank" rel="noreferrer">Vaata poes</a>
  </article>;
}

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
