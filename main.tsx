import React from "react";
import ReactDOM from "react-dom/client";
import { Search, Flame, Bell, TrendingDown, Fish, Store, Truck, Star } from "lucide-react";
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
  historicalLow: number;
  nearYearLow: boolean;
  trust: number;
  score: number;
  url: string;
};

type Filters = {
  query: string;
  country: string;
  category: string;
  brand: string;
  yearLow: boolean;
};

const quickSearches = ["Daiwa Certate", "Westin", "Savage Gear", "Shimano Nasci", "jig", "nöör"];

const brands = ["Kõik", "Daiwa", "Westin", "Savage Gear", "Shimano", "Rapala", "Owner", "Keitech"];
const categories = ["Kõik", "jigid", "ridvad", "rullid", "nöör", "landid"];

function money(value: number) {
  return `${value.toFixed(2).replace(".", ",")} €`;
}

function countryLabel(country: string) {
  const map: Record<string, string> = {
    ALL: "Kõik",
    EE: "🇪🇪 Eesti",
    FI: "🇫🇮 Soome",
    DE: "🇩🇪 Saksamaa",
    EU: "🇪🇺 EU"
  };
  return map[country] || country;
}

function App() {
  const [filters, setFilters] = React.useState<Filters>({
    query: "",
    country: "ALL",
    category: "Kõik",
    brand: "Kõik",
    yearLow: false
  });

  const [activeCountry, setActiveCountry] = React.useState("ALL");
  const [deals, setDeals] = React.useState<Deal[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [status, setStatus] = React.useState("Vali otsing ja vajuta „Otsi diile“.");

  async function searchDeals(nextFilters = filters) {
    setLoading(true);
    setStatus("Otsin pakkumisi Euroopa kalastuspoedest...");
    setDeals([]);

    const params = new URLSearchParams({
      q: nextFilters.query,
      country: nextFilters.country,
      category: nextFilters.category === "Kõik" ? "ALL" : nextFilters.category,
      brand: nextFilters.brand === "Kõik" ? "ALL" : nextFilters.brand,
      yearLow: String(nextFilters.yearLow)
    });

    try {
      const response = await fetch(`/api/deals?${params.toString()}`);
      const data = await response.json();
      setDeals(data.deals || []);
      setActiveCountry("ALL");

      if (!data.deals?.length) {
        setStatus("Pakkumisi ei leitud.");
      } else {
        const best = data.deals[0];
        setStatus(`Leitud ${data.deals.length} pakkumist. Parim diil: ${best.title} – ${money(best.price)} (${best.shop}).`);
      }
    } catch {
      setStatus("Päring ebaõnnestus. Kontrolli, kas API on avaldatud.");
    } finally {
      setLoading(false);
    }
  }

  function setFilter<K extends keyof Filters>(key: K, value: Filters[K]) {
    setFilters(previous => ({ ...previous, [key]: value }));
  }

  function quick(q: string) {
    const next = { ...filters, query: q };
    setFilters(next);
    searchDeals(next);
  }

  const visibleDeals = activeCountry === "ALL" ? deals : deals.filter(d => d.country === activeCountry);
  const topDeal = deals[0];

  return (
    <main className="page">
      <section className="hero">
        <div className="heroText">
          <div className="eyebrow"><Fish size={16} /> Euroopa kalastusdiilid ühes vaates</div>
          <h1>KalastusDiilid</h1>
          <p className="lead">
            Hind.ee + Idealo + PriceRunner kalastustarvetele. Otsi Daiwa, Westin, Savage Geari,
            Shimano, Rapala, jigide, ritvade, rullide ja nööride parimaid pakkumisi.
          </p>

          <div className="quickRow">
            {quickSearches.map(item => (
              <button key={item} className="quickButton" onClick={() => quick(item)}>{item}</button>
            ))}
          </div>
        </div>

        <div className="heroCard">
          <div className="heroCardIcon"><Flame /></div>
          <strong>Diiliskoor</strong>
          <span>Allahindlus + sääst eurodes + aasta madala hinna lähedus + poe usaldus + tarnekulu.</span>
        </div>
      </section>

      <section className="statsGrid">
        <div className="statCard">
          <Store />
          <strong>30–50 poodi</strong>
          <span>v1 struktuur on valmis laiendamiseks</span>
        </div>
        <div className="statCard">
          <TrendingDown />
          <strong>Hinnaajalugu</strong>
          <span>D1 andmemudel on ette valmistatud</span>
        </div>
        <div className="statCard">
          <Bell />
          <strong>Hinnateavitused</strong>
          <span>kasutaja saab hiljem soovitud hinnapiiri määrata</span>
        </div>
      </section>

      <section className="panel">
        <div className="controls">
          <div className="inputWrap">
            <Search size={18} />
            <input
              value={filters.query}
              onChange={e => setFilter("query", e.target.value)}
              onKeyDown={e => e.key === "Enter" && searchDeals()}
              placeholder="Näiteks: Daiwa Certate, Westin, jig, nöör"
            />
          </div>

          <select value={filters.country} onChange={e => setFilter("country", e.target.value)}>
            <option value="ALL">Kõik riigid</option>
            <option value="EE">Eesti</option>
            <option value="FI">Soome</option>
            <option value="DE">Saksamaa</option>
            <option value="EU">Muud EU poed</option>
          </select>

          <select value={filters.category} onChange={e => setFilter("category", e.target.value)}>
            {categories.map(c => <option key={c}>{c}</option>)}
          </select>

          <select value={filters.brand} onChange={e => setFilter("brand", e.target.value)}>
            {brands.map(b => <option key={b}>{b}</option>)}
          </select>

          <label className="check">
            <input
              type="checkbox"
              checked={filters.yearLow}
              onChange={e => setFilter("yearLow", e.target.checked)}
            />
            aasta parima hinna lähedal
          </label>

          <button className="searchButton" onClick={() => searchDeals()} disabled={loading}>
            {loading ? "Otsin..." : "Otsi diile"}
          </button>
        </div>
      </section>

      <section className="summary">
        <span>{status}</span>
        {topDeal && (
          <strong>Parim koguhind: {money(topDeal.total)} koos tarnega</strong>
        )}
      </section>

      <section className="tabs">
        {["ALL", "EE", "FI", "DE", "EU"].map(c => (
          <button
            key={c}
            className={activeCountry === c ? "tab active" : "tab"}
            onClick={() => setActiveCountry(c)}
          >
            {countryLabel(c)}
          </button>
        ))}
      </section>

      <section className="deals">
        {visibleDeals.map(deal => <DealCard key={deal.id} deal={deal} />)}
      </section>

      {!visibleDeals.length && !loading && (
        <section className="empty">
          <Fish size={44} />
          <h2>Pakkumisi pole veel kuvatud</h2>
          <p>Proovi näiteks „Daiwa“, „Westin“, „jig“ või „nöör“.</p>
        </section>
      )}

      <section className="roadmap">
        <h2>Järgmised arendusetapid</h2>
        <div className="roadmapGrid">
          <div><strong>1. Päris poed</strong><span>API/feed või lubatud adapterid</span></div>
          <div><strong>2. Hinnarobot</strong><span>automaatne kontroll iga 6 h</span></div>
          <div><strong>3. Hinnaajalugu</strong><span>graafik ja aasta madalaim hind</span></div>
          <div><strong>4. Teavitused</strong><span>e-mail, Telegram või push</span></div>
        </div>
      </section>
    </main>
  );
}

function DealCard({ deal }: { deal: Deal }) {
  return (
    <article className="card">
      <div className="cardHeader">
        <div>
          <span className="brand">{deal.brand}</span>
          <h2>{deal.title}</h2>
        </div>
        <span className="country">{countryLabel(deal.country)}</span>
      </div>

      <div className="priceRow">
        <span className="price">{money(deal.price)}</span>
        <span className="old">{money(deal.oldPrice)}</span>
      </div>

      <div className="badges">
        <span className="badge hot">-{deal.discountPercent}%</span>
        <span className="badge">sääst {money(deal.euroSaving)}</span>
        <span className="badge"><Truck size={13} /> koos tarnega {money(deal.total)}</span>
        {deal.nearYearLow && <span className="badge low">aasta madala hinna lähedal</span>}
        <span className="badge score">skoor {deal.score}</span>
      </div>

      <div className="shopRow">
        <span>{deal.shop} · {deal.category}</span>
        <span className="stars">{Array.from({ length: deal.trust }).map((_, i) => <Star key={i} size={13} fill="currentColor" />)}</span>
      </div>

      <div className="cardActions">
        <a href={deal.url} target="_blank" rel="noopener noreferrer">Vaata poes</a>
        <button title="Hinnateavitus tuleb järgmises versioonis"><Bell size={16} /> Teavita</button>
      </div>
    </article>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
