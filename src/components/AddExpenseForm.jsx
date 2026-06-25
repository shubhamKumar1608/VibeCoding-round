import { useState, useMemo } from 'react';

/**
 * Builds the default splits map: equal share across all users.
 * Assigns rounding remainder to the first user.
 *
 * @param {Array<string>} users
 * @returns {Object} e.g. { Amit: 34, Rahul: 33, Sneha: 33 }
 */
function buildDefaultSplits(users) {
  const base      = Math.floor(100 / users.length);
  const remainder = 100 - base * users.length;
  return users.reduce((acc, user, idx) => {
    acc[user] = base + (idx === 0 ? remainder : 0);
    return acc;
  }, {});
}

/**
 * Form component to add a new expense.
 *
 * Each user has:
 *  - A checkbox to include / exclude them from the split.
 *  - A percentage slider to manually set their share.
 *
 * The submit button is enabled only when the sum of all checked
 * users' sliders equals exactly 100%.
 *
 * @param {Array<string>} users        - List of available users.
 * @param {Function}      onAddExpense - Callback with the validated expense object.
 */
export default function AddExpenseForm({ users, onAddExpense }) {
  const [description, setDescription] = useState('');
  const [amount, setAmount]           = useState('');
  const [payer, setPayer]             = useState(users[0]);
  const [error, setError]             = useState('');

  // Which users are participating
  const [checked, setChecked] = useState(() =>
    users.reduce((acc, u) => { acc[u] = true; return acc; }, {})
  );

  // Each user's manual slider value (0-100)
  const [splits, setSplits] = useState(() => buildDefaultSplits(users));

  // Sum of slider values for checked users only
  const totalPercent = useMemo(
    () => users.reduce((sum, u) => sum + (checked[u] ? (splits[u] || 0) : 0), 0),
    [splits, checked, users]
  );

  const isBalanced = totalPercent === 100;

  /** Toggle a user's checkbox. Resets their slider to 0 when excluded. */
  const handleCheckboxToggle = (user) => {
    const willBeChecked = !checked[user];
    setChecked(prev => ({ ...prev, [user]: willBeChecked }));
    // Clear slider value when a user is excluded
    if (!willBeChecked) {
      setSplits(prev => ({ ...prev, [user]: 0 }));
    }
  };

  /** Update a single user's slider value directly — no auto-redistribution. */
  const handleSliderChange = (user, newValue) => {
    setSplits(prev => ({ ...prev, [user]: Number(newValue) }));
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

    if (!isBalanced) {
      setError('Percentages must total exactly 100%');
      return;
    }

    // Only include checked users with a non-zero split
    const activeSplits = Object.fromEntries(
      users
        .filter(u => checked[u] && splits[u] > 0)
        .map(u => [u, splits[u]])
    );

    onAddExpense({
      id: Date.now().toString(),
      description,
      amount: parsedAmount,
      payer,
      splits: activeSplits,
      date: new Date().toISOString()
    });

    // Reset form to defaults
    setDescription('');
    setAmount('');
    setPayer(users[0]);
    setChecked(users.reduce((acc, u) => { acc[u] = true; return acc; }, {}));
    setSplits(buildDefaultSplits(users));
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
            Split Percentages&nbsp;
            <span className={`split-total ${isBalanced ? 'split-ok' : 'split-error'}`}>
              ({totalPercent}% / 100%)
            </span>
          </label>

          <div className="slider-group">
            {users.map(user => (
              <div key={user} className={`slider-row ${!checked[user] ? 'slider-row-disabled' : ''}`}>

                {/* Checkbox to include / exclude this user */}
                <label className="slider-checkbox-label">
                  <input
                    type="checkbox"
                    checked={checked[user]}
                    onChange={() => handleCheckboxToggle(user)}
                  />
                  <span className="slider-name">{user}</span>
                </label>

                {/* Slider is disabled when user is unchecked */}
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

          {!isBalanced && (
            <p className="split-hint">
              Adjust sliders so the total is exactly 100% to enable submission.
            </p>
          )}
        </div>

        {/* Disabled until sliders of checked users total exactly 100% */}
        <button
          type="submit"
          className={`btn btn-primary ${!isBalanced ? 'btn-disabled' : ''}`}
          disabled={!isBalanced}
        >
          {isBalanced ? 'Add Expense' : `Total must be 100% (currently ${totalPercent}%)`}
        </button>
      </form>
    </div>
  );
}
