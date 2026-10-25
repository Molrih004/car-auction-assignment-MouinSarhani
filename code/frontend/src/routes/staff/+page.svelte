<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import { getAuctions } from '$lib/api/auctions';
  import { getCars } from '$lib/api/cars';
  import { getUsers } from '$lib/api/users';
  import { ApiError } from '$lib/api/client';
  import type { Auction, AuctionStatus, Car, User } from '$lib/api/types';
  import { dateTime, euros } from '$lib/utils/format';
  import { statusName } from '$lib/utils/status';
  import { createNow } from '$lib/utils/now.svelte';
  import MessageBox from '$lib/components/MessageBox.svelte';
  import StatusBadge from '$lib/components/StatusBadge.svelte';

  const now = createNow();
  const STATUSES: AuctionStatus[] = ['ACTIVE', 'PENDING', 'ENDED', 'CANCELLED'];

  let auctions = $state<Auction[]>([]);
  let cars = $state<Map<string, Car>>(new Map());
  let users = $state<Map<number, User>>(new Map());
  let loading = $state(true);
  let error = $state<string | null>(null);

  // The search and the status filter are kept in the URL, so "Back to search results" shows the same list
  const search = $derived(page.url.searchParams.get('q') ?? '');
  const status = $derived(page.url.searchParams.get('status') ?? '');

  function setQuery(key: 'q' | 'status', value: string) {
    const query = new URLSearchParams(page.url.searchParams);
    if (value) query.set(key, value);
    else query.delete(key);
    const qs = query.toString();
    goto(qs ? `?${qs}` : '/staff', { replaceState: true, keepFocus: true, noScroll: true });
  }

  const rows = $derived(auctions.map((auction) => {
    const car = cars.get(auction.carId);
    const seller = users.get(auction.sellerId);
    return {
      auction,
      carName: car ? `${car.make} ${car.model}, ${car.year}` : 'Unknown car',
      sellerName: seller?.name ?? `User ${auction.sellerId}`,
      sellerEmail: seller?.email ?? '',
    };
  }));

  // One search field for car, seller name and email (Sandra: "search on a name, an email address, a car")
  const results = $derived.by(() => {
    const words = search.toLowerCase().split(/\s+/).filter(Boolean);
    return rows.filter((row) => {
      const text = `${row.carName} ${row.sellerName} ${row.sellerEmail}`.toLowerCase();
      return words.every((word) => text.includes(word)) && (!status || row.auction.status === status);
    });
  });

  $effect(() => {
    Promise.all([getAuctions(), getCars(), getUsers()])
      .then(([allAuctions, allCars, allUsers]) => {
        auctions = allAuctions;
        cars = new Map(allCars.map((car) => [car.id, car]));
        users = new Map(allUsers.map((user) => [user.id, user]));
      })
      .catch((e) => { error = e instanceof ApiError ? e.message : 'Something went wrong.'; })
      .finally(() => { loading = false; });
  });
</script>

<main class="page wide">
  <h1>Auctions</h1>

  <form class="search" role="search" onsubmit={(e) => e.preventDefault()}>
    <label for="q" class="sr-only">Search on car, seller name or email</label>
    <input id="q" value={search} oninput={(e) => setQuery('q', e.currentTarget.value)} type="search" placeholder="Search on car, seller name or email" autocomplete="off" />
    <label for="status" class="sr-only">Status</label>
    <select id="status" value={status} onchange={(e) => setQuery('status', e.currentTarget.value)}>
      <option value="">All statuses</option>
      {#each STATUSES as s (s)}<option value={s}>{statusName[s]}</option>{/each}
    </select>
  </form>

  {#if error}
    <MessageBox kind="error" title="We can't show the auctions right now.">{error}</MessageBox>
  {:else if loading}
    <p class="muted">Loading auctions...</p>
  {:else}
    <p class="muted small" aria-live="polite">{results.length} {results.length === 1 ? 'result' : 'results'}</p>
    <table>
      <thead>
        <tr>
          <th scope="col">Car</th><th scope="col">Seller</th><th scope="col">Status</th>
          <th scope="col">Ends</th><th scope="col">Current bid</th><th scope="col">Bids</th><th scope="col"><span class="sr-only">Manage</span></th>
        </tr>
      </thead>
      <tbody>
        {#each results as row (row.auction.id)}
          <tr>
            <td><b>{row.carName}</b></td>
            <td>{row.sellerName}<br /><span class="muted small">{row.sellerEmail}</span></td>
            <td><StatusBadge auction={row.auction} now={now.value} /></td>
            <td>{dateTime(row.auction.endAt)}</td>
            <td>{row.auction.currentBid !== null ? euros(row.auction.currentBid) : '–'}</td>
            <td>{row.auction.bidCount}</td>
            <td><a href="/staff/auctions/{row.auction.id}">Manage</a></td>
          </tr>
        {/each}
      </tbody>
    </table>
    {#if !results.length}<p class="card">No auctions match "{search}".</p>{/if}
  {/if}
</main>

<style>
  .search { display: grid; grid-template-columns: 1fr 200px; gap: 8px; margin: 12px 0; }
  td { vertical-align: top; }
  @media (max-width: 700px) { table { display: block; overflow-x: auto; } .search { grid-template-columns: 1fr; } }
</style>
