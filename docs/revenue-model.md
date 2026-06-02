# Timberline revenue model (reference)

Preserved from the retired in-app `AdminDashboard` (removed 2026-06-01 once Command
Center became the admin surface). The component itself is gone; this captures the
revenue-projection + seasonal-forecast math it embedded, which was **not yet ported
to Command Center**. Keep until/if it's reproduced there.

## Assumptions
| Constant | Value | Meaning |
|---|---|---|
| `MAU_RATIO` | 0.10 | monthly active users ÷ total users |
| `EST_CR` | 0.04 | click → purchase conversion rate |
| `EST_AOV` | $110 | average order value |
| `COMMISSION` | 0.07 | average affiliate commission |
| `cps` | measured | clicks per session, from the last 30 days of `clicks` |

## Projection formula
Monthly revenue at `users` total users:

```
projAt(users) = (users * MAU_RATIO * 30) * cps * EST_CR * EST_AOV * COMMISSION
annual        = projAt(users) * 12
```

Reference tiers shown in the old panel: 1,000 / 5,000 / 10,000 / 25,000 / 100,000 users.

## Seasonal multipliers (applied to a baseline monthly projection)
Hunting-season weighting — revenue skews hard to fall.

| Jan | Feb | Mar | Apr | May | Jun | Jul | Aug | Sep | Oct | Nov | Dec |
|----|----|----|----|----|----|----|----|----|----|----|----|
| 0.7 | 0.7 | 0.6 | 0.6 | 0.5 | 0.7 | 0.7 | 1.2 | 1.5 | 1.8 | 2.0 | 1.4 |

Annual (seasonal) = Σ over months of `projAt(10000) * multiplier[month]`.
