import { useState, useEffect } from 'react';
import './App.css';
import { SUPERMARKETS, LABELS, SUPERMARKET_WEIGHTS } from './data/businessRules.js';
import { calculateBoxes, calculatePallets, sumMultiInput } from './utils/calculations.js';

const STORAGE_KEY = 'mushroom-calc-v2';
const DEFAULT_QUICK  = { supermarket: 'Coles', weight: '200g', label: 'VIC', trays: '' };
const DEFAULT_FORM   = { supermarket: 'Coles', weight: '200g', label: 'VIC', input: '' };

function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function ResultCard({ supermarket, weight, label, trays }) {
  const boxes = calculateBoxes(supermarket, weight, trays);
  const displayBoxes = Math.round(boxes * 10) / 10;
  const { fullPallets, remainder, showLastPallet } = calculatePallets(boxes);

  return (
    <div className="result-card">
      <div className="result-header">
        <span className="tag">{supermarket}</span>
        <span className="tag">{weight}</span>
        <span className="tag tag-label">{label}</span>
      </div>
      <div className="result-stats">
        <div className="stat-item">
          <div className="stat-value">{trays}</div>
          <div className="stat-label">Trays</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{displayBoxes}</div>
          <div className="stat-label">Boxes</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{fullPallets}</div>
          <div className="stat-label">Full Pallets</div>
        </div>
      </div>
      {showLastPallet && (
        <div className="last-pallet-alert">
          Last pallet: <strong>{remainder}</strong> / 72 boxes
        </div>
      )}
    </div>
  );
}

