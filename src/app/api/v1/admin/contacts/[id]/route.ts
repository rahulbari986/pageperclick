import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Contact } from "@/models/Contact";
import { sanitizeInput } from "@/lib/security";
import { logger } from "@/lib/logger";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
      const validStatuses = ["NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "ARCHIVED"];
      if (validStatuses.includes(body.status)) {
        updateFields.status = body.status;
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

    logger.audit("ADMIN_UPDATED_CONTACT", { id, fields: Object.keys(updateFields) });

    return NextResponse.json({
      success: true,
      contact: updatedContact,
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
