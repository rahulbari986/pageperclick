import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Contact } from "@/models/Contact";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
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
      } else {
        filter.status = status;
      }
    }

    if (service && service !== "ALL") {
      filter.service = { $regex: new RegExp(service, "i") };
    }

    if (search) {
      const searchOr = [
        { fullName: { $regex: new RegExp(search, "i") } },
        { email: { $regex: new RegExp(search, "i") } },
        { phone: { $regex: new RegExp(search, "i") } },
        { company: { $regex: new RegExp(search, "i") } },
        { message: { $regex: new RegExp(search, "i") } },
      ];
      if (filter.$and) {
        (filter.$and as Record<string, unknown>[]).push({ $or: searchOr });
      } else {
        filter.$or = searchOr;
      }
    }

    // Parallel execution for data and stats
    const [rawContacts, total, newCount, contactedCount, qualifiedCount, convertedCount] = await Promise.all([
      Contact.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Contact.countDocuments(filter),
      Contact.countDocuments({
        $or: [{ status: "NEW" }, { status: { $exists: false } }, { status: null }],
      }),
      Contact.countDocuments({ status: "CONTACTED" }),
      Contact.countDocuments({ status: "QUALIFIED" }),
      Contact.countDocuments({ status: "CONVERTED" }),
    ]);

    const totalAll = await Contact.countDocuments({});

    const contacts = rawContacts.map((c: any) => ({
      ...c,
      status: c.status || "NEW",
      adminNotes: c.adminNotes || "",
    }));

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
        contactedCount,
        qualifiedCount,
        convertedCount,
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
