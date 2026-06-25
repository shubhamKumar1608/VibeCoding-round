# Splitwise Lite

## Overview
Splitwise Lite is a lightweight, blazing-fast web application designed to help groups of friends track shared expenses and instantly know exactly who owes whom. 

## Features
- **Add Expenses**: Easily record new expenses specifying the description, amount (in ₹), payer, and involved participants.
- **Live Balances**: Instantly recalculates everyone's net standing as soon as an expense is added.
- **Minimized Settlements**: Uses a greedy algorithm to automatically calculate the fewest number of transactions needed for everyone to settle their debts.
- **Settle Up Functionality**: Allows users to quickly clear a debt with a one-click "Settle" button.
- **Responsive & Modern Design**: A clean, premium dark-mode interface that looks great on any device, complete with subtle hover interactions and micro-animations.

## Tech Stack
- **Frontend Framework**: React 19
- **Build Tool**: Vite
- **Styling**: Vanilla CSS (CSS Variables, Flexbox, CSS Grid)
- **Testing**: Vitest & React Testing Library (RTL)

## Project Structure
```text
src/
├── components/
│   ├── AddExpenseForm.jsx       # Component handling expense input & validation
│   ├── BalancesAndSettlements.jsx # Component showing net standings & settlement actions
│   └── ExpenseList.jsx          # Component rendering the ledger of past expenses
├── utils/
│   ├── expenseLogic.js          # Core algorithms (isolated for easy unit testing)
│   └── expenseLogic.test.js     # Unit tests for core algorithms
├── App.jsx                      # Main container integrating components and managing state
├── App.test.jsx                 # Integration tests
├── index.css                    # Design system, CSS variables, and global styles
└── main.jsx                     # Application entry point
```

## Architecture and Data Flow
The application follows a standard React unidirectional data flow:
1. **State Ownership**: `App.jsx` acts as the single source of truth, holding the `users` and `expenses` states.
2. **Derived State**: The `balances` object is derived from `expenses` using `useMemo` so it instantly updates when an expense is recorded without needing to store redundant state.
3. **Event Up, Props Down**: 
   - Child components receive state via props.
   - User actions (like clicking "Add Expense" in `AddExpenseForm` or "Settle" in `BalancesAndSettlements`) trigger callback functions passed from `App.jsx`, which subsequently updates the global state.

## Core Algorithms
The core business logic resides in `utils/expenseLogic.js`:
- **Balance Calculation**: Iterates over every expense to build a hash map of net balances. The payer is credited the full amount, and the amount is split equally and debited across all selected participants.
- **Debt Minimization Algorithm**: Uses a greedy algorithm that segregates users into "debtors" (negative balance) and "creditors" (positive balance). It sorts both groups by magnitude and continuously pairs the largest debtor with the largest creditor to minimize the total number of transactions required to reach $0 balances.

## Engineering Decisions
- **Vanilla CSS over Frameworks**: Chose vanilla CSS with CSS variables to construct a tailored, premium design system without the overhead of utility-class frameworks like Tailwind, ensuring complete control over micro-animations and layouts.
- **Separation of Logic**: Moved complex calculations (`calculateBalances`, `calculateMinimizedSettlements`) into a pure JavaScript utility file rather than keeping them inside React components. This enables clean, isolated Unit Testing.
- **Derived State (`useMemo`)**: Instead of storing balances in a separate `useState`, balances are re-computed dynamically using `useMemo`. This prevents UI inconsistency where balances might go out-of-sync with the expense list.

## Assumptions
- The group consists of a fixed set of users (Amit, Rahul, Sneha). Dynamic user creation is out of scope for the Lite version.
- Expense splitting is strictly *equal* amongst all selected participants. (No custom percentage or exact amount splits).
- All transactions occur in a single currency (₹).
- No backend persistence is required; data lives in React state for this session.

## Test Strategy
The application employs a comprehensive testing strategy using **Vitest** and **React Testing Library**:
1. **Unit Tests** (`expenseLogic.test.js`): Focus purely on ensuring mathematical correctness in balance generation and verifying the greedy algorithm efficiently minimizes debts.
2. **Component Tests** (`AddExpenseForm.test.jsx`): Ensures the UI logic correctly captures user input, simulates click events, and validates data structures before sending them up.
3. **Integration Tests** (`App.test.jsx`): Mounts the entire application and tests a complete user flow (adding an expense and ensuring that it accurately cascades down to update balances and recommended settlements across the app).

## Edge Cases Handled
- **Floating Point Math**: Mitigates JavaScript precision issues (e.g., `33.333333333333336`) by rounding balances and settlement amounts to exactly two decimal places.
- **Form Validation**: Blocks submissions of $0 or negative amounts. Ensures at least one participant is checked before allowing an expense creation.
- **Settle Up Neutralization**: Clicking "Settle" creates a specific balancing transaction where the debtor pays the creditor, perfectly neutralizing the debt in the ledger without overriding history.

## Future Improvements
- **Authentication & Authorization**: Introduce a user login system (e.g., using JWT or OAuth) to support multiple users, secure sessions, and private, user-specific expense tracking.
- **Persistent Storage**: Integrate a robust backend service (like Node.js/Express) and a database (like PostgreSQL or MongoDB) to store expense data persistently across sessions and devices.
