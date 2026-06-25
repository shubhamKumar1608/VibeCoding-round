import { calculateMinimizedSettlements } from '../utils/expenseLogic';

export default function BalancesAndSettlements({ balances, onSettleUp }) {
  const settlements = calculateMinimizedSettlements(balances);
  const users = Object.keys(balances);

  return (
    <div className="card">
      <h2 className="card-title">Live Balances & Settlements</h2>
      
      <div className="mb-4">
        <h4 className="form-label" style={{marginBottom: '0.5rem'}}>Net Standing</h4>
        <div className="item-list" style={{gap: '0.5rem'}}>
          {users.map(user => {
            const balance = balances[user];
            if (Math.abs(balance) < 0.01) {
              return <div key={user} className="list-item" style={{padding: '0.5rem 1rem'}}>
                <span>{user}</span> <span className="item-amount" style={{color: 'inherit'}}>Settled up</span>
              </div>;
            }
            return (
              <div key={user} className="list-item" style={{padding: '0.5rem 1rem'}}>
                <span>{user}</span>
                <span className={`item-amount ${balance > 0 ? 'amount-positive' : 'amount-negative'}`}>
                  {balance > 0 ? '+' : '-'}₹{Math.abs(balance).toFixed(2)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <h4 className="form-label" style={{marginBottom: '0.5rem'}}>Who owes whom</h4>
        {settlements.length === 0 ? (
          <div className="empty-state" style={{padding: '1.5rem 1rem'}}>
            <p>Everyone is settled up!</p>
          </div>
        ) : (
          <div className="item-list">
            {settlements.map((s, idx) => (
              <div key={idx} className="list-item settlement-item">
                <span className="settlement-text">
                  <strong>{s.debtor}</strong> owes <strong>{s.creditor}</strong> <span className="amount-negative">₹{s.amount.toFixed(2)}</span>
                </span>
                <button 
                  className="btn btn-primary"
                  style={{padding: '0.25rem 0.75rem', width: 'auto', fontSize: '0.875rem'}}
                  onClick={() => onSettleUp(s.debtor, s.creditor, s.amount)}
                >
                  Settle
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
