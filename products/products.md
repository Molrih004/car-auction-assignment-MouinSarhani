# Products: VeloVault sprint 2

This folder is the techspecs report of the second sprint of the VeloVault auction platform. Someone who wasn't there should be able to build and test the platform from it. It starts with the users and their needs, then the requirements, then the design of the screens, and ends with the data, architecture and API.

I built 2 requirements:

- **BID-01**: a buyer places a bid on an open auction.
- **STF-03**: staff change the status of an auction.

Every product below links back to the requirement IDs in the [system requirements](system-requirements.md).

## Reading order

| # | Product | File | What it answers |
|---|---|---|---|
| 1 | System requirements | [system-requirements.md](system-requirements.md) | What the stakeholders need, with ID, stakeholder and MoSCoW priority, the 2 chosen requirements, open questions and assumptions |
| 2 | Persona | [persona-buyer.md](persona-buyer.md) | Who Tom (buyer) is, his goals and frustrations |
| 3 | Journey map | [journey-map-buyer.md](journey-map-buyer.md) | What Tom does, thinks and feels from searching a car to the end of the auction |
| 4 | System context diagrams | [system-context-diagrams.md](system-context-diagrams.md) | Use case diagram and level 0 DFD: the boundary of the platform |
| 5 | Use case 1 | [use-case-place-bid.md](use-case-place-bid.md) | Place bid: basic, alternative and exception paths (BID-01) |
| 6 | Use case 2 | [use-case-change-auction-status.md](use-case-change-auction-status.md) | Change auction status (STF-03) |
| 7 | Activity diagram | [activity-diagram-place-bid.md](activity-diagram-place-bid.md) | Where each check of use case 1 happens: frontend, gateway or service |
| 8 | Wireflow | [wireflow.md](wireflow.md) | The screens of both use cases and how the user moves between them |
| 9 | Hi-fi prototype | [hi-fi-prototype.md](hi-fi-prototype.md) | The screens in the real look, with the heuristics per screen |
| 10 | UXD test | [uxd-test.md](uxd-test.md) | Test plan, script, questions, results and findings |
| 11 | ERD | [erd.md](erd.md) | The data per service database |
| 12 | Component diagram | [component-diagram.md](component-diagram.md) | The microservice architecture |
| 13 | API message design | [api-message-design.md](api-message-design.md) | Logical data objects, example messages, error codes |
| 14 | API specification | [api-specification.md](api-specification.md) + [api-spec/](api-spec/) | All endpoints, and an OpenAPI file per service |

## How the products connect

One requirement can be followed through the whole report. For BID-01:

requirement BID-01 → use case 1 (steps and paths) → activity diagram (the checks per lane) → wireflow B2 to B5 → prototype screens → ERD tables AUCTION and BID → message `PlaceBidRequest` / `PlaceBidResponse` → `POST /auctions/{id}/bids` → code in `code/backend/auction-service/src/services/BidService.ts`.

How to run the code and a demo of both requirements: [code/setup.md](../code/setup.md).

## Changed while building

A few designs changed when the code was written. Each file that changed has a "Changed while building" section that says what and why: the ERD (`on_hold`, unique bid amount), the component diagram (HTTP instead of Redis for deleting a car, SvelteKit), the API (`onHold`, `isMine`, `GET /auth/users`) and use case 2 (paused auctions).
