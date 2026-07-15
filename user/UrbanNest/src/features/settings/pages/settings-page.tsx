import { useEffect } from "react"
import { Palette, Settings2 } from "lucide-react"
import { toast } from "sonner"

import { ThemeModeDropdown } from "@/components/common/theme-mode-dropdown"
import { ContentCard } from "@/components/common/content-card"
import { LoadingState } from "@/components/feedback/loading-state"
import { PageHeader } from "@/components/layout/page-header"
import { ROLES } from "@/constants/roles.constants"
import { SettingsForm } from "@/features/settings/components/settings-form"
import {
  fetchSettings,
  saveSettings,
} from "@/features/settings/store/settings.slice"
import type { UrbanNestSettings } from "@/features/settings/types/settings.types"
import { useAppDispatch } from "@/hooks/use-app-dispatch"
import { useAppSelector } from "@/hooks/use-app-selector"

export function SettingsPage() {
  const dispatch = useAppDispatch()
  const { data, loading, saving, error } = useAppSelector(
    (state) => state.settings
  )
  const role = useAppSelector((state) => state.auth.user?.role)
  useEffect(() => {
    if (!data) void dispatch(fetchSettings())
  }, [data, dispatch])
  const submit = async (values: UrbanNestSettings) => {
    try {
      await dispatch(saveSettings(values)).unwrap()
      toast.success("Settings saved")
    } catch (message) {
      toast.error(
        typeof message === "string" ? message : "Settings could not be saved"
      )
    }
  }
  if (loading && !data)
    return <LoadingState label="Loading settings..." className="py-20" />
  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage society configuration, security, appearance, and your notification preferences."
        icon={<Settings2 className="size-5" />}
      />
      <ContentCard
        title="Appearance"
        description="Theme preference is saved to this browser and follows your system when selected."
        icon={<Palette />}
        headerAction={<ThemeModeDropdown />}
      >
        <p className="text-sm text-muted-foreground">
          Choose light, dark, or system mode from the theme menu.
        </p>
      </ContentCard>
      {error ? (
        <div
          role="alert"
          className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
        >
          {error}
        </div>
      ) : null}
      {data ? (
        <ContentCard>
          <SettingsForm
            values={data}
            saving={saving}
            canManageSociety={role === ROLES.COMMITTEE_HEAD}
            onSubmit={submit}
          />
        </ContentCard>
      ) : null}
    </div>
  )
}
