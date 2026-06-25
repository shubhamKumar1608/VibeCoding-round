import { useState, useMemo } from 'react';

/**
 * Distributes `totalPercent` equally across an array of users,
 * assigning any rounding remainder to the first user.
 *
 * @param {Array<string>} usersToShare
 * @param {number} totalPercent
 * @returns {Object} e.g. { Amit: 34, Rahul: 33, Sneha: 33 }
 */
function distributeEqually(usersToShare, totalPercent) {
  if (usersToShare.length === 0) return {};
  const base      = Math.floor(totalPercent / usersToShare.length);
  const remainder = totalPercent - base * usersToShare.length;
  return usersToShare.reduce((acc, user, idx) => {
    acc[user] = base + (idx === 0 ? remainder : 0);
    return acc;
  }, {});
}

/**
 * Form component to add a new expense.
 *
 * Each user has:
 *  - A checkbox to include/exclude them from the split.
 *  - A percentage slider to set their share.
 *
 * Moving a slider automatically redistributes the remaining percentage
 * proportionally among all other checked users, so the total is ALWAYS 100%.
 * Unchecking a user zeroes their share and redistributes it equally to the rest.
 *
 * @param {Array<string>} users        - List of available users.
 * @param {Function}      onAddExpense - Callback with the validated expense object.
 */
export default function AddExpenseForm({ users, onAddExpense }) {
  const [description, setDescription] = useState('');
  const [amount, setAmount]           = useState('');
  const [payer, setPayer]             = useState(users[0]);
  const [error, setError]             = useState('');

  // Track which users are participating
  const [checked, setChecked] = useState(() =>
    users.reduce((acc, u) => { acc[u] = true; return acc; }, {})
  );

  // Track each user's percentage share (always sums to 100 among checked users)
  const [splits, setSplits] = useState(() => distributeEqually(users, 100));

  const checkedUsers  = users.filter(u => checked[u]);
  const totalPercent  = useMemo(
    () => users.reduce((sum, u) => sum + (splits[u] || 0), 0),
    [splits, users]
  );
  const canSubmit = checkedUsers.length > 0; // total is always 100 when at least one is checked

  /** Toggle a user's participation; redistribute their freed percentage equally. */
  const handleCheckboxToggle = (user) => {
    const willBeChecked   = !checked[user];
    const newChecked      = { ...checked, [user]: willBeChecked };
    const newCheckedUsers = users.filter(u => newChecked[u]);

    // Redistribute 100% equally among all newly-checked users
    const newSplits = users.reduce((acc, u) => { acc[u] = 0; return acc; }, {});
    Object.assign(newSplits, distributeEqually(newCheckedUsers, 100));

    setChecked(newChecked);
    setSplits(newSplits);
  };

  /**
   * When user X's slider moves to `newValue`:
   *  1. Clamp newValue so it doesn't exceed the total available (100 − everyone else's fixed share).
   *  2. Distribute the remainder (100 − newValue) proportionally among other checked users.
   *  3. Fix any rounding drift so the grand total stays exactly 100.
   */
  const handleSliderChange = (changedUser, rawValue) => {
    const others = checkedUsers.filter(u => u !== changedUser);

    // Maximum this user can claim is 100 minus 1% for each other checked user
    const maxValue = 100 - others.length;
    const newValue = Math.min(Number(rawValue), maxValue);

    const remaining     = 100 - newValue;          // what's left for others
    const othersCurrentTotal = others.reduce((s, u) => s + (splits[u] || 0), 0);

    const newSplits = { ...splits, [changedUser]: newValue };

    if (others.length === 0) {
      // Only one person checked — they get 100%
      setSplits(newSplits);
      return;
    }

    if (othersCurrentTotal > 0) {
      // Proportional redistribution: each other user keeps their relative share
      others.forEach(u => {
        newSplits[u] = Math.round((splits[u] / othersCurrentTotal) * remaining);
      });
    } else {
      // Edge case: everyone else was at 0 — distribute equally
      Object.assign(newSplits, distributeEqually(others, remaining));
    }

    // Fix rounding drift — assign any leftover/deficit to the first other user
    const grandTotal = users.reduce((s, u) => s + (newSplits[u] || 0), 0);
    const drift = 100 - grandTotal;
    if (drift !== 0 && others.length > 0) newSplits[others[0]] += drift;

    setSplits(newSplits);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!description.trim()) { setError('Description is required'); return; }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Amount must be greater than zero');
      return;
    }

    if (checkedUsers.length === 0) {
      setError('At least one participant must be selected');
      return;
    }

    // Only include users with a non-zero split percentage
    const activeSplits = Object.fromEntries(
      Object.entries(splits).filter(([, pct]) => pct > 0)
    );

    onAddExpense({
      id: Date.now().toString(),
      description,
      amount: parsedAmount,
      payer,
      splits: activeSplits,
      date: new Date().toISOString()
    });

    // Reset form
    setDescription('');
    setAmount('');
    setPayer(users[0]);
    const resetChecked = users.reduce((acc, u) => { acc[u] = true; return acc; }, {});
    setChecked(resetChecked);
    setSplits(distributeEqually(users, 100));
  };

  return (
    <div className="card">
      <h2 className="card-title">Add Expense</h2>

      {error && <div className="form-group"><p className="text-red">{error}</p></div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Description</label>
          <input
            type="text"
            className="form-control"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Dinner, Uber, Groceries"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Amount (₹)</label>
          <input
            type="number"
            className="form-control"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            step="0.01"
            min="0.01"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Who paid?</label>
          <select
            className="form-control"
            value={payer}
            onChange={(e) => setPayer(e.target.value)}
          >
            {users.map(user => (
              <option key={user} value={user}>{user}</option>
            ))}
          </select>
        </div>

        {/* Participant checkboxes + percentage sliders */}
        <div className="form-group">
          <label className="form-label">
            Split Percentages
            {/* Show live total — always 100% when anyone is checked */}
            <span className={`split-total ${totalPercent === 100 ? 'split-ok' : 'split-error'}`}>
              &nbsp;({totalPercent}% / 100%)
            </span>
          </label>

          <div className="slider-group">
            {users.map(user => (
              <div key={user} className={`slider-row ${!checked[user] ? 'slider-row-disabled' : ''}`}>

                {/* Checkbox to include/exclude this user */}
                <label className="slider-checkbox-label">
                  <input
                    type="checkbox"
                    checked={checked[user]}
                    onChange={() => handleCheckboxToggle(user)}
                  />
                  <span className="slider-name">{user}</span>
                </label>

                {/* Slider — disabled when user is unchecked */}
                <input
                  type="range"
                  className="slider"
                  min={0}
                  max={100}
                  value={splits[user] || 0}
                  disabled={!checked[user]}
                  onChange={(e) => handleSliderChange(user, e.target.value)}
                />

                <span className="slider-value">
                  {checked[user] ? `${splits[user] || 0}%` : '—'}
                </span>
              </div>
            ))}
          </div>

          <p className="split-hint" style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            Moving a slider automatically adjusts others to keep the total at 100%.
          </p>
        </div>

        <button
          type="submit"
          className={`btn btn-primary ${!canSubmit ? 'btn-disabled' : ''}`}
          disabled={!canSubmit}
        >
          Add Expense
        </button>
      </form>
    </div>
  );
}
