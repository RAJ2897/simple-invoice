/** Today's date as `YYYY-MM-DD` in UTC. Used for every "is it overdue?" decision. */
export function todayIsoDate(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10);
}
