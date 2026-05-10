import { useState, useEffect } from 'react';
import './App.css';
import { SUPERMARKETS, LABELS, SUPERMARKET_WEIGHTS, SUPERMARKET_LABELS, SUPERMARKET_COLOURS } from './data/businessRules.js';
import { calculateBoxes, calculatePallets, parseNumberInput } from './utils/calculations.js';

// Version suffix lets us reset persisted state cleanly if the saved data shape changes.
const STORAGE_KEY = 'mushroom-calc-v3';
const DEFAULT_QUICK  = { supermarket: 'Coles', weight: '200g', label: 'VIC', trays: '' };
const DEFAULT_FORM   = { supermarket: 'Coles', weight: '200g', label: 'VIC', input: '' };

// Try/catch guards against corrupt or outdated JSON in localStorage.
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
  const displayBoxes = Math.round(boxes);
  const { fullPallets, remainder, showLastPallet } = calculatePallets(boxes);
  const accent = SUPERMARKET_COLOURS[supermarket] ?? '#64748b';

  return (
    <div className="result-card" style={{ '--sm-accent': accent }}>
      <div className="result-header">
        <span className="tag tag-supermarket">{supermarket}</span>
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
  const labels = SUPERMARKET_LABELS[value.supermarket] || [];

  function handleSupermarketChange(e) {
    const s = e.target.value;
    const availableWeights = SUPERMARKET_WEIGHTS[s] || [];
    const availableLabels = SUPERMARKET_LABELS[s] || [];
    const w = availableWeights.includes(value.weight) ? value.weight : availableWeights[0];
    const l = availableLabels.includes(value.label) ? value.label : availableLabels[0];
    onChange({ ...value, supermarket: s, weight: w, label: l });
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
            {labels.map((l) => (
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
            inputMode="decimal"
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
  const labels = SUPERMARKET_LABELS[value.supermarket] || [];

  function handleSupermarketChange(e) {
    const s = e.target.value;
    const availableWeights = SUPERMARKET_WEIGHTS[s] || [];
    const availableLabels = SUPERMARKET_LABELS[s] || [];
    const w = availableWeights.includes(value.weight) ? value.weight : availableWeights[0];
    const l = availableLabels.includes(value.label) ? value.label : availableLabels[0];
    onChange({ ...value, supermarket: s, weight: w, label: l });
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
            {labels.map((l) => <option key={l}>{l}</option>)}
          </select>
        </label>
      </div>
      <div className="form-row">
        <label className="label-trays">
          Trays
          <input
            type="text"
            inputMode="decimal"
            placeholder="e.g. 12 15 9"
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
    const displayBoxes = Math.round(rawBoxes);
    const { fullPallets } = calculatePallets(rawBoxes);
    return { weight, displayBoxes, fullPallets, rawBoxes };
  });

  const grandBoxes = Math.round(rows.reduce((sum, r) => sum + r.rawBoxes, 0));
  const grandPallets = rows.reduce((sum, r) => sum + r.fullPallets, 0);

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

function OrderCard({ order, onRemove, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    supermarket: order.supermarket,
    weight: order.weight,
    label: order.label,
    input: String(order.trays),
  });

  function handleSupermarketChange(e) {
    const s = e.target.value;
    const availableWeights = SUPERMARKET_WEIGHTS[s] || [];
    const availableLabels = SUPERMARKET_LABELS[s] || [];
    const w = availableWeights.includes(editForm.weight) ? editForm.weight : availableWeights[0];
    const l = availableLabels.includes(editForm.label) ? editForm.label : availableLabels[0];
    setEditForm((prev) => ({ ...prev, supermarket: s, weight: w, label: l }));
  }

  function handleSave() {
    const trays = parseNumberInput(editForm.input);
    if (!trays) return;
    onUpdate({ ...order, supermarket: editForm.supermarket, weight: editForm.weight, label: editForm.label, trays });
    setEditing(false);
  }

  function handleCancel() {
    setEditForm({
      supermarket: order.supermarket,
      weight: order.weight,
      label: order.label,
      input: String(order.trays),
    });
    setEditing(false);
  }

  const weights = SUPERMARKET_WEIGHTS[editForm.supermarket] || [];
  const labels = SUPERMARKET_LABELS[editForm.supermarket] || [];

  return (
    <div className="order-item">
      {editing ? (
        <div className="order-form">
          <div className="form-row">
            <label>
              Supermarket
              <select value={editForm.supermarket} onChange={handleSupermarketChange}>
                {SUPERMARKETS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </label>
            <label>
              Weight
              <select value={editForm.weight} onChange={(e) => setEditForm((prev) => ({ ...prev, weight: e.target.value }))}>
                {weights.map((w) => <option key={w}>{w}</option>)}
              </select>
            </label>
            <label>
              Label
              <select value={editForm.label} onChange={(e) => setEditForm((prev) => ({ ...prev, label: e.target.value }))}>
                {labels.map((l) => <option key={l}>{l}</option>)}
              </select>
            </label>
          </div>
          <div className="form-row input-row">
            <label className="label-trays">
              Trays
              <input
                type="text"
                inputMode="decimal"
                placeholder="e.g. 12 15 9"
                value={editForm.input}
                onChange={(e) => setEditForm((prev) => ({ ...prev, input: e.target.value }))}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); }}
              />
            </label>
          </div>
          <div className="card-actions">
            <button className="btn-primary card-action-save" onClick={handleSave}>Save</button>
            <button className="btn-remove" onClick={handleCancel}>Cancel</button>
          </div>
        </div>
      ) : (
        <>
          <ResultCard
            supermarket={order.supermarket}
            weight={order.weight}
            label={order.label}
            trays={order.trays}
          />
          <div className="card-actions">
            <button className="btn-edit" onClick={() => setEditing(true)}>Edit</button>
            <button className="btn-remove" onClick={onRemove}>Remove</button>
          </div>
        </>
      )}
    </div>
  );
}

export default function App() {
  const saved = loadSaved();

  const [mode, setMode] = useState(saved?.mode ?? 'quick');
  const [quickForm, setQuickForm] = useState(saved?.quickForm ?? { ...DEFAULT_QUICK });
  // detailForm is intentionally not persisted — workers should always start
  // a new order entry fresh rather than accidentally re-submitting old values.
  const [detailForm, setDetailForm] = useState({ ...DEFAULT_FORM });
  const [orders, setOrders] = useState(saved?.orders ?? []);

  // Sync to localStorage whenever mode, quickForm, or orders change so state
  // survives a page refresh on the production floor tablet.
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ mode, quickForm, orders }));
  }, [mode, quickForm, orders]);

  function handleAddOrder() {
    const trays = parseNumberInput(detailForm.input);
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

  function updateOrder(id, updated) {
    setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)));
  }

  function resetDetailed() {
    setOrders([]);
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Production Optimisation Calculator</h1>
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
            {/* Quick mode auto-calculates on every keystroke — no submit button needed */}
            {parseNumberInput(quickForm.trays) > 0 && (
              <ResultCard
                supermarket={quickForm.supermarket}
                weight={quickForm.weight}
                label={quickForm.label}
                trays={parseNumberInput(quickForm.trays)}
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
                  <OrderCard
                    key={order.id}
                    order={order}
                    onRemove={() => removeOrder(order.id)}
                    onUpdate={(updated) => updateOrder(order.id, updated)}
                  />
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
