import { ArrowLeft, UserRoundPlus } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { PageHeader } from "@/components/layout/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ROUTES } from "@/constants/routes.constants"
import { CommitteeMemberForm } from "@/features/committee-members/components/committee-member-form"
import {
  committeeMemberFormDefaultValues,
  type CommitteeMemberFormValues,
} from "@/features/committee-members/schemas/committee-member.schema"
import { createCommitteeMember } from "@/features/committee-members/store/committee-members.slice"
import { useAppDispatch } from "@/hooks/use-app-dispatch"
import { useAppSelector } from "@/hooks/use-app-selector"

export function AddCommitteeMemberPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const isSubmitting = useAppSelector(
    (state) =>
      state.committeeMembers.mutationLoading &&
      state.committeeMembers.activeMutation === "create",
  )

  const handleSubmit = async (values: CommitteeMemberFormValues) => {
    try {
      const member = await dispatch(createCommitteeMember(values)).unwrap()
      toast.success("Committee member added successfully.")
      navigate(`${ROUTES.COMMITTEE_MEMBERS}/${member.id}`, { replace: true })
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "The committee member could not be added. Please review the details and try again.",
      )
    }
  }

  return (
    <div className="min-w-0 space-y-6">
      <PageHeader
        title="Add committee member"
        description="Create a committee profile and assign its responsibilities."
        icon={<UserRoundPlus className="size-5" />}
        breadcrumbs={
          <Link
            className="inline-flex items-center gap-1.5 hover:text-foreground"
            to={ROUTES.COMMITTEE_MEMBERS}
          >
            <ArrowLeft aria-hidden="true" className="size-3.5" />
            Committee Members
          </Link>
        }
      />

      <Card className="min-w-0 overflow-hidden">
        <CardHeader className="border-b border-border bg-muted/20 px-4 py-5 sm:px-6">
          <CardTitle>Committee member details</CardTitle>
          <p className="text-sm leading-6 text-muted-foreground">
            Fields marked with an asterisk are required. Responsibilities can be
            updated later.
          </p>
        </CardHeader>
        <CardContent className="px-4 pt-6 sm:px-6">
          <CommitteeMemberForm
            mode="create"
            initialValues={committeeMemberFormDefaultValues}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
            onCancel={() => navigate(-1)}
          />
        </CardContent>
      </Card>
    </div>
  )
}

