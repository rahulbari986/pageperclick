import { EventEmitter } from "events";

/**
 * Shared in-memory event bus for real-time admin notifications.
 * Preserved on the Node.js global object across API invocations in Next.js.
 */

interface AdminGlobal {
  adminEventBus?: EventEmitter;
}

const adminGlobal = global as unknown as AdminGlobal;

if (!adminGlobal.adminEventBus) {
  adminGlobal.adminEventBus = new EventEmitter();
  adminGlobal.adminEventBus.setMaxListeners(150);
}

export const adminEventBus = adminGlobal.adminEventBus;

export const ADMIN_EVENTS = {
  NEW_CONTACT: "admin:new-contact",
  CONTACT_UPDATED: "admin:contact-updated",
  CONTACT_DELETED: "admin:contact-deleted",
  DB_STATUS_CHANGED: "admin:db-status",
} as const;

export function emitNewContact(contact: Record<string, unknown>) {
  try {
    adminEventBus.emit(ADMIN_EVENTS.NEW_CONTACT, contact);
  } catch (err) {
    console.error("Error emitting new contact event:", err);
  }
}

export function emitContactUpdated(contact: Record<string, unknown>) {
  try {
    adminEventBus.emit(ADMIN_EVENTS.CONTACT_UPDATED, contact);
  } catch (err) {
    console.error("Error emitting contact updated event:", err);
  }
}

export function emitContactDeleted(ids: string[]) {
  try {
    adminEventBus.emit(ADMIN_EVENTS.CONTACT_DELETED, { ids });
  } catch (err) {
    console.error("Error emitting contact deleted event:", err);
  }
}
