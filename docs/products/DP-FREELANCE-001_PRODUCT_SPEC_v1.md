# DP-FREELANCE-001 — PRODUCT SPEC v1

Status: FROZEN FOR BUILD
Date: 2026-09-09
Product family: FREELANCE
Working name: **Freelancer Pricing & Profit System**
Primary channel: Etsy
Direct channel: Payhip
Benchmark authority: `docs/DIGITAL_PRODUCT_WINNER_BENCHMARK_v3.json`
Market authority: `docs/market-research/DP-FREELANCE-001_MARKET_STUDY_2026-09-09.md`

## 1. Product promise

**Know what to charge before you quote — and learn whether the project actually paid afterward.**

The workbook must help a freelancer move through one coherent loop:

`ANNUAL GOAL -> SUSTAINABLE RATE -> PROJECT QUOTE -> PROFIT FLOOR -> ACTUAL PROJECT RESULT -> PRICING MEMORY -> BETTER NEXT QUOTE`

The product is a decision system, not merely a decorative spreadsheet.

## 2. Customer

Primary customer:
- freelancer;
- independent consultant;
- solo service provider;
- small independent professional who sells hourly, fixed-price or retainer work.

Primary pain:
- uncertainty about what to charge;
- underestimating non-billable time;
- quoting projects without protecting margin;
- discounting without knowing the economic floor;
- failing to compare estimated hours with actual hours;
- repeating the same pricing mistakes.

## 3. Language and localization

Release v1 workbook language: **English** for international marketplace reach.

Rules:
- currency-agnostic formulas;
- currency symbol controlled by a user setting where practical;
- no country-specific tax filing advice;
- taxes are represented only as user-entered reserve assumptions;
- Spanish localization becomes a later channel/package variant after v1 QA, not a separate logic fork.

## 4. Workbook architecture

Required visible sheets, in this order:

1. `START HERE`
2. `SETUP`
3. `RATE BUILDER`
4. `QUOTE BUILDER`
5. `PROJECTS`
6. `PRICING MEMORY`
7. `DASHBOARD`
8. `EXAMPLE`
9. `METHODOLOGY`

No hidden business logic is required for v1. If helper cells are used, they must be documented and visually separated.

## 5. Visual system

Brand posture: clean, professional, premium, restrained.

Requirements:
- strong information hierarchy;
- editable input cells clearly distinguishable from formulas/output cells;
- no excessive decoration;
- mobile/laptop readability at normal zoom;
- consistent title, section, input, output, warning and note styles;
- protected-looking formulas by styling even when workbook-level cell protection is not enabled;
- HEALTHY / REVIEW / UNDERPRICED decision signals visible where relevant.

## 6. Sheet specification

### 6.1 START HERE

Purpose: first-use onboarding in under 3 minutes.

Must include:
- product promise;
- 5-step workflow;
- color legend: USER INPUT / CALCULATED / DECISION SIGNAL;
- quick-start sequence;
- explicit disclaimer that the workbook is educational/business planning material, not tax/legal/accounting advice;
- version string `DP-FREELANCE-001 v1.0`.

Acceptance:
- buyer can identify where to begin without opening a separate manual.

### 6.2 SETUP

Editable inputs:
- Currency label (text, default `$`);
- Annual owner income goal;
- Annual business overhead;
- Tax reserve %;
- Business/profit reserve %;
- Vacation / non-working weeks;
- Working hours per week;
- Billable utilization %;
- Pricing buffer %;
- Default target project margin %;
- Default contingency %;

Input constraints:
- tax reserve >= 0 and <= 60%;
- business/profit reserve >= 0 and <= 40%;
- combined tax + business reserve < 90%;
- vacation weeks >= 0 and <= 20;
- weekly hours > 0 and <= 80;
- utilization > 0 and <= 100%;
- pricing buffer >= 0 and <= 100%;
- target project margin >= 0 and <= 80%;
- contingency >= 0 and <= 100%.

Derived outputs:
- available working weeks;
- annual working hours;
- annual billable hours;
- annual revenue requirement;
- minimum sustainable hourly rate;
- recommended standard hourly rate.

Canonical formulas:

`available_weeks = 52 - vacation_weeks`

`annual_working_hours = available_weeks * hours_per_week`

`annual_billable_hours = annual_working_hours * billable_utilization`

`revenue_requirement = (owner_income_goal + annual_overhead) / (1 - tax_reserve - business_reserve)`

`minimum_sustainable_rate = revenue_requirement / annual_billable_hours`

`recommended_standard_rate = minimum_sustainable_rate * (1 + pricing_buffer)`

Guard:
- if denominator <= 0 or annual_billable_hours <= 0, output an explicit INPUT ERROR signal instead of a numeric result.

### 6.3 RATE BUILDER

Purpose: turn the setup economics into usable hourly/day/project anchors.

Inputs:
- optional custom working rate override;
- standard day length in billable hours, default 7.0;
- retainer hours per month, default 20;
- retainer efficiency/commitment discount %, default 0%.

