# Use case 2: Change auction status

The use case "Change auction status" from the [use case diagram](system-context-diagrams.md), filled in with the use case template. Requirement IDs refer to [system-requirements.md](system-requirements.md).

| Use Case Specification | #2 |
|---|---|
| **Use Case Name** | Change auction status |
| **Actor(s)** | Staff (primary) |
| **Summary Description** | A staff member changes the status of an auction, for example to cancel it when the car was damaged or to put it back to pending when the seller set a wrong date. The system only allows the status changes that are in the rules. |
| **Priority** | Must Have |
| **Status** | High level of detail |
| **Pre-Condition** | The staff member is logged in with the role staff.<br>The auction exists. |
| **Post-Condition(s)** | The auction has the new status.<br>The new status is shown to buyers and to the seller.<br>When the auction is cancelled or back to pending, no new bids are accepted. |
| **Basic Path** | 1. The staff member searches for the auction on car, seller or email and opens it.<br>2. The system shows the auction with the car (make, model, year), the seller, the end date, the current status and the number of bids.<br>3. The system shows only the status changes that are allowed from the current status.<br>4. The staff member chooses the new status.<br>5. The system asks "Are you sure?" and shows the car, the seller, the end date, the number of bids, the current status and the new status.<br>6. The staff member confirms.<br>7. The system checks that the user is staff.<br>8. The system checks that the change is allowed from the current status.<br>9. The system saves the new status.<br>10. The system shows "The status of [make model year] is now [new status]." |
| **Alternative Paths** | 6a. The staff member presses "No, go back". Nothing changes and the system shows the auction again. The use case ends.<br>7a. The login has expired. The staff member logs in again and gets back to the confirmation of step 5. Continue at step 6. |
| **Exception Paths** | 7b. The user is not staff. Nothing changes. The system shows "Only staff can change the status of an auction." The use case ends.<br>8a. The change is not allowed, for example the auction has ended in the meantime. Nothing changes. The system shows "This auction is [current status] now, so it can't be changed to [new status]." and the current status. The use case ends.<br>8b. The auction already has the new status, for example because the same change was sent twice. Nothing changes and the system shows "This auction is already [status]." The use case ends.<br>9a. The auction service is not available. Nothing changes. The system shows "We can't change the status right now. Please try again in a moment." The use case ends. |
| **Business Rules** | B1: Only staff can change the status in this use case (ACC-04, STF-03).<br>B2: An auction always has one of these statuses: pending, active, ended or cancelled (AUC-05).<br>B3: Staff can change active to pending, pending to cancelled and active to cancelled (STF-03).<br>B4: Pending to active and active to ended are done by the system at the start and end time, not by staff (AUC-06).<br>B5: Ended and cancelled auctions can't be changed anymore (STF-03).<br>B6: Pending can't go straight to ended (STF-03).<br>B7: Before the change, the system asks for confirmation and shows the car, seller and end date (STF-04).<br>B8: Bids that were placed stay saved when an active auction goes back to pending (assumption, see open question 2 in the requirements). |
| **Non-Functional Requirements** | NF1: The answer comes within 2 seconds (NFR-07).<br>NF2: Messages are in normal language, Sandra has to be able to read them out to a seller on the phone (NFR-03).<br>NF3: Doing the same change twice gives the same result as once (NFR-11).<br>NF4: The rules are checked on the server, not only on the page (ACC-05).<br>NF5: Status is written in words, not only with a colour (BRW-05). |

Sources: interview 4 (Sandra), interview 1 (Marcus), interview 5 (Erik).

## Allowed changes in this use case

| Current status | Staff can change to |
|---|---|
| Pending | Cancelled |
| Active | Pending, Cancelled |
| Ended | nothing |
| Cancelled | nothing |

## Notes on my choices

- **Step 3 only shows the allowed changes.** That prevents mistakes before they happen. Step 8 checks it again on the server, because the status can change in between (for example the auction ends while Sandra has the page open).
- **The confirmation shows a lot (step 5).** Sandra once closed the wrong auction because two Porsche 911s were next to each other in the spreadsheet. Make, model, year, seller and end date together make it clear which auction it is.
- **8b is there because of Erik.** A message can be handled twice, so the same change twice must not do anything strange like cancelling twice.
- **What happens to bids when an auction goes back to pending** is not answered in the interviews. I chose to keep them, because deleting bids can't be undone. This is still an open question for Sandra.
