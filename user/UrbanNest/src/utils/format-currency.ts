export function formatCurrency(value: number | string | null | undefined) {
  const amount = typeof value === "string" ? Number(value) : value
  if (amount === null || amount === undefined || !Number.isFinite(amount)) return "₹0.00"
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount)
}
