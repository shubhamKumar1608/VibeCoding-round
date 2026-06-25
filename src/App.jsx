import { useState, useMemo } from 'react';
import AddExpenseForm from './components/AddExpenseForm';
import ExpenseList from './components/ExpenseList';
import BalancesAndSettlements from './components/BalancesAndSettlements';
import { calculateBalances } from './utils/expenseLogic';

const INITIAL_USERS = ['Amit', 'Rahul', 'Sneha'];

function App() {
  const [users] = useState(INITIAL_USERS);
  const [expenses, setExpenses] = useState([]);

  const balances = useMemo(() => calculateBalances(expenses, users), [expenses, users]);

  const handleAddExpense = (expense) => {
    setExpenses(prev => [...prev, expense]);
  };

  const handleSettleUp = (debtor, creditor, amount) => {
    // A settlement is modelled as the debtor paying 100% of the amount,
    // with the creditor absorbing 100% of the cost — perfectly cancelling the debt.
    const settlementExpense = {
      id: Date.now().toString(),
      description: `Settlement: ${debtor} → ${creditor}`,
      amount: amount,
      payer: debtor,
      splits: { [creditor]: 100 }, // Creditor absorbs 100% of this settlement
      date: new Date().toISOString()
    };

    setExpenses(prev => [...prev, settlementExpense]);
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>Splitwise Lite</h1>
        <p>Keep track of shared expenses easily</p>
      </header>

      <div className="main-grid">
        <div className="left-column">
          <AddExpenseForm 
            users={users} 
            onAddExpense={handleAddExpense} 
          />
        </div>
        
        <div className="right-column">
          <BalancesAndSettlements 
            balances={balances} 
            onSettleUp={handleSettleUp}
          />
          <ExpenseList 
            expenses={expenses} 
          />
        </div>
      </div>
    </div>
  );
}

export default App;
