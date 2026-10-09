import mongoose, { Schema, Document, Model } from "mongoose";

export interface IContact extends Document {
  fullName: string;
  email: string;
  phone: string;
  company?: string;
  service: string;
  message: string;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  ipAddress?: string;
  status: "NEW" | "CONTACTED" | "QUALIFIED" | "CONVERTED" | "ARCHIVED";
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ContactSchema: Schema<IContact> = new Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      index: true,
      maxlength: 255,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      index: true,
      maxlength: 20,
    },
    company: {
      type: String,
      trim: true,
      maxlength: 100,
      default: "",
    },
    service: {
      type: String,
      required: [true, "Service is required"],
      trim: true,
      maxlength: 100,
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
      maxlength: 2000,
    },
    utm_source: {
      type: String,
      trim: true,
      default: null,
    },
    utm_medium: {
      type: String,
      trim: true,
      default: null,
    },
    utm_campaign: {
      type: String,
      trim: true,
      default: null,
    },
    ipAddress: {
      type: String,
      trim: true,
      default: null,
    },
    status: {
      type: String,
      enum: ["NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "ARCHIVED"],
      default: "NEW",
      index: true,
    },
    adminNotes: {
      type: String,
      trim: true,
      default: "",
      maxlength: 5000,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent model overwrite in development hot reloading
export const Contact: Model<IContact> =
  mongoose.models.Contact || mongoose.model<IContact>("Contact", ContactSchema);

export default Contact;
