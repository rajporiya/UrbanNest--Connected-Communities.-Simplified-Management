import mongoose from "mongoose"

const visitorSchema = new mongoose.Schema(
  {
    residentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    residentName: {
      type: String,
      required: true,
      trim: true,
    },
    tower: {
      type: String,
      required: true,
      trim: true,
    },
    flatNumber: {
      type: String,
      required: true,
      trim: true,
    },
    visitorName: {
      type: String,
      required: true,
      trim: true,
    },
    mobile: {
      type: String,
      required: true,
      trim: true,
    },
    purpose: {
      type: String,
      enum: ["guest", "delivery", "service", "cab", "other"],
      required: true,
    },
    purposeNote: {
      type: String,
      required: true,
      trim: true,
    },
    visitDate: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["expected", "checked-in", "checked-out", "cancelled"],
      default: "expected",
      index: true,
    },
    qrCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    vehicleNumber: {
      type: String,
      trim: true,
      default: "",
    },
    remarks: {
      type: String,
      trim: true,
      default: "",
    },
    checkedInAt: {
      type: Date,
      default: null,
    },
    checkedOutAt: {
      type: Date,
      default: null,
    },
    verifiedBy: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
)

const Visitor = mongoose.model("Visitor", visitorSchema)

export default Visitor
