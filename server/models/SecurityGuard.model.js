import mongoose from "mongoose"

import {
  SECURITY_GUARD_GATES,
  SECURITY_GUARD_SHIFTS,
  SECURITY_GUARD_STATUSES,
} from "../config/security-guard.js"

const securityGuardSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    employeeId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
      uppercase: true,
      maxlength: 30,
    },
    gate: {
      type: String,
      enum: SECURITY_GUARD_GATES,
      required: true,
      index: true,
    },
    shift: {
      type: String,
      enum: Object.keys(SECURITY_GUARD_SHIFTS),
      required: true,
      index: true,
    },
    shiftStartTime: { type: String, required: true },
    shiftEndTime: { type: String, required: true },
    joiningDate: { type: Date, required: true, index: true },
    contactNumber: { type: String, required: true, trim: true },
    emergencyContact: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: SECURITY_GUARD_STATUSES,
      default: "Active",
      index: true,
    },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
)

const SecurityGuard = mongoose.model("SecurityGuard", securityGuardSchema)

export default SecurityGuard
