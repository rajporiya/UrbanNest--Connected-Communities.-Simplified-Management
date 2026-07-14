import { useEffect } from "react"
import { KeyRound, ShieldCheck, UserRound } from "lucide-react"
import { toast } from "sonner"
import { ContentCard } from "@/components/common/content-card"
import { RoleBadge } from "@/components/common/role-badge"
import { UserIdentity } from "@/components/common/user-identity"
import { LoadingState } from "@/components/feedback/loading-state"
import { PageHeader } from "@/components/layout/page-header"
import { ChangePasswordForm } from "@/features/profile/components/change-password-form"
import { ProfileForm } from "@/features/profile/components/profile-form"
import { TwoFactorCard } from "@/features/profile/components/two-factor-card"
import {
  changeProfilePassword,
  fetchProfile,
  setProfileTwoFactor,
  updateProfile,
} from "@/features/profile/store/profile.slice"
import type {
  ChangePasswordRequest,
  UpdateProfileRequest,
} from "@/features/profile/types/profile.types"
import { useAppDispatch } from "@/hooks/use-app-dispatch"
import { useAppSelector } from "@/hooks/use-app-selector"

export function ProfilePage() {
  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.auth.user)
  const state = useAppSelector((root) => root.profile)
  useEffect(() => {
    if (user && state.data?.id !== user.id) void dispatch(fetchProfile(user))
  }, [dispatch, state.data?.id, user])
  if (!user) return null
  const profile = state.data?.id === user.id ? state.data : null
  if (!profile && !state.error)
    return <LoadingState label="Loading profile..." className="py-20" />
  const save = async (values: UpdateProfileRequest) => {
    try {
      await dispatch(updateProfile(values)).unwrap()
      toast.success("Profile updated")
    } catch {
      toast.error("Profile could not be updated")
    }
  }
  const password = async (values: ChangePasswordRequest, reset: () => void) => {
    try {
      await dispatch(changeProfilePassword(values)).unwrap()
      reset()
      toast.success("Password changed")
    } catch (error) {
      toast.error(
        typeof error === "string" ? error : "Password could not be changed"
      )
    }
  }
  const toggleTwoFactor = async (enabled: boolean) => {
    try {
      await dispatch(setProfileTwoFactor(enabled)).unwrap()
      toast.success(
        enabled
          ? "Two-factor authentication enabled"
          : "Two-factor authentication disabled"
      )
    } catch {
      toast.error("Security preference could not be updated")
    }
  }
  return (
    <div className="space-y-6">
      <PageHeader
        title="My profile"
        description="Manage your personal information, profile image, and account security."
        icon={<UserRound className="size-5" />}
      />
      {state.error ? (
        <div
          role="alert"
          className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
        >
          {state.error}
        </div>
      ) : null}
      {profile ? (
        <>
          <ContentCard>
            <UserIdentity
              name={`${profile.firstName} ${profile.lastName}`}
              imageUrl={profile.avatar}
              primaryText={profile.email}
              secondaryText={`Member since ${new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric" }).format(new Date(profile.joinedAt))}`}
              badge={<RoleBadge role={profile.role} />}
              avatarSize="lg"
            />
          </ContentCard>
          <ContentCard
            title="Profile information"
            description="Keep your contact and emergency details current."
            icon={<UserRound />}
          >
            <ProfileForm
              values={{
                firstName: profile.firstName,
                lastName: profile.lastName,
                phone: profile.phone,
                avatar: profile.avatar,
                bio: profile.bio,
                address: profile.address,
                emergencyContact: profile.emergencyContact,
              }}
              saving={state.saving}
              onSubmit={save}
            />
          </ContentCard>
          <ContentCard
            title="Two-factor authentication"
            description="Secure your account with an extra verification step."
            icon={<ShieldCheck />}
          >
            <TwoFactorCard
              enabled={profile.twoFactorEnabled}
              loading={state.securityLoading}
              onToggle={toggleTwoFactor}
            />
          </ContentCard>
          <ContentCard
            title="Change password"
            description="Use a strong password that you do not use elsewhere."
            icon={<KeyRound />}
          >
            <ChangePasswordForm
              loading={state.passwordLoading}
              onSubmit={password}
            />
          </ContentCard>
        </>
      ) : null}
    </div>
  )
}
