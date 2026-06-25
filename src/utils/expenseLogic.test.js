import { describe, it, expect } from 'vitest';
import { calculateBalances, calculateMinimizedSettlements } from './expenseLogic';

describe('calculateBalances', () => {
  const users = ['Amit', 'Rahul', 'Sneha'];

  it('splits proportionally based on custom percentages', () => {
    // Amit pays ₹300; Amit gets 50%, Rahul 30%, Sneha 20%
    const expenses = [
      { amount: 300, payer: 'Amit', splits: { Amit: 50, Rahul: 30, Sneha: 20 } }
    ];
    const balances = calculateBalances(expenses, users);

    // Amit paid 300, his share is 50% of 300 = 150, so he is owed 150
    expect(balances.Amit).toBe(150);
    // Rahul's share is 30% of 300 = 90, he paid 0, so he owes 90
    expect(balances.Rahul).toBe(-90);
    // Sneha's share is 20% of 300 = 60, she paid 0, so she owes 60
    expect(balances.Sneha).toBe(-60);
  });

  it('handles an equal 33/33/34 split correctly', () => {
    const expenses = [
      { amount: 300, payer: 'Rahul', splits: { Amit: 34, Rahul: 33, Sneha: 33 } }
    ];
    const balances = calculateBalances(expenses, users);

    // Rahul paid 300, his share is 33% of 300 = 99, so he is owed 201
    expect(balances.Rahul).toBe(201);
    // Amit's share is 34% of 300 = 102
    expect(balances.Amit).toBe(-102);
    // Sneha's share is 33% of 300 = 99
    expect(balances.Sneha).toBe(-99);
  });
});

describe('calculateMinimizedSettlements', () => {
  it('minimizes debts correctly', () => {
    // Rahul owes Amit 90, Sneha owes Amit 60
    const balances = { Amit: 150, Rahul: -90, Sneha: -60 };

    const settlements = calculateMinimizedSettlements(balances);

    expect(settlements).toHaveLength(2);
    expect(settlements).toContainEqual({ debtor: 'Rahul', creditor: 'Amit', amount: 90 });
    expect(settlements).toContainEqual({ debtor: 'Sneha', creditor: 'Amit', amount: 60 });
  });
});
