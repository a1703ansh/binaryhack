# EarnWise ⚡

### Micro-Investment & Savings Platform for Gig Workers

> **"Your income changes every day. Your financial plan should too."**

EarnWise is an intelligent, zero-effort fintech platform built specifically for gig workers (delivery riders, drivers, freelancers) with irregular, unpredictable income.

Traditional banking and SIP products assume steady monthly salaries. EarnWise solves this by autonomously intercepting daily incoming settlements, analyzing them against the user's historical 30-day earnings average, reserving for taxes, safeguarding a mandatory minimum balance floor, and routing safe surplus into emergency funds and micro-investments—**with 100% human-readable explainability and user override controls.**

---

## 🎯 The Problem

* **Income Volatility:** Gig workers do not receive fixed paychecks at the end of the month. Earnings fluctuate based on shift volume, weather, and seasonal demand.
* **Lack of Automatic Deductions:** Gig workers don't have employer provident fund (PF) or TDS automatically withheld, leading to year-end tax shocks.
* **Decision Fatigue:** Manually answering *"How much should I save today?"* or *"Can I afford to invest?"* after an exhausting 10-hour shift is unreasonable.

---

## 💡 The Solution: Zero-Effort Finance

```
Incoming Payout (e.g. Swiggy ₹1,250)
        ↓
Central Decision Engine
        ↓
├─► Auto-Save: ₹150 (Emergency Fund)
├─► Tax Provision: ₹125 (Quarterly Advance Tax Buffer)
├─► Micro-Investment: ₹100 (Liquid & Index Funds)
└─► Spendable Cash: ₹875 (Guaranteed > ₹5,000 Minimum Floor)
        ↓
Audit Log & Human-Readable Explanation
```

---

## 🚀 Key Features

### 1. Centralized Algorithmic Decision Engine
- **Decoupled Business Logic (`src/services/decisionEngine.ts`):** Evaluates daily income against a 30-day moving average.
- **Adaptive 4-Tier Rules:**
  - **Slump Day (<60% avg):** Auto-Save = 0% to protect basic living cash flow.
  - **Lean Day (60%–100% avg):** Auto-Save = 5% to maintain habit without strain.
  - **Normal / Good Day (100%–150% avg):** Auto-Save = 10%–12% (e.g., ₹150 on ₹1,250 payout).
  - **Peak Day (>150% avg):** Auto-Save = 15% to capture surge demand earnings.
- **Minimum Balance Guardrail:** Never allows account balance to breach ₹5,000.
- **Monthly Savings Ceiling:** Prevents over-saving past ₹8,000/mo.

### 2. Multi-Source Income Intelligence & Forecasting
- Multi-platform aggregation (Swiggy, Uber, Zomato, Rapido, Freelancing).
- Rule-based 7-day projection window (₹6,800 – ₹8,200).
- Mock connection wizard supporting Gig App APIs, UPI settlement SMS/webhooks, bank statements, and CSV upload.

### 3. Payout Simulator Modal
- Demonstrates real-time autonomous calculations with an animated 8-step engine sequence.
- Instant reactive state synchronization across the dashboard, goals, and activity logs.

### 4. Behavioral Risk Profiler & Investment Advisor
- Dynamic behavioral risk classification (**Balanced** profile).
- 4-part micro-allocation: Liquid Mutual Funds (40%), Nifty 50 Index (30%), Flexi RD (20%), and 24K Digital Gold (10%).
- Interactive **What-If Growth Simulator** calculating future corpus across durations (1–10 yrs) and monthly SIPs (₹500–₹5,000).

### 5. Proportional Tax Provisioning Copilot
- Earmarks 10% proportional advance tax reserve on each payout.
- Advance tax calendar reminder (March 15, 2027) with readiness scoring.

### 6. Targeted Savings Goals
- Micro-waterfall funding prioritizing Emergency Fund (₹10,500 / ₹25,000) and Vehicle Maintenance & Tyres (₹4,500 / ₹10,000).

### 7. Operational Expenses & Mock Receipt Scanner
- Repositioned expense tracker treating expenses as behavioral signals to calibrate safe spending.
- Mock instant receipt uploader for fuel slips and maintenance bills.
- CSV export/import utility.

### 8. Explainable Automation & Real-Time Undo
- Complete audit trail of automated actions with human-readable rationale strings.
- 1-click **Undo** functionality to reverse any recent auto-saving.

### 9. Grounded Financial AI Copilot
- In-app chatbot answering queries on safe spending, auto-save reasoning, and tax provision, grounded strictly in live application state.

---

## 🛠️ Tech Stack

- **Frontend:** React 19, TypeScript, Vite
- **Styling:** Tailwind CSS, Lucide Icons, Plus Jakarta Sans font
- **Visuals & Charts:** Interactive responsive SVG charts, Canvas Confetti
- **State Management:** React Context API with modular service architecture

---

## ⚡ Quick Start

```bash
# 1. Clone repository
git clone git@github.com:drishtity/EarnWise.git
cd EarnWise

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Open in browser
http://localhost:5173
```

To run the automated decision engine verification tests:
```bash
node test_engine.mjs
```

---

## 🏆 3-Minute Judge Demo Flow

1. Open dashboard & inspect **Rahul's** delivery partner profile and Financial Health score (**78/100**).
2. Go to **Income** & inspect multi-platform breakdown (Swiggy ₹12.4k, Uber ₹8.3k, Freelance ₹4.2k) and 7-day forecast.
3. Click **+ New Payout**, enter **₹1,250**, and click **Process Payout**.
4. Watch animated sequence compute: **Auto-Save ₹150, Invest ₹100, Tax ₹125, Spendable ₹875**.
5. Check **Activity** to review the explainable rationale and test the **Undo** button.
6. Open **Invest** to explore the Behavioral Risk profile, approve the simulated allocation, and test the **What-If Growth Simulator**.
7. Ask the **AI Copilot**: *"How much can I safely spend this week?"* to verify state-grounded calculations.

---

## ⚠️ Prototype Disclaimer

*This prototype uses simulated financial data and transactions for hackathon demonstration purposes. It does not execute real UPI transfers, bank account logins, mutual fund purchases, or official tax filings.*
