import prisma from '../lib/prisma';

/**
 * Clean up expired idempotency keys from the database
 * Run this periodically (e.g., via cron job or background task)
 */
export async function cleanupExpiredIdempotencyKeys(): Promise<number> {
  const result = await prisma.idempotencyKey.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  });

  console.log(`[Cleanup] Deleted ${result.count} expired idempotency keys`);
  return result.count;
}

// Optional: run cleanup on a schedule if needed
if (require.main === module) {
  cleanupExpiredIdempotencyKeys()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Cleanup failed:', err);
      process.exit(1);
    });
}
