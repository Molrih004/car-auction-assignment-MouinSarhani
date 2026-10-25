// The amount a buyer typed is kept per auction in sessionStorage, so it survives the trip to the login page
// (use case 1, path 2a: "the amount is still in the form"). sessionStorage is cleared when the tab closes.
const key = (auctionId: string) => `velovault.bid.${auctionId}`;

export const bidDraft = {
  get(auctionId: string): number | null {
    const value = Number(sessionStorage.getItem(key(auctionId)));
    return value > 0 ? value : null;
  },
  set(auctionId: string, amount: number | null) {
    if (amount) sessionStorage.setItem(key(auctionId), String(amount));
    else sessionStorage.removeItem(key(auctionId));
  },
};
