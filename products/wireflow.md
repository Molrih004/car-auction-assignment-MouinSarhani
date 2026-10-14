# Wireflow

Wireflow for my 2 use cases: [place bid](use-case-place-bid.md) (buyer, on a phone) and [change auction status](use-case-change-auction-status.md) (staff, on a laptop). The wireframes are in [wireflow/](wireflow/), the same screens in the real look are in the [hi-fi prototype](hi-fi-prototype.md).

## Buyer: place bid

```mermaid
flowchart LR
    B1["B1 Car list<br/>with filters"]
    B2["B2 Auction page<br/>status, end time,<br/>bid form, history"]
    B3["B3 Bid too low or<br/>someone bid first"]
    B4["B4 Bid placed<br/>confirmation"]
    B5["B5 Auction closed"]
    B6["B6 Log in again"]

    B1 -- "tap a car" --> B2
    B2 -- "back, filters stay" --> B1
    B2 -- "Place bid, accepted" --> B4
    B2 -- "Place bid, too low" --> B3
    B3 -- "change amount, Place bid" --> B4
    B2 -- "Place bid, login expired" --> B6
    B6 -- "log in, amount kept" --> B2
    B2 -- "auction ended while open" --> B5
    B4 -- "Place a higher bid" --> B2
```

| Screen | Wireframe | What is on it | Use case step |
|---|---|---|---|
| B1 Car list | ![B1](wireflow/B1-car-list.png) | Filters for make, year and condition as chips that stay on. Every car with status in words and end time. | before step 1 |
| B2 Auction page | ![B2](wireflow/B2-auction-page.png) | Photo, car details, status "Open", current bid, number of bids, end time and time left. Bid form with the lowest allowed bid. Bid history without names. | 1 |
| B3 Bid too low | ![B3](wireflow/B3-bid-too-low.png) | Message above the field, the amount stays in the field, new lowest allowed bid. | 4a, 5a |
| B4 Bid placed | ![B4](wireflow/B4-bid-placed.png) | Confirmation with amount, time and "you are now the highest bidder". Updated current bid and history. | 6, 7 |
| B5 Auction closed | ![B5](wireflow/B5-auction-closed.png) | Status "Closed" in words, no bid form, message why, final price and history stay. | 3b |
| B6 Log in again | ![B6](wireflow/B6-login-expired.png) | Message that the login expired and that the bid is not lost. After logging in back to the auction. | 2a |

## Staff: change auction status

```mermaid
flowchart LR
    S1["S1 Search auctions<br/>on car, seller, email"]
    S2["S2 Auction with<br/>allowed status changes"]
    S3["S3 Are you sure?<br/>car, seller, end date, bids"]
    S4["S4 Status changed"]
    S5["S5 Change not allowed"]

    S1 -- "open auction" --> S2
    S2 -- "choose new status" --> S3
    S3 -- "No, go back" --> S2
    S3 -- "Yes, allowed" --> S4
    S3 -- "Yes, but status changed<br/>in the meantime" --> S5
    S4 -- "back to results" --> S1
    S5 -- "back to results" --> S1
```

| Screen | Wireframe | What is on it | Use case step |
|---|---|---|---|
| S1 Search auctions | ![S1](wireflow/S1-search-auctions.png) | One search field for car, seller name or email. Table like a spreadsheet with car, seller, status, end, current bid and bids. | 1 |
| S2 Auction status | ![S2](wireflow/S2-auction-status.png) | Car, seller, bids with the buyer names (only staff), reserve. Only the allowed status changes as buttons. | 2, 3, 4 |
| S3 Confirm | ![S3](wireflow/S3-confirm-cancel.png) | Dialog with car, seller, end date, bids and old and new status. "Yes" and "No, go back". | 5, 6, 6a |
| S4 Status changed | ![S4](wireflow/S4-status-changed.png) | Message with the car and the new status. | 10 |
| S5 Not allowed | ![S5](wireflow/S5-change-not-allowed.png) | Message why, the current status, and that nothing was changed. | 8a |

## Choices

- **The buyer flow is drawn for a phone** (390 px) because Tom bids on his phone. **The staff flow is for a laptop** because Sandra works at her desk with two screens.
- **Errors bring you back to where you were** (B3, B6). Tom doesn't have to start again.
- **S2 only shows the allowed changes.** That way Sandra can't even choose a change that is not allowed. S5 is still needed because the auction can end while she has the page open.
- **"Service not available" (5b, 9a)** is not a separate screen. It is the same message box as B3 and S5 with a different text.
