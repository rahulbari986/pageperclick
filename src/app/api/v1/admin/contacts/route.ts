import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Contact } from "@/models/Contact";
import { logger } from "@/lib/logger";
import { emitContactDeleted } from "@/lib/adminEventBus";
import { verifyAdminRequest } from "@/lib/adminAuth";
import { decodeHtmlEntities } from "@/lib/security";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

function escapeRegExp(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function GET(req: NextRequest) {
  const forwardedFor = req.headers.get("x-forwarded-for");
  const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";

  // Section 2.1: Enforce administrative authorization
  const auth = verifyAdminRequest(req);
  if (!auth.authenticated) {
    logger.warn("UNAUTHORIZED_ADMIN_READ_ATTEMPT", { url: req.url }, ip);
    return NextResponse.json(
      { error: "Unauthorized access. Authentication required." },
      { status: 401 }
    );
  }

  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim() || "";
    const status = searchParams.get("status")?.trim() || "ALL";
    const service = searchParams.get("service")?.trim() || "ALL";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)));
    const skip = (page - 1) * limit;

    // Filter criteria
    const filter: Record<string, unknown> = {};

    if (status && status !== "ALL") {
      if (status === "NEW") {
        filter.$and = filter.$and || [];
        (filter.$and as Record<string, unknown>[]).push({
          $or: [{ status: "NEW" }, { status: { $exists: false } }, { status: null }],
        });
      } else if (status === "PENDING") {
        filter.$and = filter.$and || [];
        (filter.$and as Record<string, unknown>[]).push({
          $or: [{ status: "PENDING" }, { status: "QUALIFIED" }],
        });
      } else if (status === "CONTACTED") {
        filter.status = "CONTACTED";
      } else {
        filter.status = status;
      }
    }

    if (service && service !== "ALL") {
      filter.service = { $regex: new RegExp(escapeRegExp(service), "i") };
    }

    const sourceParam = searchParams.get("source")?.trim();
    if (sourceParam && sourceParam !== "ALL") {
      if (sourceParam.toLowerCase() === "direct") {
        const directFilter = [
          { utm_source: null },
          { utm_source: "" },
          { utm_source: { $exists: false } },
          { utm_source: { $regex: /^direct$/i } },
        ];
        if (filter.$and) {
          (filter.$and as Record<string, unknown>[]).push({ $or: directFilter });
        } else {
          filter.$or = directFilter;
        }
      } else {
        filter.utm_source = { $regex: new RegExp(escapeRegExp(sourceParam), "i") };
      }
    }

    if (search) {
      const escapedSearch = escapeRegExp(search);
      const searchOr = [
        { fullName: { $regex: new RegExp(escapedSearch, "i") } },
        { email: { $regex: new RegExp(escapedSearch, "i") } },
        { phone: { $regex: new RegExp(escapedSearch, "i") } },
        { company: { $regex: new RegExp(escapedSearch, "i") } },
        { message: { $regex: new RegExp(escapedSearch, "i") } },
        { utm_source: { $regex: new RegExp(escapedSearch, "i") } },
        { utm_medium: { $regex: new RegExp(escapedSearch, "i") } },
        { utm_campaign: { $regex: new RegExp(escapedSearch, "i") } },
        { ipAddress: { $regex: new RegExp(escapedSearch, "i") } },
      ];
      if (filter.$and) {
        (filter.$and as Record<string, unknown>[]).push({ $or: searchOr });
      } else {
        filter.$or = searchOr;
      }
    }

    // Parallel execution for data and stats (NEW, PENDING, CONTACTED)
    const [rawContacts, total, newCount, pendingCount, contactedCount] = await Promise.all([
      Contact.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Contact.countDocuments(filter),
      Contact.countDocuments({
        $or: [{ status: "NEW" }, { status: { $exists: false } }, { status: null }],
      }),
      Contact.countDocuments({
        $or: [
          { status: "PENDING" },
          { status: "QUALIFIED" as unknown as "PENDING" },
        ],
      }),
      Contact.countDocuments({ status: "CONTACTED" }),
    ]);

    const totalAll = await Contact.countDocuments({});

    const contacts = rawContacts.map((c) => {
      const rawStatus = (c as unknown as Record<string, unknown>).status as string | undefined;
      let leadStatus: "NEW" | "PENDING" | "CONTACTED" = "NEW";
      if (rawStatus === "PENDING" || rawStatus === "QUALIFIED") {
        leadStatus = "PENDING";
      } else if (rawStatus === "CONTACTED") {
        leadStatus = "CONTACTED";
      }

      const decodedService = decodeHtmlEntities(c.service);
      const decodedFullName = decodeHtmlEntities(c.fullName);
      const decodedCompany = decodeHtmlEntities(c.company || "");
      const decodedMessage = decodeHtmlEntities(c.message);
      const decodedNotes = decodeHtmlEntities(c.adminNotes || "");

      // Self-heal corrupted database records if they contain entity artifacts (&amp;amp;)
      if (c.service && c.service !== decodedService) {
        Contact.updateOne(
          { _id: c._id },
          {
            $set: {
              service: decodedService,
              fullName: decodedFullName,
              company: decodedCompany,
              message: decodedMessage,
              adminNotes: decodedNotes,
            },
          }
        ).exec().catch(() => {});
      }

      return {
        ...c,
        fullName: decodedFullName,
        company: decodedCompany,
        service: decodedService,
        message: decodedMessage,
        adminNotes: decodedNotes,
        status: leadStatus,
      };
    });

    return NextResponse.json({
      success: true,
      contacts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
      stats: {
        totalAll,
        newCount,
        pendingCount,
        contactedCount,
      },
    });
  } catch (error: unknown) {
    logger.error("ADMIN_GET_CONTACTS_ERROR", error);
    return NextResponse.json(
      { error: "Failed to retrieve contacts from database." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const forwardedFor = req.headers.get("x-forwarded-for");
  const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";

  // Section 2.1: Enforce administrative authorization
  const auth = verifyAdminRequest(req);
  if (!auth.authenticated) {
    logger.warn("UNAUTHORIZED_ADMIN_DELETE_ATTEMPT", { url: req.url }, ip);
    return NextResponse.json(
      { error: "Unauthorized access. Authentication required." },
      { status: 401 }
    );
  }

  try {
    await connectToDatabase();
    const body = await req.json().catch(() => ({}));
    const { ids } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "No contact IDs provided for bulk deletion." },
        { status: 400 }
      );
    }

    const validIds = ids.filter((id: string) => mongoose.Types.ObjectId.isValid(id));
    if (validIds.length === 0) {
      return NextResponse.json(
        { error: "No valid IDs provided for deletion." },
        { status: 400 }
      );
    }

    const result = await Contact.deleteMany({ _id: { $in: validIds } });
    emitContactDeleted(validIds);
    logger.audit("ADMIN_BULK_DELETED_CONTACTS", { count: result.deletedCount });

    return NextResponse.json({
      success: true,
      deletedCount: result.deletedCount,
      message: `${result.deletedCount} contacts deleted successfully.`,
    });
  } catch (error: unknown) {
    logger.error("ADMIN_BULK_DELETE_CONTACTS_ERROR", error);
    return NextResponse.json(
      { error: "Failed to delete contacts." },
      { status: 500 }
    );
  }
}
