# UXD test

Usability test of the [hi-fi prototype](hi-fi-prototype.md) for place bid and change auction status. This file has the plan, the script, the questions and the findings of the first round.

## 1. Plan

### What I want to find out

| # | Question | Requirement |
|---|---|---|
| G1 | Can a buyer place a bid without help and does he know straight away that it worked? | BID-01, BID-04 |
| G2 | Does a buyer understand what to do when his bid is too low? | BID-02, NFR-03 |
| G3 | Does a buyer see that an auction is closed, without relying on colour? | BID-03, BRW-05 |
| G4 | Can staff change the status of the right auction, and do they check the confirmation? | STF-03, STF-04 |
| G5 | Does the design feel calm and trustworthy? | NFR-04 |

### Participants

3 to 5 people. Sandra offered the regulars at the monthly viewing day, but for this test I use people I can reach this week:

| Role in the test | Who | Why |
|---|---|---|
| Buyer | 2 or 3 people who buy things online on their phone | Like Tom |
| Staff | 1 or 2 people who work with spreadsheets or a back office | Like Sandra |

### Setup

- **Buyer tasks** on a phone, with the prototype open in the browser at `#b1`.
- **Staff tasks** on a laptop, with the prototype open at `#s1`.
- About 15 minutes per person.
- I watch and write down what happens. I don't help unless someone is stuck for more than 1 minute.
- Think aloud: the participant says what they think while they do the task.

### What I measure

| Measure | How |
|---|---|
| Task done | Yes / with help / no |
| Mistakes | Wrong tap or click, going back |
| Time | Roughly, in seconds |
| Confidence | After each task: "How sure are you that it worked?" from 1 (not sure) to 5 (very sure) |

## 2. Script

**Start (2 min)**

> Thanks for helping. I'm testing a website for buying classic cars at auction, not you. You can't do anything wrong. Please say out loud what you think and what you look at. If you get stuck, that tells me something about the website. It's a prototype, so not everything works.

**Questions before**

1. How often do you buy or bid on something online?
2. Do you do that mostly on your phone or on a laptop?
3. Have you ever bid in an online auction? What did you like or not like?

**Buyer tasks (phone)**

| Task | What I say | Screens | Success when |
|---|---|---|---|
| T1 | "You are looking for a French car from before 1980. Find the Citroën DS and tell me how much time is left in the auction." | B1 → B2 | Names the time left and the end time |
| T2 | "Place a bid of 18.500 euro." | B2 → B4 | Presses Place bid |
| T3 | "Did it work? How do you know?" | B4 | Mentions the confirmation or "highest bidder" |
| T4 | "You try again, but someone was faster. What do you do now?" (show B3) | B3 | Knows the new lowest bid and where to type it |
| T5 | "You come back later to this car. Can you still bid?" (show B5) | B5 | Says it is closed, without mentioning a colour |

**Staff tasks (laptop)**

| Task | What I say | Screens | Success when |
|---|---|---|---|
| T6 | "A seller calls: her Porsche 911 T from 1973 was in an accident. Cancel that auction." | S1 → S2 → S3 → S4 | Opens the 1973 one (not the 1971), checks the dialog, confirms |
| T7 | "What would you tell the seller now?" | S4 | Says the auction is cancelled |
| T8 | "You try to cancel an auction that just ended. What happened?" (show S5) | S5 | Understands nothing was changed and why |

**Questions after**

1. What did you think of the website in 3 words?
2. Was there a moment you were not sure what happened?
3. Did you trust the website with a bid of 18.500 euro? Why or why not?
4. Was anything confusing about the status of an auction?
5. (Staff) Did the "Are you sure?" screen help, or did it slow you down?
6. What would you change first?

**End**

> Thanks. Is there anything else you want to say about it?

## 3. Results

### How this round was done

There was no time left before the deadline to plan sessions with participants. So for this first round I did the tasks from the script myself, as the personas:

- **As Tom**: on a phone (390 px wide in the browser), not logged in at the start, with the buyer account `buyer@example.com`.
- **As Sandra**: on a laptop (1280 px), with the staff account `staff@example.com`.

I did every task twice: once on the [hi-fi prototype](hi-fi-prototype.md) and once on the working app (`docker compose up`, the seed data). For every step I asked: does Tom or Sandra know what to do here, do they see what happened, and does it fit their goals and frustrations from the persona.

**This is an expert walkthrough, not a user test.** I know the design, so I can't be surprised by it the way a real user can. The results below show where the design clearly has a problem, but "pass" only means it worked for me playing the persona. The test with 3 to 5 real people from section 1 is still the next step.

