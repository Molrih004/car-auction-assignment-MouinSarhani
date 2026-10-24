# API message design

The logical data objects (LDOs) of the messages between the frontend, the gateway and the services. An LDO describes what is in a message and the types, without saying how it is stored. The storage is in the [ERD](erd.md). The endpoints are in the [API specification](api-specification.md).

All messages are JSON. All times are ISO 8601 in UTC, the frontend shows them in Dutch time (NFR-15). All amounts are whole euros.

## General shape

Every service answers in the same way.

**Success**

```json
{
  "data": { },
  "meta": { "count": 0 }
}
```

`meta` is only there for lists.

**Error**

```json
{
  "error": {
    "code": "BID_TOO_LOW",
    "message": "Your bid has to be at least € 18.500.",
    "details": { "lowestAllowed": 18500 }
  }
}
```

- `code` is for the frontend, so it knows what to do (for example go back to the form).
- `message` is normal language and can be shown to the user directly (NFR-03).
- `details` is only there when it helps, for example the lowest allowed bid.

## Logical data object trees

### Auction service

```mermaid
classDiagram
    class AuctionSummary {
        id: uuid
        carId: uuid
        status: PENDING | ACTIVE | ENDED | CANCELLED
        onHold: boolean
        startingPrice: int
        currentBid: int or null
        bidCount: int
        startAt: datetime
        endAt: datetime
    }
    class AuctionDetail {
        sellerId: int
        reserveReached: boolean, seller and staff only
        reservePrice: int, seller and staff only
        createdAt: datetime
        updatedAt: datetime
    }
    class Bid {
        id: uuid
        amount: int
        placedAt: datetime
        isMine: boolean, logged in buyer only
        buyerId: int, staff only
    }
    class PlaceBidRequest {
        amount: int
    }
    class PlaceBidResponse {
        bid: Bid
        isHighest: boolean
        currentBid: int
        bidCount: int
    }
    class CreateAuctionRequest {
        carId: uuid
        startingPrice: int
        reservePrice: int
        startAt: datetime
        endAt: datetime
    }
    class StatusChangeRequest {
        status: PENDING | CANCELLED
    }
    AuctionSummary <|-- AuctionDetail : extends
    AuctionDetail "1" o-- "0..*" Bid : bid history
    PlaceBidResponse *-- Bid
```

### Car service

```mermaid
classDiagram
    class Car {
        id: uuid
        sellerId: int
        make: string
        model: string
        year: int
        color: string
        mileage: int
        condition: EXCELLENT | GOOD | FAIR
        description: string
        price: float
        createdAt: datetime
    }
    class CarRequest {
        make: string
        model: string
        year: int
        color: string
        mileage: int
        condition: EXCELLENT | GOOD | FAIR
        description: string
        price: float
    }
    class CarFilter {
        make: string, optional
        yearFrom: int, optional
        yearTo: int, optional
        condition: list, optional
    }
```

### Auth service

```mermaid
classDiagram
    class RegisterRequest {
        name: string
        email: string
        password: string
        role: BUYER | SELLER
    }
    class LoginRequest {
        email: string
        password: string
    }
    class AuthResponse {
        token: string, JWT, 7 days
        user: User
    }
    class User {
        id: int
        name: string
        email: string
        role: BUYER | SELLER | STAFF
    }
    AuthResponse *-- User
```

## Example messages for my 2 requirements

### BID-01: place a bid

`POST /auctions/{id}/bids` with the login token in the header.

Request:

```json
{ "amount": 18500 }
```

Response `201 Created`:

```json
{
  "data": {
    "bid": {
      "id": "7d1c3a52-5a1e-4a36-9c6b-0f0a4b7f2e11",
      "amount": 18500,
      "placedAt": "2026-10-16T18:42:07Z"
    },
    "isHighest": true,
    "currentBid": 18500,
    "bidCount": 9
  }
}
```

The frontend shows: "€ 18.500 at 20:42, you are now the highest bidder." (BID-04, time in Dutch summer time)

### STF-03: change the status

`PATCH /auctions/{id}/status` with the login token of a staff member.

Request:

```json
{ "status": "CANCELLED" }
```

Response `200 OK`: the whole `AuctionDetail` with the new status.

## Error codes

These come from the exception paths of the [use cases](use-case-place-bid.md).

| Code | HTTP | Message (shown to the user) | Use case path |
|---|---|---|---|
| `VALIDATION_ERROR` | 400 | "Fill in an amount in whole euros." | Bid 4a |
| `UNAUTHORIZED` | 401 | "Your login has expired. Please log in again." | Bid 2a, Status 7a |
| `FORBIDDEN_ROLE` | 403 | "Only buyers can place a bid." / "Only staff can change the status of an auction." | Bid 2b, Status 7b |
| `AUCTION_NOT_FOUND` | 404 | "We can't find this auction." | |
| `AUCTION_NOT_STARTED` | 409 | "This auction starts on [date time], you can bid from then." | Bid 3a |
| `AUCTION_CLOSED` | 409 | "This auction is closed, you can't bid anymore." | Bid 3b |
| `BID_TOO_LOW` | 409 | "Your bid has to be at least € [amount]." + `details.lowestAllowed` | Bid 4a, 5a |
| `STATUS_CHANGE_NOT_ALLOWED` | 409 | "This auction is [status] now, so it can't be changed to [new status]." | Status 8a |
| `STATUS_UNCHANGED` | 409 | "This auction is already [status]." | Status 8b |
| `NOT_YOUR_CAR` / `NOT_YOUR_AUCTION` | 403 | "You can only change your own cars." / "...your own auctions." | |
| `CAR_HAS_AUCTION` | 409 | "This car can't be removed because it has an auction that ends on 14 March." | CAR-07 |
| `AUCTION_CHECK_FAILED` | 503 | "We can't check if this car has an auction right now. Please try again in a moment." | CAR-06 |
| `SERVICE_UNAVAILABLE` | 502 | "We can't do this right now. Please try again in a moment." (made by the gateway) | Bid 5b, Status 9a |

**Why 409 for a closed auction or a too low bid:** the request itself is fine (it is a number), but it conflicts with the current state of the auction. 400 is only for a request that is wrong on its own.

## What is never in a message

- `reservePrice` is never sent to a buyer (AUC-04). Only the seller of that auction and staff get it.
- `buyerId` in the bid history is only sent to staff (BID-05, STF-07).
- `passwordHash` never leaves the auth service (NFR-12).

## Changed while building

- **`onHold` in the auction.** True after staff put an active auction back to pending. The page shows "Paused by VeloVault" and buyers get "VeloVault has paused this auction" when they bid.
- **`isMine` in the bid history.** Only for the logged in buyer, so his own bids can show "(you)" without showing anybody's name (BID-05).
- **Error codes for the car service** (`NOT_YOUR_CAR`, `CAR_HAS_AUCTION`, `AUCTION_CHECK_FAILED`), with the message Sandra asked for: "This car can't be removed because it has an auction that ends on..."
- **The DTO is made in one place:** `toAuctionDto` in the auction service decides what each user may see. It adds `currentBid` and `bidCount` (computed from the bids), and only adds `reservePrice` and `reserveReached` for the seller and staff.
