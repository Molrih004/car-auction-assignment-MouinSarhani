# Setup

In this assignment you can find the following folders:

1. [assignment/](assignment/) — the assignment brief and interview material
2. [products/](products/) — your analysis/design deliverables (persona, diagrams, specs, prototype, test plan)
3. [code/](code/) — the implementation

## Process

All work — analysis/design products and code alike — must be tracked through GitHub issues and resolved through pull requests. This is not optional: it's how you and your teammates stay able to follow what changed, why, and who reviewed it.

1. **Every piece of work starts as an issue.** Before you touch `products/` or `code/`, open an issue using one of the templates under **Issues → New issue**:
   - **Product Issue** — for analysis/design work (persona, diagrams, specs, prototype, UXD test plan, ...). One issue per deliverable, or per slice of a deliverable — see [ISSUES_CREATION.md](ISSUES_CREATION.md), Part A.
   - **Coding Issue** — for implementation work. One issue per acceptance criterion (vertical slice), or per sequence-diagram step/branch for cross-cutting concerns — see [ISSUES_CREATION.md](ISSUES_CREATION.md), Part B.

   Read [ISSUES_CREATION.md](ISSUES_CREATION.md) before opening issues — it explains how to split a story or product into issues that are small enough to review in one PR, and the size checks both templates ask you to confirm.

2. **No direct commits to `main`.** All changes — product documents and code — are made on a branch and merged via a pull request. Never push straight to `main`, even for "small" fixes.

3. **One issue → one branch → one pull request.** Name the branch after the issue, and reference the issue in the PR description with `Closes #<issue-number>` so the link shows up automatically and the issue closes on merge.

4. **Every pull request gets reviewed before merging.** A teammate (or, for product PRs, the reviewing pair using the **Peer Feedback** template) reviews the diff and leaves feedback on the issue/PR before it's merged. Don't merge your own PR without a review.

5. **Traceability is the point.** Because every change is: issue → branch → PR → review → merge, anyone (a teammate or us) can look at the issue tracker and reconstruct what was built, in what order, and who signed off on it. Skipping the process breaks that chain — it's the first thing we check when a milestone looks unclear.

## Assignment

See [assignment/assignment.md](assignment/assignment.md) for the brief and [assignment/interviews.md](assignment/interviews.md) for the interview material it's based on.

## Products

See [products/products.md](products/products.md) for the list of analysis/design deliverables you need to produce, and [ISSUES_CREATION.md](ISSUES_CREATION.md) for how to turn each one into issues.

## Code

See [code/setup.md](code/setup.md) for how the implementation is organized.
