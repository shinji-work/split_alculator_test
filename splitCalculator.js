export function splitBill(total, people) {
  if (!Number.isFinite(total) || total < 0) {
    throw new Error('Total must be a non-negative number');
  }
  if (!Number.isInteger(people) || people <= 0) {
    throw new Error('People must be a positive integer');
  }
  const baseShare = Math.floor(total / people);
  const remainder = total % people;
  return Array.from({ length: people }, (_, idx) =>
    baseShare + (idx < remainder ? 1 : 0)
  );
}

// If executed directly, run a simple example
if (import.meta.url === `file://${process.argv[1]}`) {
  const [total, people] = process.argv.slice(2).map(Number);
  console.log(splitBill(total, people));
}
