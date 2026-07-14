import axios from "axios"

import { appEnv } from "@/lib/env"

export const api = axios.create({
  baseURL: appEnv.apiUrl,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
})