import { useState, useMemo } from 'react';

/**
 * Builds the default splits map: each user gets an equal share of 100%.
 * If 3 users, each gets ~33% with the remainder assigned to the first user.
 * 
 * @param {Array<string>} users
 * @returns {Object} e.g. { Amit: 34, Rahul: 33, Sneha: 33 }
 */
function buildDefaultSplits(users) {
  const base = Math.floor(100 / users.length);
  const remainder = 100 - base * users.length;
  return users.reduce((acc, user, idx) => {
    acc[user] = base + (idx === 0 ? remainder : 0);
    return acc;
  }, {});
}

/**
 * Form component to add a new expense.
 * Each user has a percentage slider. Sliders must total exactly 100%
 * before the submit button becomes active.
 *
 * @param {Array<string>} users - List of available users.
 * @param {Function} onAddExpense - Callback with the validated expense object.
 */
export default function AddExpenseForm({ users, onAddExpense }) {
  const [description, setDescription] = useState('');
  const [amount, setAmount]           = useState('');
  const [payer, setPayer]             = useState(users[0]);
  const [splits, setSplits]           = useState(() => buildDefaultSplits(users));
  const [error, setError]             = useState('');

  // Sum of all slider values — must equal 100 for submission to be allowed
  const totalPercentage = useMemo(
    () => users.reduce((sum, user) => sum + (splits[user] || 0), 0),
    [splits, users]
  );

  const isBalanced = totalPercentage === 100;

  /**
   * Updates a single user's slider and adjusts the others proportionally
   * so the total always stays close to 100%.
   */
  const handleSliderChange = (changedUser, newValue) => {
    setSplits(prev => ({ ...prev, [changedUser]: Number(newValue) }));
  };

  // Handles form submission, performs validation, and triggers the callback
  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Validation: Description cannot be empty
    if (!description.trim()) { setError('Description is required'); return; }

    // Validation: Amount must be a valid positive number
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Amount must be greater than zero');
      return;
    }

    // Validation: Sliders must total exactly 100% (guaranteed by button disable, but double-check)
    if (!isBalanced) {
      setError('Percentages must total exactly 100%');
      return;
    }

    // Only include users with a non-zero split percentage
    const activeSplits = Object.fromEntries(
      Object.entries(splits).filter(([, pct]) => pct > 0)
    );

    // Construct the final expense object and pass it up
    onAddExpense({
      id: Date.now().toString(),
      description,
      amount: parsedAmount,
      payer,
      splits: activeSplits,   // { userName: percentage }
      date: new Date().toISOString()
    });

    // Reset form fields back to their defaults
    setDescription('');
    setAmount('');
    setPayer(users[0]);
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

        {/* Percentage split sliders — must collectively total 100% */}
        <div className="form-group">
          <label className="form-label">
            Split Percentages
            <span className={`split-total ${isBalanced ? 'split-ok' : 'split-error'}`}>
              &nbsp;({totalPercentage}% / 100%)
            </span>
          </label>

          <div className="slider-group">
            {users.map(user => (
              <div key={user} className="slider-row">
                <span className="slider-name">{user}</span>
                <input
                  type="range"
                  className="slider"
                  min={0}
                  max={100}
                  value={splits[user] || 0}
                  onChange={(e) => handleSliderChange(user, e.target.value)}
                />
                <span className="slider-value">{splits[user] || 0}%</span>
              </div>
            ))}
          </div>

          {!isBalanced && (
            <p className="split-hint">
              Adjust sliders so the total is exactly 100% to enable submission.
            </p>
          )}
        </div>

        {/* Submit is disabled until sliders total exactly 100% */}
        <button
          type="submit"
          className={`btn btn-primary ${!isBalanced ? 'btn-disabled' : ''}`}
          disabled={!isBalanced}
        >
          {isBalanced ? 'Add Expense' : `Total must be 100% (currently ${totalPercentage}%)`}
        </button>
      </form>
    </div>
  );
}
