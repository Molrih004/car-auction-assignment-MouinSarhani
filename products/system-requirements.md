# System requirements VeloVault

I made these requirements from the 5 interviews in [interviews.md](../assignment/interviews.md). Every requirement has an ID, the person who asked for it and a priority.

Priority uses MoSCoW:

- **M** = Must, the platform doesn't work without it
- **S** = Should, important but it can wait if there is no time
- **C** = Could, nice to have
- **W** = Won't, not in this sprint

Some numbers were not in the interviews, so I picked them myself. You can find them under [Assumptions](#assumptions).

## Requirements I will build

I do this assignment alone, so I build 2 requirements.

| ID | Requirement | Why |
|---|---|---|
| **BID-01** | A logged in buyer can place a bid on an auction that is open. | Tom's main task. In the old process he mailed a bid and didn't know if it arrived. Half of Sandra's phone calls are about this. |
| **STF-03** | Staff can change the status of an auction, but only in the ways that are allowed (see [status table](#allowed-status-changes)). | Sandra has to do this when a seller picked the wrong date or a car got damaged. It has clear rules so it can be tested. |

These go together with the 2 above, without them the feature is not complete:

| ID | Short |
|---|---|
| BID-02 | Bid must be higher than the current bid, first bid at least the starting price |
| BID-03 | No bids when the auction is not open |
| BID-04 | Confirmation after bidding |
| BID-05 | Bid history without names |
| AUC-05 | Auction status is pending, active, ended or cancelled |
| STF-04 | Confirm before cancelling, show which car |
| ACC-04 | Only buyers can bid, only staff can change status |

## Accounts (ACC)

| ID | Requirement | Who | Prio |
|---|---|---|---|
| ACC-01 | Someone can register as a buyer or seller with name, email and password without help from staff. | Marcus, Sandra | M |
| ACC-02 | A user can log in and log out. | Marcus | M |
| ACC-03 | There are 3 roles: buyer, seller and staff. You can't register yourself as staff. | Marcus | M |
| ACC-04 | A user can only do what their role allows. Only buyers bid, only sellers add cars and auctions, only staff can change other people's things. | Marcus | M |
| ACC-05 | The server checks the role, not only the website. | Marcus, Erik | M |
| ACC-06 | A user can reset their password without calling VeloVault. | Sandra | S |
| ACC-07 | When the login expired the user gets a clear message and has to log in again. What they were typing is not lost. | Erik, Diane | S |

## Cars (CAR)

| ID | Requirement | Who | Prio |
|---|---|---|---|
| CAR-01 | A seller can add a car with make, model, year, colour, condition, mileage, description and estimated value. | Diane | M |
| CAR-02 | Condition is chosen from excellent, good or fair. The page explains what each one means. | Diane | S |
| CAR-03 | A seller can upload at least 50 photos per car. | Diane | M |
| CAR-04 | The description can be long (5000 characters) and can be pasted from Word. | Diane | S |
| CAR-05 | A seller can see and change their own cars. | Diane | M |
| CAR-06 | A seller can delete their own car, but not when it has a pending or active auction. | Diane, Sandra | M |
| CAR-07 | If a car can't be deleted the message explains why, for example "This car has an auction that ends on 14 March". | Diane, Sandra | M |

## Auctions (AUC)

| ID | Requirement | Who | Prio |
|---|---|---|---|
| AUC-01 | A seller can create an auction for their own car with starting price, reserve price, start date and end date. | Diane | M |
| AUC-02 | The form explains the difference between starting price and reserve price. | Diane, Sandra | S |
| AUC-03 | The end date must be after the start date. The reserve price can't be lower than the starting price. | Diane | M |
| AUC-04 | The reserve price is never shown to buyers. | Diane | M |
| AUC-05 | An auction always has one of these statuses: pending, active, ended or cancelled. | Sandra | M |
| AUC-06 | An auction becomes active at the start time and ends at the end time by itself, also at night. | Marcus, Erik | M |
| AUC-07 | When the auction ends, the highest bid wins only if it reached the reserve price. | Diane | M |
| AUC-08 | The seller can see the current bid, how many bids there are and if the reserve price is reached. | Diane | M |
| AUC-09 | A seller can't withdraw an auction when there are already bids. The page shows that people are bidding. | Diane | M |

## Browsing (BRW)

| ID | Requirement | Who | Prio |
|---|---|---|---|
| BRW-01 | Everyone can see the list of cars with an auction, also without an account. | Marcus, Tom | M |
| BRW-02 | The list can be filtered on make, year (from/to) and condition. | Tom | M |
| BRW-03 | Filters stay the same when the buyer opens a car and goes back. | Tom | S |
| BRW-04 | The auction page shows the car, the photos, the status, the end time, the current bid and the number of bids. | Tom | M |
| BRW-05 | The status is written in words like "Open", "Closed" or "Starts Friday 14:00", not only with a colour. | Tom | M |
| BRW-06 | In the last 24 hours the page also shows how much time is left. | Tom | S |

## Bidding (BID)

| ID | Requirement | Who | Prio |
|---|---|---|---|
| BID-01 | A logged in buyer can place a bid on an auction that is open. | Tom | M |
| BID-02 | A bid must be higher than the current highest bid. The first bid must be at least the starting price. If the bid is too low the message tells the lowest amount that is allowed. | Tom | M |
| BID-03 | Bids are refused when the auction is pending, ended or cancelled. The page says why. | Tom | M |
| BID-04 | After bidding the buyer directly sees their amount, the time, and that they are the highest bidder now. | Tom, Marcus | M |
| BID-05 | The auction shows a bid history with amount and time, but not who placed the bid. | Tom, Marcus | M |
| BID-06 | Bid history and final price can still be seen after the auction ended. | Tom | S |
| BID-07 | When 2 buyers bid at the same moment only one bid is accepted. | Tom | M |
| BID-08 | A buyer gets a message when someone outbids them. | Tom | W |

## Staff (STF)

| ID | Requirement | Who | Prio |
|---|---|---|---|
| STF-01 | Staff can see all cars, auctions and users. | Sandra | M |
| STF-02 | Staff can search on name, email or car. | Sandra | S |
| STF-03 | Staff can change the status of an auction, only in the allowed ways. | Sandra | M |
| STF-04 | Before staff cancel or change an auction, the system asks "are you sure" and shows the car (make, model, year), the seller and the end date. | Sandra | M |
| STF-05 | Staff see a list of users with role, register date, number of cars and number of bids. The list can be sorted and filtered. | Sandra | S |
| STF-06 | Staff can remove a car that is fraud. | Marcus | M |
| STF-07 | Staff can see who placed a bid, other users can't. | Sandra, Marcus | S |
| STF-08 | Marcus can see on his phone which auctions are running, which end soon and if the reserve is reached. | Marcus | C |

### Allowed status changes

This is for STF-03 and AUC-06.

| From | To | By |
|---|---|---|
| pending | active | system, at start time |
| active | ended | system, at end time |
| active | pending | staff |
| pending | cancelled | staff |
| active | cancelled | staff |

Not allowed:

- anything from **ended** (Sandra: "You can't reopen an auction that's already ended")
- anything from **cancelled**
- **pending** straight to **ended**

## Quality (NFR)

| ID | Type | Requirement | Who | Prio |
|---|---|---|---|---|
| NFR-01 | Usability | All pages work on a phone (360px wide), tablet and laptop. | Tom, Marcus | M |
| NFR-02 | Usability | Pages still work when zoomed in to 200%. | Diane | S |
| NFR-03 | Usability | Error messages are normal language and tell what to do. No error codes like 409. | Diane, Sandra | M |
| NFR-04 | Usability | Calm design, no blinking banners or red capital letters. The car photos are the main thing. | Marcus | S |
| NFR-05 | Usability | Website in Dutch and English. | Marcus | S |
| NFR-06 | Performance | Car list and auction page load in 2 seconds on a phone. | Tom | S |
| NFR-07 | Performance | When something is deleted or changed the user gets an answer within 2 seconds. | Sandra | M |
| NFR-08 | Capacity | Works with 3000 users and 100 auctions per month. | Marcus | M |
| NFR-09 | Reliability | Available at least 99% of the time, no maintenance during active auctions. | Erik, Marcus | M |
| NFR-10 | Reliability | When one service is down the rest keeps working and the user sees a message, not a white page. | Erik | M |
| NFR-11 | Reliability | Handling the same message twice gives the same result as once (no double cancel). | Erik | M |
| NFR-12 | Security | Passwords are saved hashed. | Marcus | M |
| NFR-13 | Security | Login token is a JWT checked by the gateway and is valid for 7 days. | Erik | M |
| NFR-14 | Privacy | Other users can't see who bid on or bought a car. | Marcus, Tom | M |
| NFR-15 | Data | Times are saved in UTC and shown in Dutch time, also with summer/winter time. | Erik | M |

## Constraints from IT (CON)

From the interview with Erik. These are not wishes but how the system has to be built.

| ID | Constraint |
|---|---|
| CON-01 | Separate services for auth, cars, auctions and a gateway. Each has its own database. |
| CON-02 | The frontend only talks to the gateway. The gateway talks to the services with HTTP. |
| CON-03 | When a car is deleted the car service asks the auction service through Redis if there is an auction. Max 5 seconds waiting. |
| CON-04 | SQLite has to be replaced before going live. |

## Open questions

Things the stakeholders don't agree on or didn't answer. I need to ask these.

1. **Deleting a car when the auction service doesn't answer.** Erik wants to delete it anyway after 5 seconds. Sandra says a car with a live auction should never be deleted and she wants an answer in 2 seconds. These don't fit together.
2. **Active back to pending (STF-03).** What happens with the bids that are already placed? Do they stay or are they removed?
3. **Can buyers see that the reserve is reached?** Diane only says buyers don't need to know the amount.
4. **Curation.** Marcus wants staff to check the cars but they shouldn't become a bottleneck. Check before or after a car is online?
5. **Buyer and seller in one account?** Not clear from the interviews.
6. **Blocking users.** Sandra wants to find people who abuse the platform. Can she also block them?
7. **Is 99% enough?** That's still about 7 hours down per month, and Marcus is worried about auctions ending at night.

## Assumptions

| Assumption | Reason | Used in |
|---|---|---|
| Phone screen of 360px | Tom and Marcus use their phone the most | NFR-01 |
| 2 seconds | Sandra says "a couple of seconds at most" | NFR-06, NFR-07 |
| 3000 users, 100 auctions per month | Newsletter has 3000 people, Marcus wants to go from 50 to 100 | NFR-08 |
| Time left in the last 24 hours | Tom wants to see it "when it gets close" | BRW-06 |
| 5000 characters description | Diane writes "a full page" | CAR-04 |
| Browsing without account, bidding with account | Nobody said it but it is normal for auctions | BRW-01, BID-01 |
| Cancelled can't change anymore | Sandra only said it about ended, but cancelled is also final | STF-03 |

## Not in this sprint

- Payment and transfer of the car
- Message when outbid (BID-08, Tom says "for later")
- French language, Marcus says Dutch and English is enough
