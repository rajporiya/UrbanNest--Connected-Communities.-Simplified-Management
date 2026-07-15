import mongoose from "mongoose"

import {
  BLOOD_GROUPS,
  RESIDENT_DOCUMENT_TYPES,
  RESIDENT_OWNERSHIP_TYPES,
  RESIDENT_STATUSES,
} from "../config/resident.js"

const documentSchema = new mongoose.Schema(
  {
    public_id: { type: String, required: true },
    secure_url: { type: String, required: true },
    documentType: { type: String, enum: RESIDENT_DOCUMENT_TYPES, required: true },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: true }
)

const residentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    towerId: { type: mongoose.Schema.Types.ObjectId, ref: "Tower", required: true, index: true },
    flatId: { type: mongoose.Schema.Types.ObjectId, ref: "Flat", required: true, index: true },
    ownershipType: { type: String, enum: RESIDENT_OWNERSHIP_TYPES, required: true, index: true },
    moveInDate: { type: Date, required: true, index: true },
    emergencyContact: { type: String, required: true, trim: true },
    bloodGroup: { type: String, enum: BLOOD_GROUPS, default: null },
    occupation: { type: String, trim: true, maxlength: 100, default: "" },
    status: { type: String, enum: RESIDENT_STATUSES, default: "Active", index: true },
    familyMemberCount: { type: Number, default: 0, min: 0, max: 10 },
    documents: { type: [documentSchema], default: [] },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
)

residentSchema.index(
  { flatId: 1, ownershipType: 1 },
  { unique: true, partialFilterExpression: { ownershipType: "Owner", isDeleted: false } }
)

const Resident = mongoose.model("Resident", residentSchema)

export default Resident
