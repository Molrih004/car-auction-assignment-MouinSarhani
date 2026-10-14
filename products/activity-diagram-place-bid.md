# Activity diagram: Place bid

Activity diagram for [use case 1: Place bid](use-case-place-bid.md). It has 4 swimlanes: the buyer, the frontend in the browser, the API gateway and the auction service. The numbers like (3a) are the step numbers from the use case.

```mermaid
flowchart TB
    subgraph buyer["Buyer"]
        start((Start))
        b1["Enter amount and press<br/>Place bid (1)"]
        b2["Log in again (2a)"]
        done((End))
    end

    subgraph frontend["Frontend"]
        f1{"Amount filled in<br/>and a number?"}
        f2["Send bid to the gateway<br/>with the login token"]
        f3["Ask to log in again,<br/>keep the amount"]
        f4["Show error message<br/>from the server"]
        f5["Show confirmation: amount, time,<br/>you are the highest bidder (6)"]
        f6["Update current bid,<br/>number of bids and history (7)"]
        f7["Show: we can't place your bid<br/>right now, try again (5b)"]
    end

    subgraph gateway["API gateway"]
        g1{"Token valid?"}
        g2{"Auction service<br/>reachable?"}
    end

    subgraph auction["Auction service"]
        a1{"Role is buyer? (2)"}
        a2{"Status of<br/>the auction? (3)"}
        a3{"Amount higher than current bid,<br/>first bid at least starting price? (4)"}
        a4{"Still the highest<br/>when saving? (5)"}
        a5["Save bid with amount,<br/>time and buyer (5)"]
        e1["Error: only buyers<br/>can place a bid (2b)"]
        e2["Error: starts on<br/>date and time (3a)"]
        e3["Error: auction is closed (3b)"]
        e4["Error: bid has to be<br/>at least lowest amount (4a)"]
        e5["Error: someone bid first,<br/>new lowest amount (5a)"]
    end

    start --> b1 --> f1
    f1 -- no --> f4
    f1 -- yes --> f2 --> g1
    g1 -- no --> f3 --> b2 --> b1
    g1 -- yes --> g2
    g2 -- no --> f7 --> done
    g2 -- yes --> a1
    a1 -- no --> e1
    a1 -- yes --> a2
    a2 -- pending --> e2
    a2 -- "ended or cancelled" --> e3
    a2 -- active --> a3
    a3 -- no --> e4
    a3 -- yes --> a4
    a4 -- no --> e5
    a4 -- yes --> a5 --> f5 --> f6 --> done
    e1 --> f4
    e2 --> f4
    e3 --> f4
    e4 --> f4
    e5 --> f4
    f4 -- "amount too low or<br/>someone bid first" --> b1
    f4 -- "wrong role or<br/>auction not open" --> done
```

## How to read it

- **Every check that matters is in the auction service** (2, 3, 4, 5). The frontend only checks if something is filled in, so Tom gets a quick message. The real rules are on the server (ACC-05), so nobody can get around them by changing the page.
- **The gateway checks the token first.** If it is expired, the buyer logs in again and the amount stays (2a). The auction service never gets a request without a valid login.
- **"Still the highest when saving?" (5a)** is checked at the moment the bid is saved. Two buyers can press at the same time in the last minute. Only the first one is saved (BID-07).
- **Two kinds of errors go back to different places.** A bid that is too low or too late goes back to the form, so Tom can bid again right away. A wrong role or a closed auction ends the use case.
- **If the auction service is down** the gateway answers with an error and the frontend shows a normal message, not a blank page (5b, NFR-10).
