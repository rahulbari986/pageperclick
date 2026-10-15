import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { adminEventBus, ADMIN_EVENTS } from "@/lib/adminEventBus";
import { verifyAdminRequest } from "@/lib/adminAuth";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  // Section 2.1: Enforce administrative authorization
  const auth = verifyAdminRequest(req);
  if (!auth.authenticated) {
    return new Response(JSON.stringify({ error: "Unauthorized access." }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Initial DB check
  try {
    await connectToDatabase();
  } catch (err) {
    console.error("Stream route DB connection attempt failed:", err);
  }

  const encoder = new TextEncoder();
  let heartbeatTimer: NodeJS.Timeout | null = null;
  let isClosed = false;

  const stream = new ReadableStream({
    start(controller) {
      function safeSend(event: string, data: unknown) {
        if (isClosed) return;
        try {
          const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(encoder.encode(payload));
        } catch {
          isClosed = true;
        }
      }

      // Initial handshake event
      safeSend("init", {
        status: "connected",
        dbConnected: mongoose.connection.readyState === 1,
        time: new Date().toISOString(),
      });

      // Event listeners
      const handleNewContact = (contact: unknown) => {
        safeSend("new-contact", contact);
      };

      const handleContactUpdated = (contact: unknown) => {
        safeSend("contact-updated", contact);
      };

      const handleContactDeleted = (data: unknown) => {
        safeSend("contact-deleted", data);
      };

      adminEventBus.on(ADMIN_EVENTS.NEW_CONTACT, handleNewContact);
      adminEventBus.on(ADMIN_EVENTS.CONTACT_UPDATED, handleContactUpdated);
      adminEventBus.on(ADMIN_EVENTS.CONTACT_DELETED, handleContactDeleted);

      // Heartbeat ping every 8 seconds with live MongoDB readyState
      heartbeatTimer = setInterval(() => {
        if (isClosed) {
          if (heartbeatTimer) clearInterval(heartbeatTimer);
          return;
        }
        const isDbConnected = mongoose.connection.readyState === 1;
        safeSend("ping", {
          dbConnected: isDbConnected,
          time: new Date().toISOString(),
        });
      }, 8000);

      // Listen for client disconnect
      req.signal.addEventListener("abort", () => {
        isClosed = true;
        if (heartbeatTimer) clearInterval(heartbeatTimer);
        adminEventBus.off(ADMIN_EVENTS.NEW_CONTACT, handleNewContact);
        adminEventBus.off(ADMIN_EVENTS.CONTACT_UPDATED, handleContactUpdated);
        adminEventBus.off(ADMIN_EVENTS.CONTACT_DELETED, handleContactDeleted);
        try {
          controller.close();
        } catch {
          // ignore
        }
      });
    },
    cancel() {
      isClosed = true;
      if (heartbeatTimer) clearInterval(heartbeatTimer);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
