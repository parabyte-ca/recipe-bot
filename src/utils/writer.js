import fs from 'fs/promises';
import path from 'path';

/**
 * Write parsed recipe output to a dated folder.
 * Returns the output directory path.
 */
export async function writeOutputs(parsed, outputDir, source) {
  // Slugify the title for folder name
  const slug = parsed.title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 60);

  const date = new Date().toISOString().split('T')[0];
  const folderName = `${date}-${slug}`;
  const outPath = path.join(outputDir, folderName);

  await fs.mkdir(outPath, { recursive: true });

  // Full raw draft (everything)
  await fs.writeFile(path.join(outPath, 'draft.md'), buildDraft(parsed, source));

  // SEO package
  await fs.writeFile(path.join(outPath, 'seo.md'), parsed.sections['seo_package'] || parsed.sections['seo'] || '# SEO Package\n\n[Not parsed — see draft.md]');

  // Social package
  await fs.writeFile(path.join(outPath, 'social.md'), parsed.sections['social_package'] || parsed.sections['social'] || '# Social Package\n\n[Not parsed — see draft.md]');

  // Pre-publish checklist
  await fs.writeFile(path.join(outPath, 'checklist.md'), parsed.sections['pre-publish_checklist'] || parsed.sections['checklist'] || '# Checklist\n\n[Not parsed — see draft.md]');

  // Metadata
  const meta = {
    title: parsed.title,
    source,
    generated: new Date().toISOString(),
    verifyCount: parsed.verifyCount,
    outputDir: outPath,
  };
  await fs.writeFile(path.join(outPath, 'meta.json'), JSON.stringify(meta, null, 2));

  return outPath;
}

function buildDraft(parsed, source) {
  return `<!-- recipe-bot generated | Source: ${source} | Generated: ${new Date().toISOString()} -->
<!-- ⚠️ VERIFY count: ${parsed.verifyCount} — resolve all before publish -->

${parsed.raw}
`;
}