Outputs:
- minimum sustainable hourly rate;
- recommended hourly rate;
- day rate;
- retainer floor;
- recommended retainer;
- warning if custom rate is below sustainable floor.

Formulas:

`active_hourly_rate = IF(custom_rate>0, custom_rate, recommended_standard_rate)`

`day_rate = active_hourly_rate * day_length`

`retainer_floor = minimum_sustainable_rate * retainer_hours`

`recommended_retainer = MAX(retainer_floor, active_hourly_rate * retainer_hours * (1 - retainer_discount))`

Decision signal:
- `UNDERPRICED` when custom rate > 0 and custom rate < minimum sustainable rate;
- `REVIEW` when custom rate is between sustainable rate and recommended standard rate;
- `HEALTHY` when custom rate >= recommended standard rate or no custom override is used.

### 6.4 QUOTE BUILDER

Purpose: price one project without losing sight of the economic floor.

Editable inputs:
- Project name;
- Client name;
- Service type;
- Estimated hours;
- Hourly rate source: Recommended / Sustainable Floor / Custom;
- Custom hourly rate;
- Complexity: Standard / Elevated / High;
- Rush: No / Moderate / Urgent;
- External costs;
- Contingency %;
- Target project margin %;
- Proposed discount %;
- Deposit %;

Canonical multipliers:
- complexity Standard = 1.00;
- Elevated = 1.15;
- High = 1.30;
- rush No = 1.00;
- Moderate = 1.15;
- Urgent = 1.30.

Derived outputs:
- selected base hourly rate;
- adjusted labor value;
- protected cost floor;
- recommended price before discount;
- final proposed price;
- maximum safe discount before protected floor is crossed;
- deposit amount;
- remaining balance;
- implied margin over protected floor;
- signal: HEALTHY / REVIEW / UNDERPRICED.

Formulas:

`selected_rate = CHOOSE(source, recommended_rate, sustainable_rate, custom_rate)` conceptually; implementation may use nested IF.

`adjusted_labor = estimated_hours * selected_rate * complexity_multiplier * rush_multiplier`

`protected_floor = (adjusted_labor + external_costs) * (1 + contingency)`

`recommended_price = protected_floor / (1 - target_margin)`

`final_price = recommended_price * (1 - proposed_discount)`

`max_safe_discount = MAX(0, 1 - protected_floor / recommended_price)`

`implied_margin = IF(final_price>0, (final_price - protected_floor) / final_price, 0)`

`deposit_amount = final_price * deposit_pct`

`balance = final_price - deposit_amount`

Signal rules:
- UNDERPRICED when final_price < protected_floor;
- REVIEW when final_price >= protected_floor but implied_margin < target_margin;
- HEALTHY when implied_margin >= target_margin, allowing a rounding tolerance of 0.5 percentage points.

### 6.5 PROJECTS

Purpose: operational quote-versus-actual learning table.

Capacity: minimum 100 project rows.

Columns:
- Project ID;
- Project;
- Client;
- Service Type;
- Status (Planned / Active / Completed / Cancelled);
- Quote Date;
- Estimated Hours;
- Quoted Price;
- Actual Hours;
- Actual External Costs;
- Revenue Collected;
- Effective Hourly Rate;
- Economic Surplus vs Sustainable Floor;
- Economic Surplus Margin;
- Hours Estimate Error %;
- Revenue vs Quote %;
- Decision Signal;
- Notes.

Formulas for each row:

`effective_hourly_rate = IF(actual_hours>0, (revenue_collected - actual_external_costs) / actual_hours, blank)`

`economic_surplus = revenue_collected - actual_external_costs - (actual_hours * sustainable_rate)`

`economic_surplus_margin = IF(revenue_collected>0, economic_surplus / revenue_collected, blank)`

`hours_estimate_error = IF(estimated_hours>0 AND actual_hours>0, actual_hours/estimated_hours - 1, blank)`

`revenue_vs_quote = IF(quoted_price>0 AND revenue_collected<>0, revenue_collected/quoted_price - 1, blank)`

Decision signal for Completed projects:
- UNDERPRICED when effective_hourly_rate < sustainable_rate OR economic_surplus < 0;
- REVIEW when effective_hourly_rate >= sustainable_rate but < recommended_standard_rate;
- HEALTHY when effective_hourly_rate >= recommended_standard_rate and economic_surplus >= 0;
- blank when not Completed or insufficient actual data.

### 6.6 PRICING MEMORY

Purpose: convert completed projects into simple reusable pricing evidence by service type.

User-editable list: up to 10 service types.

For each service type calculate from PROJECTS completed rows:
- completed projects count;
- average quoted price;
- average actual hours;
- average hours estimate error %;
- average effective hourly rate;
- average economic surplus margin;
- suggested planning buffer %;
- signal.

Suggested planning buffer:

`suggested_buffer = MAX(0, average_hours_estimate_error)`

This is descriptive guidance, not an automatic price change.

Signal:
- HEALTHY when average effective rate >= recommended standard rate and average economic surplus margin >= 0;
- REVIEW when average effective rate >= sustainable floor but below recommended standard rate;
- UNDERPRICED when average effective rate < sustainable floor or average surplus margin < 0.

