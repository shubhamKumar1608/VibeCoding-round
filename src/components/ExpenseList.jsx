export default function ExpenseList({ expenses }) {
  if (expenses.length === 0) {
    return (
      <div className="card mt-4">
        <h2 className="card-title">Recent Expenses</h2>
        <div className="empty-state">
          <p>No expenses added yet. Add one to get started!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card mt-4">
      <h2 className="card-title">Recent Expenses</h2>
      <div className="item-list">
        {expenses.slice().reverse().map(expense => (
          <div key={expense.id} className="list-item">
            <div className="item-details">
              <h4>{expense.description}</h4>
              <p className="item-meta">
                {expense.payer} paid ₹{expense.amount.toFixed(2)} 
                {expense.participants.length > 0 && ` for ${expense.participants.join(', ')}`}
              </p>
            </div>
            <div className="item-amount">
              ₹{expense.amount.toFixed(2)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
