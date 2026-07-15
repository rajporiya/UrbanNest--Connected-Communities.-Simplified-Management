import mongoose from "mongoose"

const residentAssignmentSchema = new mongoose.Schema(
  {
    residentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    towerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tower",
      required: true,
      index: true,
    },
    flatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Flat",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["Active", "Transferred", "Removed"],
      default: "Active",
      index: true,
    },
    assignedAt: { type: Date, required: true, default: Date.now },
    transferDate: { type: Date, default: null },
    removalDate: { type: Date, default: null },
    reason: { type: String, trim: true, maxlength: 500, default: "" },
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    endedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
)

residentAssignmentSchema.index(
  { residentId: 1 },
  { unique: true, partialFilterExpression: { status: "Active" } }
)
residentAssignmentSchema.index(
  { flatId: 1 },
  { unique: true, partialFilterExpression: { status: "Active" } }
)

const ResidentAssignment = mongoose.model("ResidentAssignment", residentAssignmentSchema)

export default ResidentAssignment
