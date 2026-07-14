import { z } from "zod"

export const announcementFormSchema = z.object({
  title: z.string().trim().min(5, "Enter at least 5 characters").max(120),
  summary: z.string().trim().min(10, "Enter a short summary").max(240),
  content: z.string().trim().min(20, "Announcement content must be at least 20 characters").max(8000),
  category: z.enum(["general", "maintenance", "event", "emergency"]),
  audience: z.enum(["all", "residents", "committee", "security"]),
  status: z.enum(["draft", "published", "archived"]),
  expiresAt: z.string(),
})

export type AnnouncementFormValues = z.infer<typeof announcementFormSchema>

export const announcementFormDefaults: AnnouncementFormValues = {
  title: "",
  summary: "",
  content: "",
  category: "general",
  audience: "all",
  status: "draft",
  expiresAt: "",
}
