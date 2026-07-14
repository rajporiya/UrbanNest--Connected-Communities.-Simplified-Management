import mongoose from "mongoose"

import {
  COMMITTEE_DEPARTMENTS,
  COMMITTEE_PERMISSIONS,
  COMMITTEE_STATUSES,
} from "../config/committee.js"

const committeeMemberSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    department: {
      type: String,
      enum: COMMITTEE_DEPARTMENTS,
      required: true,
      index: true,
    },
    designation: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
      index: true,
    },
    joiningDate: { type: Date, required: true, index: true },
    responsibilities: {
      type: [{ type: String, trim: true, maxlength: 300 }],
      default: [],
    },
    permissions: {
      type: [{ type: String, enum: COMMITTEE_PERMISSIONS }],
      default: [],
    },
    status: {
      type: String,
      enum: COMMITTEE_STATUSES,
      default: "Active",
      index: true,
    },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
)

const CommitteeMember = mongoose.model("CommitteeMember", committeeMemberSchema)

export default CommitteeMember
