import { settingsMock } from "@/features/settings/data/settings.mock"
import { settingsSchema } from "@/features/settings/schemas/settings.schema"
import type {
  UpdateSettingsRequest,
  UrbanNestSettings,
} from "@/features/settings/types/settings.types"

let settingsStore = structuredClone(settingsMock)
const wait = () =>
  new Promise<void>((resolve) => globalThis.setTimeout(resolve, 180))

export const settingsService = {
  async getSettings(): Promise<UrbanNestSettings> {
    await wait()
    return structuredClone(settingsStore)
  },
  async updateSettings(
    data: UpdateSettingsRequest
  ): Promise<UrbanNestSettings> {
    await wait()
    settingsStore = settingsSchema.parse(data)
    return structuredClone(settingsStore)
  },
}
