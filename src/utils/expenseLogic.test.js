import { describe, it, expect } from 'vitest';
import { calculateBalances, calculateMinimizedSettlements } from './expenseLogic';

describe('Expense Logic', () => {
  const users = ['Amit', 'Rahul', 'Sneha'];

  it('should correctly calculate balances for an equal split', () => {
    const expenses = [
      { amount: 300, payer: 'Amit', participants: ['Amit', 'Rahul', 'Sneha'] }
    ];
    const balances = calculateBalances(expenses, users);

    // Amit paid 300, his share is 100, so he is owed 200
    expect(balances.Amit).toBe(200);
    // Rahul's share is 100, he paid 0, so he owes 100
    expect(balances.Rahul).toBe(-100);
    // Sneha's share is 100, she paid 0, so she owes 100
    expect(balances.Sneha).toBe(-100);
  });

  it('should calculate minimized debts correctly', () => {
    // A scenario where Rahul owes Amit 100, and Sneha owes Amit 100
    const balances = {
      Amit: 200,
      Rahul: -100,
      Sneha: -100
    };
    
    const settlements = calculateMinimizedSettlements(balances);
    
    expect(settlements).toHaveLength(2);
    // Expect the array to contain transactions where Rahul and Sneha both pay Amit
    expect(settlements).toContainEqual({ debtor: 'Rahul', creditor: 'Amit', amount: 100 });
    expect(settlements).toContainEqual({ debtor: 'Sneha', creditor: 'Amit', amount: 100 });
  });
});