No service type with zero completed projects may display fake zero performance; use `NO DATA` / blank metrics.

### 6.7 DASHBOARD

Purpose: compact overview, not a decorative analytics page.

Required KPI cards:
- Sustainable Hourly Rate;
- Recommended Hourly Rate;
- Completed Projects;
- Revenue Collected;
- Average Effective Hourly Rate;
- Average Hours Estimate Error;
- Average Economic Surplus Margin;
- Underpriced Completed Projects.

Required visuals:
- one chart comparing Quoted Price vs Revenue Collected for completed projects;
- one chart comparing Recommended Hourly Rate vs project Effective Hourly Rate for completed projects OR, if chart implementation would materially harm compatibility, a compact table plus conditional formatting may substitute in v1.

Dashboard rules:
- blanks when no completed-project data;
- no fabricated sample metrics from EXAMPLE sheet;
- signal summary visible.

### 6.8 EXAMPLE

Purpose: demonstrate usage without contaminating buyer data.

Must include one fictional worked example with clearly labelled assumptions and outputs.

The example may not flow into DASHBOARD or PRICING MEMORY.

### 6.9 METHODOLOGY

Must explain in plain language:
- why billable utilization matters;
- difference between sustainable floor and recommended rate;
- protected project floor;
- target margin;
- estimate error;
- effective hourly rate;
- economic surplus vs sustainable labor floor;
- why taxes are only user-entered reserves;
- no tax/legal/accounting advice.

Include formula summary and version history.

## 7. Data quality and compatibility

Required:
- formulas must not contain external workbook links;
- no macros;
- no paid add-ins;
- no volatile or platform-fragile functions when a simpler compatible formula exists;
- formulas should favor IF, SUM, COUNTIF(S), AVERAGEIF(S), MAX, MIN and standard arithmetic;
- avoid dynamic-array dependence for v1;
- Excel .xlsx is authoritative build;
- Google Sheets compatibility is a separate validation step before claiming compatibility in listings.

## 8. Product integrity rules

- Do not include competitor files, text, screenshots or proprietary formulas.
- Do not claim uniqueness without evidence.
- Do not promise income, revenue or financial outcomes.
- Do not calculate country-specific taxes.
- Do not label gross surplus as accounting profit.
- Use the phrase `Economic Surplus vs Sustainable Floor` rather than `Net Profit` for the tracker metric.

## 9. QA gates

### QA-A Formula integrity
PASS only if:
- no #REF!, #DIV/0!, #VALUE!, #NAME?, circular references or obvious broken formulas in key ranges;
- all editable assumptions affect dependent outputs as specified;
- blank/zero inputs do not generate misleading infinities.

### QA-B Boundary tests
Required cases:
1. utilization = 0 -> explicit input error, not divide-by-zero;
2. tax + reserve >= 100% -> explicit input error;
3. estimated hours = 0 -> quote signal/input warning;
4. target margin = 80% -> formula remains finite;
5. proposed discount > safe discount -> UNDERPRICED;
6. actual hours blank -> no fake actual-performance metrics;
7. completed project with actual hours and zero revenue -> UNDERPRICED / meaningful output;
8. service type with no completed projects -> NO DATA.

### QA-C Economic test vector
Default reference assumptions for deterministic QA:
- owner income goal: 60,000;
- overhead: 12,000;
- tax reserve: 20%;
- business reserve: 10%;
- vacation weeks: 4;
- hours/week: 40;
- utilization: 60%;
- pricing buffer: 20%.

Expected derived values:
- available weeks = 48;
- annual working hours = 1,920;
- annual billable hours = 1,152;
- revenue requirement = 102,857.142857...;
- sustainable hourly rate ≈ 89.285714;
- recommended standard rate ≈ 107.142857.

Quote test:
- estimated hours 20;
- selected recommended rate;
- complexity Elevated 1.15;
- rush No 1.00;
- external costs 100;
- contingency 10%;
- target margin 25%;
- discount 5%;
- deposit 50%.

Expected approximate outputs:
- adjusted labor = 2,464.2857;
- protected floor = 2,820.7143;
- recommended price = 3,760.9524;
- final price = 3,572.9048;
- max safe discount = 25%;
- implied margin ≈ 21.0526%;
- deposit ≈ 1,786.4524;
- signal = REVIEW.

### QA-D Visual/UX
PASS only if:
- all visible sheets use consistent styles;
- user inputs are unmistakable;
- key values fit without ####;
- no chart overlaps primary data;
- START HERE explains the workflow;
- normal laptop view is usable without excessive horizontal scrolling in primary input sheets.

### QA-E Channel/package
Before marketplace release:
- file opens as `.xlsx`;
- version string present;
- buyer-facing file name professional;
- separate Google Sheets validation receipt exists before listing says Google Sheets compatible;
- screenshots must represent the real product.

## 10. Release definition

M06 BUILD begins from this frozen spec.

Any logic-changing deviation requires a versioned spec amendment. Cosmetic improvements that do not change calculations may be made during M08 BRAND & PACKAGING and recorded in the release notes.
