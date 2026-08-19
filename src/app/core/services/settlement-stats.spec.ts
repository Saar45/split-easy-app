import { computeSettlementStats } from './settlement-stats';
import { GroupBalances, RemboursementSuggestion, Solde } from '../models/balance.model';

const solde = (id: number, balance: string): Solde => ({
  user: { id, prenom: `P${id}`, nom: `N${id}` },
  balance,
});

const suggestion = (fromId: number, toId: number, montant: string): RemboursementSuggestion => ({
  from: { id: fromId, prenom: `P${fromId}`, nom: `N${fromId}` },
  to: { id: toId, prenom: `P${toId}`, nom: `N${toId}` },
  montant,
});

describe('computeSettlementStats', () => {
  it('returns null for null data', () => {
    expect(computeSettlementStats(null)).toBeNull();
  });

  it('computes before as debtor x creditor pairs (nominal case)', () => {
    const data: GroupBalances = {
      soldes: [solde(1, '-30.00'), solde(2, '-15.00'), solde(3, '25.00'), solde(4, '20.00')],
      remboursements: [
        suggestion(1, 3, '25.00'),
        suggestion(1, 4, '5.00'),
        suggestion(2, 4, '15.00'),
      ],
    };
    expect(computeSettlementStats(data)).toEqual({ before: 4, after: 3, reduced: true });
  });

  it('returns null when there is no debt (empty plan)', () => {
    const data: GroupBalances = {
      soldes: [solde(1, '0.00'), solde(2, '0.00')],
      remboursements: [],
    };
    expect(computeSettlementStats(data)).toBeNull();
  });

  it('flags an already optimal plan without inflating numbers', () => {
    const data: GroupBalances = {
      soldes: [solde(1, '-10.00'), solde(2, '10.00')],
      remboursements: [suggestion(1, 2, '10.00')],
    };
    expect(computeSettlementStats(data)).toEqual({ before: 1, after: 1, reduced: false });
  });

  it('returns null when the plan is empty even with residual rounding balances', () => {
    const data: GroupBalances = {
      soldes: [solde(1, '-0.001'), solde(2, '0.001')],
      remboursements: [],
    };
    expect(computeSettlementStats(data)).toBeNull();
  });

  it('returns null when balances are inconsistent with a non-empty plan', () => {
    const data: GroupBalances = {
      soldes: [solde(1, '0.00'), solde(2, '0.00')],
      remboursements: [suggestion(1, 2, '10.00')],
    };
    expect(computeSettlementStats(data)).toBeNull();
  });

  it('ignores rounding noise below the epsilon threshold', () => {
    const data: GroupBalances = {
      soldes: [solde(1, '-20.00'), solde(2, '20.00'), solde(3, '0.004')],
      remboursements: [suggestion(1, 2, '20.00')],
    };
    expect(computeSettlementStats(data)).toEqual({ before: 1, after: 1, reduced: false });
  });
});
