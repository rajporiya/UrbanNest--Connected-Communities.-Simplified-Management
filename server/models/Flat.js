import mongoose from "mongoose"

const flatSchema = new mongoose.Schema(
  {
    towerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tower",
      required: true,
      index: true,
    },
    floorNumber: { type: Number, required: true, min: 1, index: true },
    flatNumber: { type: String, required: true, trim: true, uppercase: true, maxlength: 20 },
    flatType: {
      type: String,
      enum: ["1BHK", "2BHK", "3BHK", "Villa", "Penthouse"],
      required: true,
      index: true,
    },
    area: { type: Number, required: true, min: 1 },
    maintenanceAmount: { type: Number, required: true, min: 0 },
    occupancyStatus: {
      type: String,
      enum: ["Vacant", "Occupied", "Reserved"],
      default: "Vacant",
      index: true,
    },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
)

flatSchema.index(
  { towerId: 1, flatNumber: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
)

const Flat = mongoose.model("Flat", flatSchema)

export default Flat
