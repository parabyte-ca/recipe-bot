export function log(level, message) {
  const ts = new Date().toISOString();
  console.log(`[${ts}] [${level.toUpperCase()}] ${message}`);
}
