import { useEffect, useState } from "react"
import { Edit3, Users } from "lucide-react"
import { Link, useParams } from "react-router-dom"

import { AppBreadcrumb } from "@/components/navigation/app-breadcrumb"
import { ContentCard } from "@/components/common/content-card"
import { CopyableText } from "@/components/common/copyable-text"
import { RoleBadge } from "@/components/common/role-badge"
import { StatusBadge } from "@/components/common/status-badge"
import { UserAvatar } from "@/components/common/user-avatar"
import { ErrorState } from "@/components/feedback/error-state"
import { LoadingState } from "@/components/feedback/loading-state"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ROLES } from "@/constants/roles.constants"
import { ROUTES } from "@/constants/routes.constants"
import { ResidentStatusActions } from "@/features/residents/components/resident-status-actions"
import { clearSelectedResident, fetchResidentDetails } from "@/features/residents/store/residents.slice"
import { useAppDispatch } from "@/hooks/use-app-dispatch"
import { useAppSelector } from "@/hooks/use-app-selector"

const tabs = ["Overview", "Family Members", "Vehicles", "Maintenance", "Complaints", "Visitor History"] as const
type Tab = typeof tabs[number]
const date = (value: string | null) => value ? new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(value)) : "Not provided"
const money = (value: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value)

export function ResidentDetailsPage() {
  const { residentId } = useParams<{ residentId: string }>()
  const [activeTab, setActiveTab] = useState<Tab>("Overview")
  const dispatch = useAppDispatch()
  const role = useAppSelector((state) => state.auth.user?.role)
  const { selectedResident: resident, detailsLoading, error } = useAppSelector((state) => state.residents)
  useEffect(() => { dispatch(clearSelectedResident()); if (residentId) void dispatch(fetchResidentDetails(residentId)); return () => { dispatch(clearSelectedResident()) } }, [dispatch, residentId])
  if (detailsLoading) return <LoadingState label="Loading resident profile..." className="py-20" />
  if (!residentId || error || !resident) return <ErrorState title="Resident not found" description="The requested resident record does not exist or is no longer available." onRetry={residentId ? () => dispatch(fetchResidentDetails(residentId)).unwrap().then(() => undefined) : undefined} />

  const overview = [["Email", <CopyableText value={resident.email} />], ["Mobile", <CopyableText value={resident.mobile} />], ["Emergency contact", resident.emergencyContact ? `${resident.emergencyContact.name} · ${resident.emergencyContact.mobile} · ${resident.emergencyContact.relationship}` : "Not provided"], ["Tower", resident.tower.name], ["Flat", resident.flat.number], ["Floor", resident.flat.floor], ["Ownership", resident.ownershipType.replace("_", " ")], ["Move-in date", date(resident.moveInDate)], ["Family members", resident.familyMemberCount], ["Registered vehicles", resident.vehicleCount], ["Outstanding maintenance", money(resident.maintenance.outstandingAmount)], ["Created", date(resident.createdAt)], ["Last updated", date(resident.updatedAt)]] as const
  const tabPanel = activeTab === "Overview" ? <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{overview.map(([label, value]) => <div key={label} className="min-w-0 rounded-lg border border-border p-3"><dt className="text-xs font-medium text-muted-foreground">{label}</dt><dd className="mt-1 min-w-0 break-words text-sm font-medium capitalize">{value}</dd></div>)}</dl> : activeTab === "Family Members" ? <ul className="space-y-3">{resident.familyMembers.map((member) => <li key={member.id} className="rounded-lg border p-3"><p className="font-medium">{member.name}</p><p className="text-sm text-muted-foreground">{member.relation} · {member.mobile ?? "No mobile"}</p></li>)}</ul> : activeTab === "Vehicles" ? <ul className="space-y-3">{resident.vehicles.map((vehicle) => <li key={vehicle.id} className="rounded-lg border p-3"><p className="font-medium">{vehicle.registrationNumber}</p><p className="text-sm text-muted-foreground">{vehicle.make} {vehicle.model} · {vehicle.parkingSlot ?? "No parking slot"}</p></li>)}</ul> : activeTab === "Maintenance" ? <div className="grid gap-3 sm:grid-cols-2"><p className="rounded-lg border p-3">Outstanding: <strong>{money(resident.maintenance.outstandingAmount)}</strong></p><p className="rounded-lg border p-3">Current charge: <strong>{money(resident.maintenance.currentMonthCharge)}</strong></p></div> : activeTab === "Complaints" ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{Object.entries(resident.complaintSummary).map(([label, value]) => <p key={label} className="rounded-lg border p-3 capitalize">{label}: <strong>{value}</strong></p>)}</div> : <ul className="space-y-3">{resident.visitorHistory.map((visit) => <li key={visit.id} className="rounded-lg border p-3"><p className="font-medium">{visit.visitorName}</p><p className="text-sm text-muted-foreground">{visit.purpose} · {date(visit.visitedAt)} · {visit.status.replace("_", " ")}</p></li>)}</ul>

  return <div className="space-y-6"><PageHeader breadcrumbs={<AppBreadcrumb items={[{ label: "Residents", href: ROUTES.RESIDENTS }, { label: resident.fullName }]} />} title={resident.fullName} description={`${resident.tower.name} · Flat ${resident.flat.number}`} badge={<div className="flex flex-wrap gap-2"><RoleBadge role={ROLES.RESIDENT} /><StatusBadge status={resident.approvalStatus} /><StatusBadge status={resident.accountStatus} /></div>} icon={<UserAvatar name={resident.fullName} imageUrl={resident.profileImageUrl} size="lg" />} actions={role === ROLES.COMMITTEE_HEAD ? <div className="flex flex-wrap gap-2"><Button variant="outline" size="sm" render={<Link to={`${ROUTES.RESIDENTS}/${resident.id}/edit`} />}><Edit3 aria-hidden="true" />Edit Resident</Button><ResidentStatusActions resident={resident} currentUserRole={role} /></div> : undefined} /><Separator /><div className="overflow-x-auto"><div role="tablist" aria-label="Resident information" className="flex min-w-max gap-1 border-b">{tabs.map((tab) => <button key={tab} type="button" role="tab" aria-selected={activeTab === tab} onClick={() => setActiveTab(tab)} className={`rounded-t-lg px-4 py-2.5 text-sm font-medium focus-visible:ring-2 focus-visible:ring-ring ${activeTab === tab ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}>{tab}</button>)}</div></div><ContentCard title={activeTab} icon={<Users className="size-5" />}><div role="tabpanel">{tabPanel}</div></ContentCard></div>
}
