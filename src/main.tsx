import React from "react";
import ReactDOM from "react-dom/client";
import { Search, Flame, Bell, Truck, Store, Fish, Star } from "lucide-react";
import "./styles.css";

type Deal = {
  id: string;
  title: string;
  brand: string;
  category: string;
  country: string;
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

const countries = [
  ["ALL", "Kõik"],
  ["EE", "🇪🇪 Eesti"],
  ["FI", "🇫🇮 Soome"],
  ["DE", "🇩🇪 Saksamaa"],
  ["EU", "🇪🇺 EU"]
];

const quick = ["Daiwa Certate", "Westin", "Savage Gear", "Shimano", "jig", "nöör"];

function money(n: number) {
  return `${Number(n).toFixed(2).replace(".", ",")} €`;
}

function countryName(code: string) {
  return Object.fromEntries(countries)[code] || code;
}

function App() {
  const [query, setQuery] = React.useState("daiwa");
  const [country, setCountry] = React.useState("ALL");
  const [category, setCategory] = React.useState("ALL");
  const [brand, setBrand] = React.useState("ALL");
  const [yearLow, setYearLow] = React.useState(false);
  const [activeCountry, setActiveCountry] = React.useState("ALL");
  const [deals, setDeals] = React.useState<Deal[]>([]);
  const [status, setStatus] = React.useState("Proovi otsingut.");
  const [loading, setLoading] = React.useState(false);

  async function search(nextQuery = query) {
    setLoading(true);
    setStatus("Otsin diile...");
    setDeals([]);

    const params = new URLSearchParams({
      q: nextQuery,
      country,
      category,
      brand,
      yearLow: String(yearLow)
    });

    try {
      const res = await fetch(`/api/deals?${params.toString()}`);
      const data = await res.json();
      setDeals(data.deals || []);
      setActiveCountry("ALL");

      if (data.deals?.length) {
        setStatus(`Leitud ${data.deals.length} pakkumist. Parim diil: ${data.deals[0].title} – ${money(data.deals[0].price)}.`);
      } else {
        setStatus("Pakkumisi ei leitud.");
      }
    } catch (e) {
      setStatus("Päring ebaõnnestus. Kontrolli, kas /functions/api/deals.ts on GitHubis olemas.");
    } finally {
      setLoading(false);
    }
  }

  const visibleDeals = activeCountry === "ALL" ? deals : deals.filter(d => d.country === activeCountry);

  return (
    <main className="page">
      <section className="hero">
        <div>
          <div className="eyebrow"><Fish size={15}/> Kalastustarvete pakkumised Euroopast</div>
          <h1>Kaladiil</h1>
          <p className="lead">
            Leia kalastustarvete parimad hinnad ühest kohast. Otsi Daiwa, Westin, Savage Geari,
            Shimano, Rapala, jige, ritvu, rulle ja nööre.
          </p>
          <div className="quick">
            {quick.map(q => <button key={q} onClick={() => { setQuery(q); search(q); }}>{q}</button>)}
          </div>
        </div>
        <div className="heroBox">
          <Flame size={28}/>
          <h2>Diiliskoor</h2>
          <p>Arvestab allahindlust, säästu eurodes, tarnekulu, poe usaldust ja aasta madala hinna lähedust.</p>
        </div>
      </section>

      <section className="stats">
        <div><Store/><b>Euroopa poed</b><span>Eesti, Soome, Saksamaa ja EU poed</span></div>
        <div><Truck/><b>Koguhind</b><span>Hind + hinnanguline tarne Eestisse</span></div>
        <div><Bell/><b>Teavitused</b><span>Valmis järgmises arendusetapis</span></div>
      </section>

      <section className="controls">
        <label className="search">
          <Search size={17}/>
          <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && search()} />
        </label>

        <select value={country} onChange={e => setCountry(e.target.value)}>
          <option value="ALL">Kõik riigid</option>
          <option value="EE">Eesti</option>
          <option value="FI">Soome</option>
          <option value="DE">Saksamaa</option>
          <option value="EU">EU</option>
        </select>

        <select value={category} onChange={e => setCategory(e.target.value)}>
          <option value="ALL">Kõik</option>
          <option value="jigid">Jigid</option>
          <option value="ridvad">Ridvad</option>
          <option value="rullid">Rullid</option>
          <option value="nöör">Nöörid</option>
          <option value="landid">Landid</option>
        </select>

        <select value={brand} onChange={e => setBrand(e.target.value)}>
          <option value="ALL">Kõik</option>
          <option value="Daiwa">Daiwa</option>
          <option value="Westin">Westin</option>
          <option value="Savage Gear">Savage Gear</option>
          <option value="Shimano">Shimano</option>
          <option value="Rapala">Rapala</option>
        </select>

        <label className="check">
          <input type="checkbox" checked={yearLow} onChange={e => setYearLow(e.target.checked)} />
          aasta madala hinna lähedal
        </label>

        <button className="searchBtn" disabled={loading} onClick={() => search()}>
          {loading ? "Otsin..." : "Otsi diile"}
        </button>
      </section>

      <section className="status">{status}</section>

      <section className="tabs">
        {countries.map(([code, label]) => (
          <button key={code} className={activeCountry === code ? "active" : ""} onClick={() => setActiveCountry(code)}>
            {label}
          </button>
        ))}
      </section>

      <section className="grid">
        {visibleDeals.map(deal => <DealCard key={deal.id} deal={deal} />)}
      </section>

      {!visibleDeals.length && (
        <section className="empty">
          <Fish size={48}/>
          <h2>Proovi otsingut</h2>
          <p>Näiteks „Daiwa”, „Westin”, „jig” või „nöör”.</p>
        </section>
      )}
    </main>
  );
}

function DealCard({ deal }: { deal: Deal }) {
  return (
    <article className="card">
      <div className="top">
        <div>
          <span className="brand">{deal.brand}</span>
          <h2>{deal.title}</h2>
        </div>
        <span className="country">{countryName(deal.country)}</span>
      </div>

      <div className="price">
        <b>{money(deal.price)}</b>
        <span>{money(deal.oldPrice)}</span>
      </div>

      <div className="badges">
        <span className="hot">-{deal.discountPercent}%</span>
        <span>sääst {money(deal.euroSaving)}</span>
        <span>koos tarnega {money(deal.total)}</span>
        {deal.nearYearLow && <span>aasta madala hinna lähedal</span>}
        <span className="score">skoor {deal.score}</span>
      </div>

      <div className="shop">
        <span>{deal.shop} · {deal.category}</span>
        <span>{Array.from({ length: deal.trust }).map((_, i) => <Star key={i} size={13} fill="currentColor"/>)}</span>
      </div>

      <a href={deal.url} target="_blank" rel="noreferrer">Vaata poes</a>
    </article>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
