import type { Prisma } from './generated/prisma/client';

export async function notifyInfluencer(
  tx: Prisma.TransactionClient,
  userId: string,
  notification: { title: string; message: string; type: string; targetUrl: string },
) {
  await tx.notification.create({ data: {
    user_id: userId,
    title: notification.title,
    message: notification.message,
    type: notification.type,
    target_url: notification.targetUrl,
  } });
}