function OrderForm({ value, onChange, onSubmit, submitLabel }) {
  const weights = SUPERMARKET_WEIGHTS[value.supermarket] || [];

  function handleSupermarketChange(e) {
    const s = e.target.value;
    const available = SUPERMARKET_WEIGHTS[s] || [];
    const w = available.includes(value.weight) ? value.weight : available[0];
    onChange({ ...value, supermarket: s, weight: w });
  }

  return (
    <div className="order-form">
      <div className="form-row">
        <label>
          Supermarket
          <select value={value.supermarket} onChange={handleSupermarketChange}>
            {SUPERMARKETS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label>
          Weight
          <select
            value={value.weight}
            onChange={(e) => onChange({ ...value, weight: e.target.value })}
          >
            {weights.map((w) => (
              <option key={w}>{w}</option>
            ))}
          </select>
        </label>
        <label>
          Label
          <select
            value={value.label}
            onChange={(e) => onChange({ ...value, label: e.target.value })}
          >
            {LABELS.map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="form-row input-row">
        <label className="label-trays">
          Trays
          <input
            type="text"
            inputMode="numeric"
            placeholder="e.g. 12 15 9 8"
            value={value.input}
            onChange={(e) => onChange({ ...value, input: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSubmit();
            }}
          />
        </label>
        <button className="btn-primary" onClick={onSubmit}>
          {submitLabel}
        </button>
      </div>
    </div>
  );
}

function QuickForm({ value, onChange }) {
  const weights = SUPERMARKET_WEIGHTS[value.supermarket] || [];

  function handleSupermarketChange(e) {
    const s = e.target.value;
    const available = SUPERMARKET_WEIGHTS[s] || [];
    const w = available.includes(value.weight) ? value.weight : available[0];
    onChange({ ...value, supermarket: s, weight: w });
  }

  return (
    <div className="order-form">
      <div className="form-row">
        <label>
          Supermarket
          <select value={value.supermarket} onChange={handleSupermarketChange}>
            {SUPERMARKETS.map((s) => <option key={s}>{s}</option>)}
          </select>
        </label>
        <label>
          Weight
          <select value={value.weight} onChange={(e) => onChange({ ...value, weight: e.target.value })}>
            {weights.map((w) => <option key={w}>{w}</option>)}
          </select>
        </label>
        <label>
          Label
          <select value={value.label} onChange={(e) => onChange({ ...value, label: e.target.value })}>
            {LABELS.map((l) => <option key={l}>{l}</option>)}
          </select>
        </label>
      </div>
      <div className="form-row">
        <label className="label-trays">
          Trays
          <input
            type="number"
            min="1"
            placeholder="Enter trays"
            value={value.trays}
            onChange={(e) => onChange({ ...value, trays: e.target.value })}
          />
        </label>
      </div>
    </div>
  );
}

const WEIGHT_ORDER = ['200g', '375g', '500g', '650g', 'Brown'];

function TotalSummary({ orders }) {
  const rows = WEIGHT_ORDER.map((weight) => {
    const matching = orders.filter((o) => o.weight === weight);
    const rawBoxes = matching.reduce(
      (sum, o) => sum + calculateBoxes(o.supermarket, o.weight, o.trays),
      0
    );
    const displayBoxes = Math.round(rawBoxes * 10) / 10;
    const { fullPallets } = calculatePallets(rawBoxes);
    return { weight, displayBoxes, fullPallets };
  });

  const grandRawBoxes = orders.reduce(
    (sum, o) => sum + calculateBoxes(o.supermarket, o.weight, o.trays),
    0
  );
  const grandBoxes = Math.round(grandRawBoxes * 10) / 10;
  const { fullPallets: grandPallets } = calculatePallets(grandRawBoxes);

  return (
    <div className="summary-card">
      <div className="summary-title">Total Summary</div>
      {rows.map(({ weight, displayBoxes, fullPallets }) => (
        <div key={weight} className="summary-row">
          <span className="summary-label">{weight} total</span>
          <span className="summary-values">
            <span>Boxes: <strong className="summary-num">{displayBoxes}</strong></span>
            <span>Pallets: <strong className="summary-num">{fullPallets}</strong></span>
          </span>
        </div>
      ))}
      <div className="summary-row summary-grand">
        <span className="summary-label">Grand total</span>
        <span className="summary-values">
          <span>Boxes: <strong className="summary-num">{grandBoxes}</strong></span>
          <span>Pallets: <strong className="summary-num">{grandPallets}</strong></span>
        </span>
      </div>
    </div>
  );
}

export default function App() {
  const saved = loadSaved();

  const [mode, setMode] = useState(saved?.mode ?? 'quick');
  const [quickForm, setQuickForm] = useState(saved?.quickForm ?? { ...DEFAULT_QUICK });
  const [detailForm, setDetailForm] = useState({ ...DEFAULT_FORM });
  const [orders, setOrders] = useState(saved?.orders ?? []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ mode, quickForm, orders }));
  }, [mode, quickForm, orders]);

  function handleAddOrder() {
    const trays = sumMultiInput(detailForm.input);
    if (!trays) return;
    setOrders((prev) => [...prev, { ...detailForm, trays, id: Date.now() }]);
    setDetailForm((prev) => ({ ...prev, input: '' }));
  }

  function removeOrder(id) {
    setOrders((prev) => prev.filter((o) => o.id !== id));
  }

  function resetQuick() {
    setQuickForm({ ...DEFAULT_QUICK });
  }

  function resetDetailed() {
    setOrders([]);
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Mushroom Calculator</h1>
      </header>

      <nav className="mode-tabs">
        <button
          className={`tab ${mode === 'quick' ? 'active' : ''}`}
          onClick={() => setMode('quick')}
        >
          Quick Orders
        </button>
        <button
          className={`tab ${mode === 'detailed' ? 'active' : ''}`}
          onClick={() => setMode('detailed')}
        >
          Detailed Orders
        </button>
        <button
          className={`tab ${mode === 'summary' ? 'active' : ''}`}
          onClick={() => setMode('summary')}
        >
          Total Summary
        </button>
      </nav>

      <main className="app-main">
        {mode === 'quick' && (
          <section>
            <div className="section-header">
              <button className="btn-reset-section" onClick={resetQuick}>Reset</button>
            </div>
            <QuickForm value={quickForm} onChange={setQuickForm} />
            {Number(quickForm.trays) > 0 && (
              <ResultCard
                supermarket={quickForm.supermarket}
                weight={quickForm.weight}
                label={quickForm.label}
                trays={Number(quickForm.trays)}
              />
            )}
          </section>
        )}

        {mode === 'detailed' && (
          <section>
            <div className="section-header">
              <button className="btn-reset-section" onClick={resetDetailed}>Reset</button>
            </div>
            <OrderForm
              value={detailForm}
              onChange={setDetailForm}
              onSubmit={handleAddOrder}
              submitLabel="Add / Sum"
            />
            {orders.length > 0 && (
              <div className="orders-list">
                {orders.map((order) => (
                  <div key={order.id} className="order-item">
                    <ResultCard
                      supermarket={order.supermarket}
                      weight={order.weight}
                      label={order.label}
                      trays={order.trays}
                    />
                    <button
                      className="btn-remove"
                      onClick={() => removeOrder(order.id)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
        {mode === 'summary' && (
          <section>
            <TotalSummary orders={orders} />
          </section>
        )}
      </main>
    </div>
  );
}
