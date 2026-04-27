/**
 * Parse Claude's raw response into structured sections.
 * Claude is prompted to use: TITLE: ... and --- SECTION: [NAME] ---
 */
export function parseResponse(raw) {
  const lines = raw.split('\n');
  let title = 'Untitled Recipe';

  // Extract title from first TITLE: line
  for (const line of lines) {
    const match = line.match(/^TITLE:\s*(.+)/i);
    if (match) {
      title = match[1].trim();
      break;
    }
  }

  // Split into named sections
  const sections = {};
  let currentSection = 'preamble';
  let buffer = [];

  for (const line of lines) {
    const sectionMatch = line.match(/^---\s*SECTION:\s*(.+?)\s*---/i);
    if (sectionMatch) {
      sections[currentSection] = buffer.join('\n').trim();
      currentSection = sectionMatch[1].toLowerCase().replace(/\s+/g, '_');
      buffer = [];
    } else {
      buffer.push(line);
    }
  }
  sections[currentSection] = buffer.join('\n').trim();

  // Count ⚠️ VERIFY flags
  const verifyCount = (raw.match(/⚠️ VERIFY/g) || []).length;

  return {
    title,
    raw,
    sections,
    verifyCount,
  };
}
