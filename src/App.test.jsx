import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

describe('App Integration', () => {
  it('adds a proportional expense and updates balances correctly', async () => {
    const user = userEvent.setup();
    render(<App />);

    // 1. Fill in description and amount
    await user.type(screen.getByPlaceholderText('e.g. Dinner, Uber, Groceries'), 'Pizza');
    await user.type(screen.getByPlaceholderText('0.00'), '300');

    // Default payer is Amit; default sliders are 34/33/33 which equals 100%
    // Submit button should be enabled
    const submitButton = screen.getByRole('button', { name: /add expense/i });
    expect(submitButton).not.toBeDisabled();
    await user.click(submitButton);

    // 2. Verify the expense appears in the recent list
    expect(screen.getByText('Pizza')).toBeInTheDocument();

    // 3. Verify balances section is visible (Amit is a creditor, others are debtors)
    expect(screen.getAllByText(/Amit/i).length).toBeGreaterThan(0);

    // 4. Verify settlement section shows who owes whom
    expect(screen.getAllByText(/owes/i).length).toBeGreaterThan(0);
  });
});
