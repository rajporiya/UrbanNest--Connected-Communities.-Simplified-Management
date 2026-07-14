import mongoose from "mongoose"

const familyMemberSchema = new mongoose.Schema(
  {
    residentId: { type: mongoose.Schema.Types.ObjectId, ref: "Resident", required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    relation: { type: String, required: true, trim: true, maxlength: 50 },
    gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
    dateOfBirth: { type: Date, required: true },
    mobileNumber: { type: String, trim: true, default: null },
    email: { type: String, trim: true, lowercase: true, default: null },
    occupation: { type: String, trim: true, maxlength: 100, default: "" },
  },
  { timestamps: true }
)

familyMemberSchema.index(
  { mobileNumber: 1 },
  { unique: true, partialFilterExpression: { mobileNumber: { $type: "string" } } }
)
familyMemberSchema.index(
  { email: 1 },
  { unique: true, partialFilterExpression: { email: { $type: "string" } } }
)

const FamilyMember = mongoose.model("FamilyMember", familyMemberSchema)

export default FamilyMember
