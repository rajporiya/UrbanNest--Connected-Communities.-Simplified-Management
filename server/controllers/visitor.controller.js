import { asyncHandler } from "../utils/asyncHandler.js"
import { successResponse } from "../utils/response.util.js"
import {
  createVisitor as createVisitorService,
  getVisitors,
  getVisitorById,
  getVisitorByQrCode,
  checkInVisitor,
  checkOutVisitor,
  cancelVisitor,
  getVisitorReport as getVisitorReportService,
} from "../services/visitor.service.js"
import crypto from "crypto"

export const create = asyncHandler(async (req, res) => {
  const qrCode = `UN-${crypto.randomUUID().slice(0, 8).toUpperCase()}`
  const payload = {
    ...req.body,
    qrCode,
    status: "expected",
  }

  const visitor = await createVisitorService(payload)
  return successResponse(res, "Visitor pass created successfully.", { visitor }, 201)
})

export const list = asyncHandler(async (req, res) => {
  const result = await getVisitors(req.query)
  return successResponse(res, "Visitors fetched successfully.", result, 200)
})

export const getOne = asyncHandler(async (req, res) => {
  const visitor = await getVisitorById(req.params.id)
  return successResponse(res, "Visitor fetched successfully.", { visitor }, 200)
})

export const getByCode = asyncHandler(async (req, res) => {
  const visitor = await getVisitorByQrCode(req.params.qrCode)
  return successResponse(res, "Visitor fetched successfully.", { visitor }, 200)
})

export const checkIn = asyncHandler(async (req, res) => {
  const guardName = `${req.user?.firstName || "Security"} ${req.user?.lastName || "Desk"}`.trim()
  const visitor = await checkInVisitor(req.params.id, guardName)
  return successResponse(res, "Visitor checked in successfully.", { visitor }, 200)
})

export const checkOut = asyncHandler(async (req, res) => {
  const visitor = await checkOutVisitor(req.params.id)
  return successResponse(res, "Visitor checked out successfully.", { visitor }, 200)
})

export const cancel = asyncHandler(async (req, res) => {
  const visitor = await cancelVisitor(req.params.id)
  return successResponse(res, "Visitor pass cancelled successfully.", { visitor }, 200)
})

export const report = asyncHandler(async (req, res) => {
  const reportData = await getVisitorReportService()
  return successResponse(res, "Visitor report compiled successfully.", reportData, 200)
})
