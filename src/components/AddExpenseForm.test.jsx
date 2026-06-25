import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddExpenseForm from './AddExpenseForm';

describe('AddExpenseForm Component', () => {
  const users = ['Amit', 'Rahul', 'Sneha'];

  it('should submit form with correct expense data', async () => {
    const onAddExpense = vi.fn();
    const user = userEvent.setup();
    
    render(<AddExpenseForm users={users} onAddExpense={onAddExpense} />);

    // Fill the description
    const descInput = screen.getByPlaceholderText('e.g. Dinner, Uber, Groceries');
    await user.type(descInput, 'Movie Tickets');

    // Fill the amount
    const amountInput = screen.getByPlaceholderText('0.00');
    await user.type(amountInput, '300');

    // Click submit
    const submitButton = screen.getByRole('button', { name: /add expense/i });
    await user.click(submitButton);

    // Verify onAddExpense was called with the correct data
    expect(onAddExpense).toHaveBeenCalledTimes(1);
    
    const submittedExpense = onAddExpense.mock.calls[0][0];
    expect(submittedExpense).toMatchObject({
      description: 'Movie Tickets',
      amount: 300,
      payer: 'Amit', // Default payer
      participants: ['Amit', 'Rahul', 'Sneha'] // Default participants are all users
    });
  });
});