| Walkthrough | Persona | Device | Online bidding before? |
|---|---|---|---|
| W1 | Tom (buyer, 47, red-green colour-blind, looks at cars on his phone in the evening) | Phone | Yes, 2 or 3 other auction sites |
| W2 | Sandra (staff, back office, manages the auctions and answers sellers on the phone) | Laptop | No, she runs them |

### Tasks

| Task | Prototype | App | Notes |
|---|---|---|---|
| T1 find car and time left | Pass | **Fail** | Prototype: the card says "Open · ends Fri 16 Oct, 20:00". App: the card only said "Open", so Tom had to open every car to see which one ends first. That is exactly the frustration from his persona ("Unclear end time"). See F1. |
| T2 place bid | Pass | Pass | The bid field and the big "Place bid" button are under the thumb. Typing "18.500" with a dot works. When Tom is not logged in, the amount is still in the field after logging in. |
| T3 knows it worked | Pass | Pass | Green message "Your bid is placed", the amount and the time, and "You are now the highest bidder". In the history his bid has "(you)". Confidence as Tom: 5. |
| T4 bid too low | Pass | Pass | Message says someone was faster and shows the new lowest bid. The amount stays in the field, so Tom only has to change it. |
| T5 sees auction is closed | Pass | Pass | "Closed · ended ..." is written in words, also with the colours turned to grey (checked with a greyscale filter in the browser). The bid form is gone. |
| T6 cancel the right auction | Pass | Pass | Prototype: searching "911" gives the 1971 and the 1973 Porsche. App: the demo data has one Porsche, the search finds it straight away. In both, the dialog shows the car with the year, the seller, the end time and the bids, so the 1973 one can be checked. Focus starts on "No, go back". |
| T7 tell the seller | Pass | Pass | "The status of Porsche 911 T, 1973 is now Cancelled." |
| T8 change not allowed | Pass | Pass | Red message, "Nothing was changed", and the buttons update to what is allowed now. |

## 4. Findings and changes

Severity is based on 3 things: how often it happens (frequency), how bad it is when it happens (impact), and whether the user can get around it after the first time (persistence).

| # | Finding | Where | Frequency / impact / persistence | Severity | Change |
|---|---|---|---|---|---|
| F1 | The car list in the app shows "Open" but not when the auction ends. Tom has to open each car to find the one that ends soonest. The prototype had the end time, it got lost when building. | App, B1 | Every visit / medium / stays | **High** | **Changed** in #41: an open auction shows "Ends ..." on the card, and in the last 24 hours also the time left. |
| F2 | The lowest allowed bid is the current bid + €1. For a car of €18.000, a bid of €18.001 is allowed, which can feel strange and makes bidding wars in tiny steps possible. | Both, B2 | Often / low / stays | Medium | **Not changed.** BID-02 only says "higher than the current bid". A minimum step is a business choice for VeloVault, so it goes to the product owner as a question. |
| F3 | The explanation of Excellent, Good and Fair is only a tooltip (on hover). On a phone there is no hover, so Tom can't see what "Good" means. | App, B1 filters | Sometimes / low / stays | Medium | **Not changed** now. Browsing and filters are not part of my 2 requirements. Next step: show the explanation under the filter on small screens. |
| F4 | When Sandra sets new times after "back to pending", the page doesn't check that the end is after the start. She only sees it after saving. | App, staff detail | Rare / low / first time | Low | **Not changed.** The server checks it and the message says what is wrong, so nothing breaks. The rule stays in one place (the server). |
| F5 | The staff list shows "Manage" also for ended and cancelled auctions, where nothing can be changed. | App, S1 | Sometimes / low / first time | Low | **Not changed.** The detail page clearly says the status is final, and Sandra still wants to see the bids there. |

### What worked well

- Status is never only a colour. Every status is a word and has a dot. This was the most important point for Tom (colour-blind).
- The confirmation dialog is the moment that protects against cancelling the wrong Porsche. With the year, seller and end time in the dialog, I did not need to go back to check.
- The error messages say what happened and what to do next, and don't use technical words.

### Limits of this round

- I made the design myself, so I know where everything is. A real user will get stuck in places I didn't notice.
- I played the personas based on what I wrote in the persona and the journey map. That checks the design against my own picture of Tom and Sandra, not against real people.
- No real time or mistakes could be measured, so the "Time" and "Mistakes" columns from section 1 are left out.

### Next step

Run the plan from section 1 with 3 to 5 real people (2 or 3 buyers on a phone, 1 or 2 back office people on a laptop), on the working app with the F1 fix. Compare the results with this walkthrough: if real users get stuck in the same places, the walkthrough was right; new problems go into a new round of findings.
