<script lang="ts">
  import type { Condition } from '$lib/api/types';
  import type { CarFilter } from '$lib/api/cars';
  import { conditionHelp, conditionLabel } from '$lib/utils/format';

  // The page owns the filter (it lives in the URL), this component only shows it and reports changes
  let { makes, years, filter, onchange }: {
    makes: string[];
    years: number[];
    filter: CarFilter;
    onchange: (next: CarFilter) => void;
  } = $props();

  const CONDITIONS: Condition[] = ['EXCELLENT', 'GOOD', 'FAIR'];

  const toggle = <T,>(list: T[], item: T) => (list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);
  const yearValue = (value: string) => (value ? Number(value) : undefined);
</script>

<section class="filters" aria-label="Filters">
  <fieldset>
    <legend>Make</legend>
    <div class="chips">
      {#each makes as make (make)}
        <button
          type="button" class="chip" aria-pressed={filter.makes.includes(make)}
          onclick={() => onchange({ ...filter, makes: toggle(filter.makes, make) })}
        >{make}</button>
      {/each}
    </div>
  </fieldset>

  <fieldset class="years">
    <legend>Year</legend>
    <select aria-label="Year from" value={filter.yearFrom ?? ''} onchange={(e) => onchange({ ...filter, yearFrom: yearValue(e.currentTarget.value) })}>
      <option value="">From any year</option>
      {#each years as year (year)}<option value={year}>from {year}</option>{/each}
    </select>
    <select aria-label="Year to" value={filter.yearTo ?? ''} onchange={(e) => onchange({ ...filter, yearTo: yearValue(e.currentTarget.value) })}>
      <option value="">To any year</option>
      {#each years as year (year)}<option value={year}>to {year}</option>{/each}
    </select>
  </fieldset>

  <fieldset>
    <legend>Condition</legend>
    <div class="chips">
      {#each CONDITIONS as condition (condition)}
        <button
          type="button" class="chip" aria-pressed={filter.conditions.includes(condition)} title={conditionHelp[condition]}
          onclick={() => onchange({ ...filter, conditions: toggle(filter.conditions, condition) })}
        >{conditionLabel[condition]}</button>
      {/each}
    </div>
  </fieldset>

  <button type="button" class="clear" onclick={() => onchange({ makes: [], conditions: [] })}>Clear filters</button>
</section>

<style>
  .filters { display: grid; gap: 10px; margin: 8px 0 16px; }
  fieldset { border: 0; padding: 0; margin: 0; }
  legend { font-size: 13px; color: var(--muted); margin-bottom: 4px; }
  .chips { display: flex; flex-wrap: wrap; gap: 8px; }
  .chip {
    min-height: 40px; padding: 0 14px; border: 1px solid var(--line); border-radius: 999px;
    background: var(--card); color: var(--ink); font-size: 15px; cursor: pointer;
  }
  /* Selected: border, background AND a check mark, so it doesn't rely on colour alone */
  .chip[aria-pressed="true"] { border-color: var(--accent); background: var(--soft); }
  .chip[aria-pressed="true"]::before { content: "✓ "; }
  .years { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .clear { justify-self: start; background: none; border: 0; padding: 4px 0; color: var(--accent); text-decoration: underline; font-size: 15px; cursor: pointer; }
</style>
