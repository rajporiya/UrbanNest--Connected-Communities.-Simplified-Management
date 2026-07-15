export const RESIDENT_OWNERSHIP_TYPES = ["Owner", "Tenant"]
export const RESIDENT_STATUSES = ["Active", "Inactive"]
export const RESIDENT_DOCUMENT_TYPES = [
  "Aadhaar Card",
  "PAN Card",
  "Rental Agreement",
  "Sale Deed",
  "Other Documents",
]
export const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]

export function allowMultipleTenants() {
  return String(process.env.ALLOW_MULTIPLE_TENANTS || "true").toLowerCase() === "true"
}
