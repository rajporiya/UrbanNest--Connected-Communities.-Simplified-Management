import type {
  ReportCategory,
  ReportSnapshot,
} from "@/features/reports/types/report.types"

const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]

const categoryContent: Record<
  ReportCategory,
  { title: string; description: string; primary: string; secondary: string }
> = {
  users: {
    title: "User reports",
    description: "Resident, committee, and staff growth across UrbanNest.",
    primary: "Active users",
    secondary: "New users",
  },
  payments: {
    title: "Payment reports",
    description: "Collections, pending dues, and settlement performance.",
    primary: "Collected",
    secondary: "Pending",
  },
  complaints: {
    title: "Complaint reports",
    description: "Complaint volume, resolution speed, and open workload.",
    primary: "Resolved",
    secondary: "Open",
  },
  visitors: {
    title: "Visitor reports",
    description: "Visitor volume, check-ins, and gate activity.",
    primary: "Checked in",
    secondary: "Pre-approved",
  },
  amenities: {
    title: "Amenity reports",
    description: "Bookings, utilization, and approval trends.",
    primary: "Bookings",
    secondary: "Utilization",
  },
  security: {
    title: "Security reports",
    description: "Guard coverage, incidents, and checkpoint activity.",
    primary: "Checkpoints",
    secondary: "Incidents",
  },
}

export const reportSnapshots: Record<ReportCategory, ReportSnapshot> =
  Object.fromEntries(
    (Object.keys(categoryContent) as ReportCategory[]).map(
      (category, categoryIndex) => {
        const content = categoryContent[category]
        const base = 72 + categoryIndex * 19
        const snapshot: ReportSnapshot = {
          category,
          title: content.title,
          description: content.description,
          generatedAt: "2026-07-15T09:30:00.000Z",
          metrics: [
            {
              id: "primary",
              label: content.primary,
              value: category === "payments" ? "₹8.42L" : String(base * 12),
              change: 12.4,
            },
            {
              id: "secondary",
              label: content.secondary,
              value: category === "payments" ? "₹1.16L" : String(base * 3),
              change: -4.2,
            },
            {
              id: "rate",
              label: "Success rate",
              value: `${88 + categoryIndex}%`,
              change: 3.1,
            },
            {
              id: "average",
              label: "Monthly average",
              value: String(base),
              change: 7.8,
            },
          ],
          chart: labels.map((label, index) => ({
            label,
            primary: base + index * 13 + (index % 2) * 8,
            secondary: Math.max(8, Math.round(base / 3) + index * 4),
          })),
          rows: Array.from({ length: 8 }, (_, index) => ({
            id: `${category}-${index + 1}`,
            name: `${content.primary} record ${index + 1}`,
            category: content.secondary,
            value:
              category === "payments"
                ? `₹${(1800 + index * 675).toLocaleString("en-IN")}`
                : String(base + index * 11),
            status: index % 3 === 0 ? "Pending" : "Completed",
            date: new Date(Date.UTC(2026, 6, 14 - index)).toISOString(),
          })),
        }
        return [category, snapshot]
      }
    )
  ) as Record<ReportCategory, ReportSnapshot>
