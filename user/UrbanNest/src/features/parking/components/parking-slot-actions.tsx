import { useState } from "react"
import { LogOut } from "lucide-react"
import { toast } from "sonner"
import { ConfirmDialog } from "@/components/feedback/confirm-dialog"
import { Button } from "@/components/ui/button"
import { releaseParking } from "@/features/parking/store/parking.slice"
import type { ParkingSlot } from "@/features/parking/types/parking.types"
import { useAppDispatch } from "@/hooks/use-app-dispatch"

export function ParkingSlotActions({ slot, canManage = false }: { slot: ParkingSlot; canManage?: boolean }) { const dispatch = useAppDispatch(); const [open, setOpen] = useState(false); const [loading, setLoading] = useState(false); if (!canManage || !slot.assignment) return null; const release = async () => { setLoading(true); try { await dispatch(releaseParking(slot.id)).unwrap(); toast.success(`${slot.slotNumber} is now vacant.`); setOpen(false) } catch (error) { toast.error(typeof error === "string" ? error : "Parking could not be released.") } finally { setLoading(false) } }; return <><Button variant="destructive" size="sm" onClick={() => setOpen(true)}><LogOut />Release slot</Button><ConfirmDialog open={open} onOpenChange={setOpen} title={`Release ${slot.slotNumber}?`} description="The active assignment will move to parking history and this slot will become vacant." confirmLabel="Release slot" destructive loading={loading} onConfirm={release} /></> }
