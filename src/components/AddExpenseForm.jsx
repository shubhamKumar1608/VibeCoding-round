import { useState } from 'react';

/**
 * Form component to add a new expense.
 * Handles input collection, validation, and passes the constructed expense object to the parent.
 * 
 * @param {Array<string>} users - List of available users to select from.
 * @param {Function} onAddExpense - Callback function triggered with the new expense object upon successful validation.
 */
export default function AddExpenseForm({ users, onAddExpense }) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [payer, setPayer] = useState(users[0]);
  const [participants, setParticipants] = useState([...users]);
  const [error, setError] = useState('');

  // Toggles a user's presence in the participants array
  const handleParticipantToggle = (user) => {
    setParticipants(prev => 
      prev.includes(user) 
        ? prev.filter(p => p !== user)
        : [...prev, user]
    );
  };

  // Handles form submission, performs validation, and triggers the callback
  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Validation: Description cannot be empty
    if (!description.trim()) {
      setError('Description is required');
      return;
    }
    
    // Validation: Amount must be a valid positive number
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Amount must be greater than zero');
      return;
    }

    // Validation: At least one person must be involved in the expense
    if (participants.length === 0) {
      setError('At least one participant must be selected');
      return;
    }

    // Construct the final expense object and pass it up
    onAddExpense({
      id: Date.now().toString(),
      description,
      amount: parsedAmount,
      payer,
      participants,
      date: new Date().toISOString()
    });

    // Reset form fields back to their defaults
    setDescription('');
    setAmount('');
    setPayer(users[0]);
    setParticipants([...users]);
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

        <div className="form-group">
          <label className="form-label">Who was involved?</label>
          <div className="participants-grid">
            {users.map(user => (
              <label key={user} className="participant-label">
                <input 
                  type="checkbox"
                  checked={participants.includes(user)}
                  onChange={() => handleParticipantToggle(user)}
                />
                {user}
              </label>
            ))}
          </div>
        </div>

        <button type="submit" className="btn btn-primary">Add Expense</button>
      </form>
    </div>
  );
}
