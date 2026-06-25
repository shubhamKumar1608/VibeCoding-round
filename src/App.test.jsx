import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

describe('App Integration', () => {
  it('adds an expense and updates balances successfully', async () => {
    const user = userEvent.setup();
    render(<App />);

    // 1. Add an expense of ₹150 paid by Amit, split among Amit, Rahul, Sneha
    const descInput = screen.getByPlaceholderText('e.g. Dinner, Uber, Groceries');
    await user.type(descInput, 'Pizza');

    const amountInput = screen.getByPlaceholderText('0.00');
    await user.type(amountInput, '150');

    // Note: Amit is the default payer, and everyone is selected by default

    const submitButton = screen.getByRole('button', { name: /add expense/i });
    await user.click(submitButton);

    // 2. Verify the expense appears in the list
    expect(screen.getByText('Pizza')).toBeInTheDocument();
    
    // 3. Verify the balances are updated correctly
    // Amit paid 150, his share is 50. So he gets back +100
    // Rahul and Sneha each owe 50, so they are -50
    expect(screen.getByText('+₹100.00')).toBeInTheDocument();
    expect(screen.getAllByText('-₹50.00')).toHaveLength(2);

    // 4. Verify the settlement recommendation appears
    expect(screen.getAllByText(/Rahul/)).not.toHaveLength(0); // Rahul appears multiple times
    expect(screen.getAllByText(/owes/)).not.toHaveLength(0);
    expect(screen.getAllByText('Amit')).not.toHaveLength(0);
  });
});
