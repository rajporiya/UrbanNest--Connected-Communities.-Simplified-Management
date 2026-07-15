import { useSelector } from "react-redux"
import type { AppState } from "@/app/store"

export const useAppSelector = useSelector.withTypes<AppState>()
