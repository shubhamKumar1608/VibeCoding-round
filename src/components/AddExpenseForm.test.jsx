import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddExpenseForm from './AddExpenseForm';

describe('AddExpenseForm Component', () => {
  const users = ['Amit', 'Rahul', 'Sneha'];

  it('submits with correct splits data when sliders total 100%', async () => {
    const onAddExpense = vi.fn();
    const user = userEvent.setup();

    render(<AddExpenseForm users={users} onAddExpense={onAddExpense} />);

    // Fill in description
    await user.type(screen.getByPlaceholderText('e.g. Dinner, Uber, Groceries'), 'Movie Tickets');

    // Fill in amount
    await user.type(screen.getByPlaceholderText('0.00'), '300');

    // The default splits (34/33/33) already total 100%, so the button is enabled
    const submitButton = screen.getByRole('button', { name: /add expense/i });
    expect(submitButton).not.toBeDisabled();

    await user.click(submitButton);

    // Verify the callback was called with a splits map
    expect(onAddExpense).toHaveBeenCalledTimes(1);
    const submitted = onAddExpense.mock.calls[0][0];
    expect(submitted.description).toBe('Movie Tickets');
    expect(submitted.amount).toBe(300);
    expect(submitted.splits).toBeDefined();

    // All split percentages should sum to 100
    const total = Object.values(submitted.splits).reduce((a, b) => a + b, 0);
    expect(total).toBe(100);
  });
});
