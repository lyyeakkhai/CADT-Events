/**
 * Soft-delete junk + duplicate events for a cleaner demo.
 *
 * - Soft-deletes titles matching junk patterns (e.g. "emwpoer")
 * - Soft-deletes E2E draft-only leftovers
 * - For each title (case-insensitive), keeps ONE event (most bookings, then newest) and soft-deletes the rest
 *
 * Usage (from backend/):
 *   npx tsx scripts/clean-demo-events.ts
 *   npx tsx scripts/clean-demo-events.ts --dry-run
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const dryRun = process.argv.includes('--dry-run');

const JUNK_TITLE_RE = /^(emwpoer|test|asdf|xxx)$/i;
const E2E_DRAFT_RE = /e2e draft only/i;

async function main() {
  const events = await prisma.event.findMany({
    where: { deleted_at: null },
    include: { _count: { select: { registrations: true } } },
    orderBy: { created_at: 'desc' },
  });

  console.log(`Found ${events.length} active events`);
  if (dryRun) console.log('(dry-run — no writes)\n');

  const toDelete = new Set<string>();

  for (const e of events) {
    const title = (e.event_title || '').trim();
    if (JUNK_TITLE_RE.test(title) || E2E_DRAFT_RE.test(title)) {
      toDelete.add(e.event_id);
      console.log(`  junk/draft → delete: ${e.event_id.slice(0, 8)} "${title}"`);
    }
  }

  // Group remaining by normalized title
  const byTitle = new Map<string, typeof events>();
  for (const e of events) {
    if (toDelete.has(e.event_id)) continue;
    const key = (e.event_title || '').trim().toLowerCase();
    if (!key) continue;
    const list = byTitle.get(key) || [];
    list.push(e);
    byTitle.set(key, list);
  }

  for (const [title, list] of byTitle) {
    if (list.length <= 1) continue;
    // Keep event with most registrations, then newest created_at
    const sorted = [...list].sort((a, b) => {
      const br = (b._count?.registrations || 0) - (a._count?.registrations || 0);
      if (br !== 0) return br;
      const at = a.created_at?.getTime() || 0;
      const bt = b.created_at?.getTime() || 0;
      return bt - at;
    });
    const keep = sorted[0]!;
    console.log(`  duplicates of "${title}": keep ${keep.event_id.slice(0, 8)} (bookings=${keep._count.registrations})`);
    for (const d of sorted.slice(1)) {
      toDelete.add(d.event_id);
      console.log(`    → delete ${d.event_id.slice(0, 8)}`);
    }
  }

  if (toDelete.size === 0) {
    console.log('\nNothing to clean.');
    return;
  }

  console.log(`\nSoft-deleting ${toDelete.size} event(s)…`);
  if (!dryRun) {
    await prisma.event.updateMany({
      where: { event_id: { in: Array.from(toDelete) } },
      data: { deleted_at: new Date() },
    });
  }
  console.log(dryRun ? 'Dry-run complete.' : 'Done.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
