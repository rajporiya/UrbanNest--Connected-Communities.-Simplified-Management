import { z } from "zod"
export const voteSchema = z.object({ optionId: z.string().min(1, "Select an option before voting") })
export type VoteFormValues = z.infer<typeof voteSchema>
