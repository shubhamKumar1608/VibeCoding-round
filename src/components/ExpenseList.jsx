/**
 * Renders the list of all recorded expenses in reverse chronological order.
 * Shows who paid, the split breakdown by percentage, and the total amount.
 */
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
        {expenses.slice().reverse().map(expense => {
          // Format the split breakdown, e.g. "Amit 50%, Rahul 30%, Sneha 20%"
          const splitSummary = Object.entries(expense.splits)
            .map(([user, pct]) => `${user} ${pct}%`)
            .join(', ');

          return (
            <div key={expense.id} className="list-item">
              <div className="item-details">
                <h4>{expense.description}</h4>
                <p className="item-meta">
                  {expense.payer} paid ₹{expense.amount.toFixed(2)}
                  {splitSummary && ` · ${splitSummary}`}
                </p>
              </div>
              <div className="item-amount">
                ₹{expense.amount.toFixed(2)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
