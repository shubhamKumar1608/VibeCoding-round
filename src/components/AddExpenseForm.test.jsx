import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddExpenseForm from './AddExpenseForm';

describe('AddExpenseForm Component', () => {
  const users = ['Amit', 'Rahul', 'Sneha'];

  it('submits when sliders of checked users total exactly 100%', async () => {
    const onAddExpense = vi.fn();
    const user = userEvent.setup();

    render(<AddExpenseForm users={users} onAddExpense={onAddExpense} />);

    await user.type(screen.getByPlaceholderText('e.g. Dinner, Uber, Groceries'), 'Movie Tickets');
    await user.type(screen.getByPlaceholderText('0.00'), '300');

    // Default splits are 34/33/33 = 100%, so submit should be enabled immediately
    const submitButton = screen.getByRole('button', { name: /add expense/i });
    expect(submitButton).not.toBeDisabled();

    await user.click(submitButton);

    expect(onAddExpense).toHaveBeenCalledTimes(1);
    const submitted = onAddExpense.mock.calls[0][0];
    expect(submitted.description).toBe('Movie Tickets');
    expect(submitted.amount).toBe(300);

    // Active splits must sum to 100
    const total = Object.values(submitted.splits).reduce((a, b) => a + b, 0);
    expect(total).toBe(100);
  });

  it('disables submit when unchecking a user makes the total drop below 100%', async () => {
    const user = userEvent.setup();

    render(<AddExpenseForm users={users} onAddExpense={vi.fn()} />);

    // Uncheck Sneha — her slider resets to 0, so total drops to 67%
    const snehaCheckbox = screen.getAllByRole('checkbox')[2];
    await user.click(snehaCheckbox);

    // Submit button should now be disabled (total is no longer 100%)
    const submitButton = screen.getByRole('button');
    expect(submitButton).toBeDisabled();
  });
});
