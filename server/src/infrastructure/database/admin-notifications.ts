import type { Prisma } from './generated/prisma/client';

type AdminNotification = { title: string; message: string; type: string; targetUrl: string };

/** Store one alert per administrator as part of the transaction that created the event. */
export async function notifyAdministrators(tx: Prisma.TransactionClient, notification: AdminNotification): Promise<void> {
  const admins = await tx.user.findMany({
    where: { deleted_at: null, role: { is: { name: 'Administrator', deleted_at: null } } },
    select: { id: true },
  });
  if (!admins.length) return;
  await tx.notification.createMany({
    data: admins.map(({ id }) => ({ user_id: id, title: notification.title, message: notification.message, type: notification.type, target_url: notification.targetUrl })),
  });
}
