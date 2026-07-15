import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { ChartCard } from "@/components/global"
import type { ReportChartPoint } from "@/features/reports/types/report.types"

export function ReportChart({
  data,
  title,
}: {
  data: ReportChartPoint[]
  title: string
}) {
  return (
    <ChartCard
      title={`${title} trend`}
      description="Primary and secondary activity over the last six months."
    >
      <div
        className="h-72 w-full"
        aria-label={`${title} trend chart`}
        role="img"
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="primary"
              stroke="var(--chart-2)"
              strokeWidth={2.5}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="secondary"
              stroke="var(--chart-4)"
              strokeWidth={2.5}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  )
}
