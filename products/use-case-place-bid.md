# Use case 1: Place bid

The use case "Place bid" from the [use case diagram](system-context-diagrams.md), filled in with the use case template. Requirement IDs refer to [system-requirements.md](system-requirements.md). The persona is [Tom](persona-buyer.md).

| Use Case Specification | #1 |
|---|---|
| **Use Case Name** | Place bid |
| **Actor(s)** | Buyer (primary) |
| **Summary Description** | A buyer places a bid on an auction that is open. The system checks the bid and, when it is accepted, shows a confirmation and adds it to the bid history. |
| **Priority** | Must Have |
| **Status** | High level of detail |
| **Pre-Condition** | The buyer is logged in with the role buyer.<br>The buyer has the auction page open. |
| **Post-Condition(s)** | The bid is saved with the amount, the time and the buyer.<br>The bid is the new highest bid of the auction.<br>The bid shows in the bid history without the name of the buyer. |
| **Basic Path** | 1. The buyer enters an amount in the bid form and presses "Place bid".<br>2. The system checks that the buyer is logged in and has the role buyer.<br>3. The system checks that the auction is active.<br>4. The system checks that the amount is higher than the current highest bid. If there are no bids yet, the amount must be at least the starting price.<br>5. The system saves the bid with the amount, the time and the buyer.<br>6. The system shows a confirmation: the amount, the time in Dutch time and "You are now the highest bidder".<br>7. The system shows the new current bid, the number of bids and the bid in the bid history. |
| **Alternative Paths** | 2a. The login has expired. The system asks the buyer to log in again. After logging in the buyer is back on the auction page and the amount is still in the form. Continue at step 1. |
| **Exception Paths** | 2b. The user is not a buyer (seller or staff). Nothing is saved. The system shows "Only buyers can place a bid." The use case ends.<br>3a. The auction is pending. Nothing is saved. The system shows "This auction starts on [date and time], you can bid from then." The use case ends.<br>3b. The auction is ended or cancelled. Nothing is saved. The system shows "This auction is closed, you can't bid anymore." and the page shows the status "Closed". The use case ends.<br>4a. The amount is too low or not a number. Nothing is saved. The system shows "Your bid has to be at least € [lowest allowed amount]." The amount stays in the form. Continue at step 1.<br>5a. Another buyer placed a higher or equal bid just before. Nothing is saved. The system shows the new current bid and the new lowest allowed amount. Continue at step 1.<br>5b. The auction service is not available. Nothing is saved. The system shows "We can't place your bid right now. Please try again in a moment." The use case ends. |
| **Business Rules** | B1: Only a logged in buyer can bid (ACC-04, BID-01).<br>B2: Bids are only possible on an active auction (BID-03).<br>B3: A bid must be higher than the current highest bid (BID-02).<br>B4: The first bid must be at least the starting price (BID-02).<br>B5: When 2 bids come in at the same moment, only the first one is accepted (BID-07).<br>B6: Other users never see who placed a bid (BID-05, NFR-14).<br>B7: The reserve price is never shown to the buyer (AUC-04). |
| **Non-Functional Requirements** | NF1: Messages are in normal language and say what the buyer can do, no error codes (NFR-03).<br>NF2: Status is written in words, not only a colour (BRW-05).<br>NF3: Times are saved in UTC and shown in Dutch time (NFR-15).<br>NF4: The bid form works on a phone of 360 px wide (NFR-01).<br>NF5: All checks are done on the server, not only in the browser (ACC-05).<br>NF6: If the auction service is down the buyer sees a message, not a blank page (NFR-10). |

Sources: interview 3 (Tom), interview 1 (Marcus), interview 4 (Sandra), interview 5 (Erik).

## Notes on my choices

- **Login expired is an alternative path.** The buyer logs in again and can still place the bid, so the use case still ends well. The other paths don't reach the goal, so they are exception paths.
- **5a is on purpose.** Tom bids in the last hour when more people are bidding. If someone else was just faster, the bid has to be refused, otherwise two bids can have the same amount (BID-07). This is what went wrong on the other site Tom talks about.
- **Pending and closed have different messages (3a, 3b).** Tom tried to bid on an auction that had already ended and "nothing happened". The message has to say why, and for a pending auction also when he can bid.
- **The amount stays in the form (2a, 4a).** In the last hour Tom has no time to type everything again.
- **The confirmation in step 6** comes from Tom ("I want to see straight away that it worked") and from Sandra, who gets a lot of calls with "did you get my bid?".
