const d = new Date(Date.UTC(2024, 2, 3)); // March 3, 2024 (Sunday)
const day = d.getUTCDay();
const diff = day === 0 ? 6 : day - 1;

console.log("Original Date:", d.toISOString());
d.setUTCDate(d.getUTCDate() - diff);
d.setUTCHours(0, 0, 0, 0);
console.log("Start of Week Date:", d.toISOString());
