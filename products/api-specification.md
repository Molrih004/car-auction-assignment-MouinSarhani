# API specification

Overview of all endpoints. The full OpenAPI specs per microservice are in [api-spec/](api-spec/), the messages and error codes are in [api-message-design.md](api-message-design.md).

The frontend only talks to the gateway on `http://localhost:3000`. The gateway checks the login token, adds `X-User-Id` and `X-User-Role` to the request and forwards it to the right service. If a service is down the gateway answers `502` (NFR-10).

| Service | Port | OpenAPI file |
|---|---|---|
| Auth service | 4001 | [auth-service.yaml](api-spec/auth-service.yaml) |
| Car service | 4000 | [car-service.yaml](api-spec/car-service.yaml) |
| Auction service (new) | 4002 | [auction-service.yaml](api-spec/auction-service.yaml) |

## Auth service

| Method | Path | Who | What | Requirement |
|---|---|---|---|---|
| POST | `/auth/register` | everyone | Register as buyer or seller | ACC-01, ACC-03 |
| POST | `/auth/login` | everyone | Log in, get a JWT | ACC-02 |
| GET | `/auth/me` | logged in | The logged in user | ACC-02 |
| GET | `/auth/users` | staff | All users, for the staff screens | STF-01 |

## Car service

| Method | Path | Who | What | Requirement |
|---|---|---|---|---|
| GET | `/cars` | everyone | List cars, filter on make, year and condition | BRW-01, BRW-02 |
| GET | `/cars/{id}` | everyone | One car | BRW-04 |
| POST | `/cars` | seller | Add a car | CAR-01 |
| PUT | `/cars/{id}` | own seller, staff | Change a car | CAR-05 |
| DELETE | `/cars/{id}` | own seller, staff | Delete a car, not with a pending or active auction | CAR-06, CAR-07, STF-06 |

## Auction service

| Method | Path | Who | What | Requirement |
|---|---|---|---|---|
| GET | `/auctions` | everyone | List auctions | BRW-01 |
| GET | `/auctions/{id}` | everyone | One auction, reserve only for seller and staff | BRW-04, AUC-04, AUC-08 |
| POST | `/auctions` | seller | Create an auction, starts as pending | AUC-01, AUC-03 |
| PATCH | `/auctions/{id}` | seller, staff | Change dates or prices while pending | |
| DELETE | `/auctions/{id}` | seller, staff | Delete a pending auction without bids | AUC-09 |
| **PATCH** | **`/auctions/{id}/status`** | **staff** | **Change the status** | **STF-03**, STF-04 |
| GET | `/auctions/{id}/bids` | everyone | Bid history, no names (staff sees buyer id) | BID-05, BID-06 |
| **POST** | **`/auctions/{id}/bids`** | **buyer** | **Place a bid** | **BID-01**, BID-02, BID-03, BID-07 |

The 2 endpoints in bold are my 2 requirements.

## CRUD

The brief asks for 2 services with CRUD:

| | Create | Read | Update | Delete |
|---|---|---|---|---|
| Car service | `POST /cars` | `GET /cars`, `GET /cars/{id}` | `PUT /cars/{id}` | `DELETE /cars/{id}` |
| Auction service | `POST /auctions`, `POST /auctions/{id}/bids` | `GET /auctions`, `GET /auctions/{id}`, `GET /auctions/{id}/bids` | `PATCH /auctions/{id}`, `PATCH /auctions/{id}/status` | `DELETE /auctions/{id}` |

## Status codes

| Code | When |
|---|---|
| 200 | OK |
| 201 | Created (car, auction, bid) |
| 204 | Deleted |
| 400 | The request is wrong on its own, for example the amount is not a number |
| 401 | Not logged in or the login expired |
| 403 | Logged in, but the role can't do this |
| 404 | Not found |
| 409 | Not possible in the current state, for example the auction is closed or the bid is too low |
| 502 | The service behind the gateway is down |

## Changed while building

- `GET /auth/users` was added for the staff screens, so they can show the names of the seller and the buyers.
- `onHold` was added to the auction and `isMine` to the bid history (see [api-message-design.md](api-message-design.md)).
- The gateway always forwards `/auth/login` and `/auth/register` without the token, so an old token in the browser never blocks logging in.
- Deleting a car can also answer `503 AUCTION_CHECK_FAILED` when the auction service doesn't answer within 2 seconds. The car is then not deleted.
