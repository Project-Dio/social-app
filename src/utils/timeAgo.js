export function timeAgo(dateString) {
  const seconds = Math.floor((Date.now() - new Date(dateString)) / 1000);
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  const units = [
    ["year", 31536000],
    ["month", 2592000],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];

  for (const [unit, secondsInUnit] of units) {
    if (seconds >= secondsInUnit) {
      return rtf.format(-Math.floor(seconds / secondsInUnit), unit);
    }
  }
  return "Just now";
}
