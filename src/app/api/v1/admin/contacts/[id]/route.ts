import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Contact } from "@/models/Contact";
import { sanitizeInput, decodeHtmlEntities } from "@/lib/security";
import { logger } from "@/lib/logger";
import { emitContactUpdated, emitContactDeleted } from "@/lib/adminEventBus";
import { verifyAdminRequest } from "@/lib/adminAuth";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const forwardedFor = req.headers.get("x-forwarded-for");
  const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";

  // Section 2.1: Enforce administrative authorization
  const auth = verifyAdminRequest(req);
  if (!auth.authenticated) {
    logger.warn("UNAUTHORIZED_ADMIN_UPDATE_ATTEMPT", { url: req.url }, ip);
    return NextResponse.json(
      { error: "Unauthorized access. Authentication required." },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid contact ID." }, { status: 400 });
    }

    await connectToDatabase();
    const body = await req.json();

    const updateFields: Record<string, unknown> = {};

    if (body.fullName !== undefined) updateFields.fullName = sanitizeInput(body.fullName);
    if (body.email !== undefined) updateFields.email = sanitizeInput(body.email).toLowerCase();
    if (body.phone !== undefined) updateFields.phone = sanitizeInput(body.phone);
    if (body.company !== undefined) updateFields.company = sanitizeInput(body.company);
    if (body.service !== undefined) updateFields.service = sanitizeInput(body.service);
    if (body.message !== undefined) updateFields.message = sanitizeInput(body.message);
    if (body.status !== undefined) {
      let st = body.status;
      if (st === "QUALIFIED") st = "PENDING";
      const validStatuses = ["NEW", "PENDING", "CONTACTED"];
      if (validStatuses.includes(st)) {
        updateFields.status = st;
      }
    }
    if (body.adminNotes !== undefined) updateFields.adminNotes = sanitizeInput(body.adminNotes);

    const updatedContact = await Contact.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).lean();

    if (!updatedContact) {
      return NextResponse.json({ error: "Contact not found." }, { status: 404 });
    }

    const cleanedContact = {
      ...updatedContact,
      fullName: decodeHtmlEntities(updatedContact.fullName),
      company: decodeHtmlEntities(updatedContact.company || ""),
      service: decodeHtmlEntities(updatedContact.service),
      message: decodeHtmlEntities(updatedContact.message),
      adminNotes: decodeHtmlEntities(updatedContact.adminNotes || ""),
    };

    emitContactUpdated(cleanedContact as unknown as Record<string, unknown>);
    logger.audit("ADMIN_UPDATED_CONTACT", { id, fields: Object.keys(updateFields) });

    return NextResponse.json({
      success: true,
      contact: cleanedContact,
      message: "Contact updated successfully.",
    });
  } catch (error: unknown) {
    logger.error("ADMIN_PATCH_CONTACT_ERROR", error);
    return NextResponse.json(
      { error: "Failed to update contact." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid contact ID." }, { status: 400 });
    }

    await connectToDatabase();

    const deleted = await Contact.findByIdAndDelete(id).lean();

    if (!deleted) {
      return NextResponse.json({ error: "Contact not found." }, { status: 404 });
    }

    emitContactDeleted([id]);
    logger.audit("ADMIN_DELETED_CONTACT", { id });

    return NextResponse.json({
      success: true,
      message: "Contact deleted successfully.",
    });
  } catch (error: unknown) {
    logger.error("ADMIN_DELETE_CONTACT_ERROR", error);
    return NextResponse.json(
      { error: "Failed to delete contact." },
      { status: 500 }
    );
  }
}
