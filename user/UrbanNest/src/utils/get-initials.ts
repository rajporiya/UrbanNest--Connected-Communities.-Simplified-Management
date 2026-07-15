export function getInitials(firstName?: string | null, lastName?: string | null) {
  const initials = [firstName, lastName]
    .filter((name): name is string => Boolean(name?.trim()))
    .map((name) => name.trim().charAt(0).toUpperCase())
    .join("")
  return initials || "UN"
}
