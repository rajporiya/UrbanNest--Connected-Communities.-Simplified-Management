import { useEffect, useMemo } from "react"
import { ArrowLeft, PencilLine } from "lucide-react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"

import { ErrorState } from "@/components/feedback/error-state"
import { LoadingState } from "@/components/feedback/loading-state"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ROUTES } from "@/constants/routes.constants"
import { CommitteeMemberForm } from "@/features/committee-members/components/committee-member-form"
import type { CommitteeMemberFormValues } from "@/features/committee-members/schemas/committee-member.schema"
import {
  clearSelectedCommitteeMember,
  fetchCommitteeMemberDetails,
  updateCommitteeMember,
} from "@/features/committee-members/store/committee-members.slice"
import type { CommitteeMemberDetails } from "@/features/committee-members/types/committee-member.types"
import { useAppDispatch } from "@/hooks/use-app-dispatch"
import { useAppSelector } from "@/hooks/use-app-selector"

function toFormValues(
  member: CommitteeMemberDetails,
): CommitteeMemberFormValues {
  return {
    fullName: member.fullName,
    email: member.email,
    mobile: member.mobile,
    profileImageUrl: member.profileImageUrl ?? "",
    department: member.department,
    designation: member.designation,
    responsibilities: [...member.responsibilities],
    joinedDate: member.joinedDate,
    status: member.status,
  }
}

export function EditCommitteeMemberPage() {
  const params = useParams<{
    committeeMemberId?: string
    id?: string
  }>()
  const committeeMemberId = params.committeeMemberId ?? params.id
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const {
    selectedMember,
    detailsLoading,
    mutationLoading,
    activeMutation,
    error,
  } = useAppSelector((state) => state.committeeMembers)
  const isSubmitting = mutationLoading && activeMutation === "update"
  const member =
    selectedMember?.id === committeeMemberId ? selectedMember : null
  const initialValues = useMemo(
    () => (member ? toFormValues(member) : undefined),
    [member],
  )

  useEffect(() => {
    dispatch(clearSelectedCommitteeMember())
    if (!committeeMemberId) return

    const request = dispatch(fetchCommitteeMemberDetails(committeeMemberId))
    return () => {
      request.abort()
      dispatch(clearSelectedCommitteeMember())
    }
  }, [committeeMemberId, dispatch])

  const handleSubmit = async (values: CommitteeMemberFormValues) => {
    if (!committeeMemberId) return

    try {
      const updatedMember = await dispatch(
        updateCommitteeMember({ id: committeeMemberId, data: values }),
      ).unwrap()
      toast.success("Committee member updated successfully.")
      navigate(`${ROUTES.COMMITTEE_MEMBERS}/${updatedMember.id}`, {
        replace: true,
      })
    } catch (submitError) {
      toast.error(
        submitError instanceof Error
          ? submitError.message
          : "The committee member could not be updated. Please try again.",
      )
    }
  }

  const handleRetry = async () => {
    if (!committeeMemberId) return
    dispatch(clearSelectedCommitteeMember())
    await dispatch(fetchCommitteeMemberDetails(committeeMemberId))
  }

  if (!committeeMemberId) {
    return (
      <ErrorState
        title="Committee member ID is missing"
        description="Open a committee member from the list and try again."
        backAction={
          <Button render={<Link to={ROUTES.COMMITTEE_MEMBERS} />}>
            Back to committee members
          </Button>
        }
      />
    )
  }

  const header = (
    <PageHeader
      title={member ? `Edit ${member.fullName}` : "Edit committee member"}
      description="Update the member's contact details, assignment, and responsibilities."
      icon={<PencilLine className="size-5" />}
      breadcrumbs={
        <Link
          className="inline-flex items-center gap-1.5 hover:text-foreground"
          to={`${ROUTES.COMMITTEE_MEMBERS}/${committeeMemberId}`}
        >
          <ArrowLeft aria-hidden="true" className="size-3.5" />
          Committee member details
        </Link>
      }
    />
  )

  if (detailsLoading) {
    return (
      <div className="min-w-0 space-y-6">
        {header}
        <LoadingState
          label="Loading committee member form..."
          className="py-20"
        />
      </div>
    )
  }

  if (!member) {
    return (
      <div className="space-y-6">
        {header}
        <ErrorState
          title="Committee member unavailable"
          description={
            error ??
            "This committee member may no longer exist or you may not have access to edit it."
          }
          onRetry={handleRetry}
          backAction={
            <Button
              variant="outline"
              render={<Link to={ROUTES.COMMITTEE_MEMBERS} />}
            >
              Back to committee members
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="min-w-0 space-y-6">
      {header}
      <Card className="min-w-0 overflow-hidden">
        <CardHeader className="border-b border-border bg-muted/20 px-4 py-5 sm:px-6">
          <CardTitle>Committee member details</CardTitle>
          <p className="text-sm leading-6 text-muted-foreground">
            Review all changes before saving this committee profile.
          </p>
        </CardHeader>
        <CardContent className="px-4 pt-6 sm:px-6">
          <CommitteeMemberForm
            key={member.id}
            mode="edit"
            initialValues={initialValues}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
            onCancel={() => navigate(-1)}
          />
        </CardContent>
      </Card>
    </div>
  )
}

