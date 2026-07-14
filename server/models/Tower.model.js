import mongoose from "mongoose"

const towerSchema = new mongoose.Schema(
  {
    towerName: {
      type: String,
      required: [true, "Tower name is required"],
      trim: true,
      uppercase: true,
      maxlength: 20,
      unique: true,
      index: true,
    },
    description: { type: String, trim: true, maxlength: 500, default: "" },
    totalFloors: { type: Number, required: true, min: 1 },
    totalFlats: { type: Number, required: true, min: 1 },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
      index: true,
    },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
)

const Tower = mongoose.model("Tower", towerSchema)

export default Tower
