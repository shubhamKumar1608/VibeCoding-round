/**
 * Calculates the net running balance for each user based on a list of expenses.
 * A positive balance means the user is owed money (creditor).
 * A negative balance means the user owes money (debtor).
 *
 * Each expense now carries a `splits` map: { userName: percentage (0-100) }
 * instead of an equal-split `participants` array.
 *
 * @param {Array<Object>} expenses - List of expense objects (amount, payer, splits).
 * @param {Array<string>} users    - List of all user names.
 * @returns {Object} A map of user names to their net balance.
 */
export const calculateBalances = (expenses, users) => {
  // Initialize balances to 0 for everyone
  const balances = {};
  users.forEach(user => (balances[user] = 0));

  // Iterate over each expense to calculate the net effect on balances
  expenses.forEach(expense => {
    const { amount, payer, splits } = expense;

    // Payer gets the full amount credited to their balance
    if (balances[payer] !== undefined) {
      balances[payer] += amount;
    }

    // Each user in the splits map is debited their proportional share
    // share = (userPercentage / 100) * totalAmount
    for (const [user, percentage] of Object.entries(splits)) {
      if (balances[user] !== undefined) {
        const share = (percentage / 100) * amount;
        balances[user] -= share;
      }
    }
  });

  // Fix floating point errors (e.g. 33.333333333333336 -> 33.33)
  for (const user in balances) {
    balances[user] = Math.round(balances[user] * 100) / 100;
  }

  return balances;
};

/**
 * Calculates the minimum number of transactions needed to settle all debts.
 * It uses a greedy algorithm to match the largest debtors with the largest creditors.
 *
 * @param {Object} balances - A map of user names to their net balance.
 * @returns {Array<Object>} List of settlement transactions (debtor, creditor, amount).
 */
export const calculateMinimizedSettlements = (balances) => {
  const debtors   = [];
  const creditors = [];

  // Separate users into debtors (negative balance) and creditors (positive balance)
  for (const user in balances) {
    if (balances[user] < -0.01)  debtors.push({ user, amount: -balances[user] });
    else if (balances[user] > 0.01) creditors.push({ user, amount: balances[user] });
  }

  // Sort them for a greedy approach: matching the largest debts with largest credits
  // usually helps reduce the total number of transactions.
  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const settlements = [];
  let debtorIndex   = 0;
  let creditorIndex = 0;

  // Process until all debts are settled
  while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
    const debtor   = debtors[debtorIndex];
    const creditor = creditors[creditorIndex];

    // The maximum amount we can settle between these two is the smaller of the two balances
    const settledAmount = Math.min(debtor.amount, creditor.amount);

    settlements.push({
      debtor:   debtor.user,
      creditor: creditor.user,
      amount:   Math.round(settledAmount * 100) / 100
    });

    // Deduct the settled amount from both parties
    debtor.amount   -= settledAmount;
    creditor.amount -= settledAmount;

    // If a person's balance is fully settled (close to 0), move to the next person
    if (debtor.amount < 0.01)   debtorIndex++;
    if (creditor.amount < 0.01) creditorIndex++;
  }

  return settlements;
};
