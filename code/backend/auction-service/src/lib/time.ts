// Times are saved in UTC and shown in Dutch time, also in summer and winter time (NFR-15)
export const dutchDateTime = (date: Date) =>
  date.toLocaleString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Amsterdam',
  });

// € 18.500, the Dutch way of writing amounts
export const euros = (amount: number) => `€ ${amount.toLocaleString('nl-NL')}`;
