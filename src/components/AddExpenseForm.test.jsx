import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddExpenseForm from './AddExpenseForm';

describe('AddExpenseForm Component', () => {
  const users = ['Amit', 'Rahul', 'Sneha'];

  it('submits with splits that sum to 100% by default', async () => {
    const onAddExpense = vi.fn();
    const user = userEvent.setup();

    render(<AddExpenseForm users={users} onAddExpense={onAddExpense} />);

    await user.type(screen.getByPlaceholderText('e.g. Dinner, Uber, Groceries'), 'Movie Tickets');
    await user.type(screen.getByPlaceholderText('0.00'), '300');

    // Default: all 3 users checked, sliders auto-distribute to 100%
    const submitButton = screen.getByRole('button', { name: /add expense/i });
    expect(submitButton).not.toBeDisabled();

    await user.click(submitButton);

    expect(onAddExpense).toHaveBeenCalledTimes(1);
    const submitted = onAddExpense.mock.calls[0][0];
    expect(submitted.description).toBe('Movie Tickets');
    expect(submitted.amount).toBe(300);
    expect(submitted.splits).toBeDefined();

    // The active splits must always total exactly 100
    const total = Object.values(submitted.splits).reduce((a, b) => a + b, 0);
    expect(total).toBe(100);
  });

  it('unchecking a user redistributes their share so total stays 100%', async () => {
    const onAddExpense = vi.fn();
    const user = userEvent.setup();

    render(<AddExpenseForm users={users} onAddExpense={onAddExpense} />);

    await user.type(screen.getByPlaceholderText('e.g. Dinner, Uber, Groceries'), 'Lunch');
    await user.type(screen.getByPlaceholderText('0.00'), '200');

    // Uncheck Sneha — her share should be redistributed to Amit and Rahul
    const snehaCheckbox = screen.getAllByRole('checkbox')[2]; // Sneha is 3rd
    await user.click(snehaCheckbox);

    await user.click(screen.getByRole('button', { name: /add expense/i }));

    expect(onAddExpense).toHaveBeenCalledTimes(1);
    const submitted = onAddExpense.mock.calls[0][0];

    // Sneha should not be in splits (or be 0)
    expect(submitted.splits['Sneha'] ?? 0).toBe(0);

    // Total of remaining splits is still 100
    const total = Object.values(submitted.splits).reduce((a, b) => a + b, 0);
    expect(total).toBe(100);
  });
});
