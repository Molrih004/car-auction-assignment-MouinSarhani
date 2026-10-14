# Persona: Tom Verhoeven, the buyer

This persona is based on interview 3 (Tom) and on what Marcus says about the buyers in interview 1. Requirement IDs refer to [system-requirements.md](system-requirements.md).

> "Keep it as trustworthy as it is now, but make it as fast as the big platforms."

## Who is Tom

| | |
|---|---|
| **Age** | 47 |
| **Job** | GP (huisarts) in Breda |
| **Family** | Married, two teenagers |
| **Hobby** | Collecting French cars from the 60s and 70s, mostly Peugeot and Citroën |
| **With VeloVault** | 4 years, bought 5 cars |
| **Device** | Phone most of the time, laptop to read a car's details properly |
| **Tech skills** | High. Does banking and holidays on his phone, uses 2 or 3 other auction sites |

## Context

Tom has busy days at the practice. He looks at cars in the evening on the sofa when the house is quiet, or in the 10 minutes between two patients. So he has little time and is often on a small screen. When he finds a car he is serious about, he opens it again on his laptop.

He is red-green colour-blind. Open and closed in green and red look almost the same to him.

In the last hour of an auction his heart rate goes up. For him bidding is a bit of an adrenaline thing.

Marcus says buyers like Tom are mostly men between 40 and 70, a lot of them professionals. Some print the newsletter, others like Tom do everything online. A third of the buyers live in Belgium.

## Goals

| Goal | Requirement |
|---|---|
| Quickly find French cars from before 1980 in good or excellent condition | BRW-02 |
| See how competitive an auction is: current bid, number of bids and time left | BRW-04, BRW-06 |
| Place a bid and know straight away that it worked and that he is the highest bidder | BID-01, BID-04 |
| See what other buyers bid, so he knows what a car is worth | BID-05 |
| Look back at auctions he lost and see the final price | BID-06 |
| Stay anonymous, so other collectors don't know what he is after | BID-05, NFR-14 |

## Frustrations

| Frustration | From the interview | Requirement |
|---|---|---|
| Filters reset when he goes back to the list | "I don't have time for that between patients" | BRW-03 |
| Unclear end time | He missed an auction because he thought it ended in the evening, it closed at noon | BRW-06 |
| A bid equal to the current bid was accepted on another site | "it just accepted it, which created a whole mess" | BID-02 |
| Bidding on an auction that had already ended, the page didn't refresh | "nothing happened" | BID-03 |
| Status shown only in green and red | "Just write it out. Open, closed, starts on Friday. Words work." | BRW-05 |
| With the newsletter he sent a bid and just hoped it arrived | | BID-04 |

## What this means for the design

- Phone first, but the auction page must also read well on a laptop (NFR-01)
- Status always in words, never colour only (BRW-05)
- The bid form checks the amount and says what the lowest allowed bid is (BID-02)
- After bidding a clear confirmation with amount, time and "you are the highest bidder" (BID-04)
- No names in the bid history (BID-05)
- Calm design, no "ONLY 2 HOURS LEFT!!!" (NFR-04). Tom likes the speed of big platforms, but not the flea market feeling.
