import Visitor from "../models/Visitor.model.js"
import ApiError from "../utils/ApiError.js"

export async function createVisitor(data) {
  try {
    const visitor = await Visitor.create(data)
    return visitor
  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError(409, "Visitor pass QR code already exists.")
    }
    throw error
  }
}

export async function getVisitors(filters) {
  const page = Number(filters.page) || 1
  const limit = Math.min(Number(filters.limit) || 10, 100)
  const query = {}

  if (filters.residentId) {
    query.residentId = filters.residentId
  }
  if (filters.status) {
    query.status = filters.status
  }
  if (filters.purpose) {
    query.purpose = filters.purpose
  }

  if (filters.search) {
    const escaped = filters.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    const pattern = new RegExp(escaped, "i")
    query.$or = [
      { visitorName: pattern },
      { mobile: pattern },
      { residentName: pattern },
      { flatNumber: pattern },
      { qrCode: pattern },
    ]
  }

  const sortFields = new Set(["visitDate", "visitorName", "status", "createdAt", "updatedAt"])
  const sortBy = sortFields.has(filters.sortBy) ? filters.sortBy : "visitDate"
  const sortOrder = filters.sortOrder === "asc" ? 1 : -1

  const [visitors, total] = await Promise.all([
    Visitor.find(query)
      .sort({ [sortBy]: sortOrder })
      .skip((page - 1) * limit)
      .limit(limit),
    Visitor.countDocuments(query),
  ])

  return {
    visitors,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}

export async function getVisitorById(id) {
  const visitor = await Visitor.findById(id)
  if (!visitor) throw new ApiError(404, "Visitor pass not found.")
  return visitor
}

export async function getVisitorByQrCode(qrCode) {
  const visitor = await Visitor.findOne({ qrCode })
  if (!visitor) throw new ApiError(404, "Visitor pass not found.")
  return visitor
}

export async function checkInVisitor(id, verifiedBy) {
  const visitor = await getVisitorById(id)
  if (visitor.status !== "expected") {
    throw new ApiError(400, "Only expected visitors can be checked in.")
  }

  visitor.status = "checked-in"
  visitor.checkedInAt = new Date()
  visitor.verifiedBy = verifiedBy || "Security Desk"
  await visitor.save()
  return visitor
}

export async function checkOutVisitor(id) {
  const visitor = await getVisitorById(id)
  if (visitor.status !== "checked-in") {
    throw new ApiError(400, "Only checked-in visitors can be checked out.")
  }

  visitor.status = "checked-out"
  visitor.checkedOutAt = new Date()
  await visitor.save()
  return visitor
}

export async function cancelVisitor(id) {
  const visitor = await getVisitorById(id)
  if (visitor.status !== "expected") {
    throw new ApiError(400, "Only expected visitor passes can be cancelled.")
  }

  visitor.status = "cancelled"
  await visitor.save()
  return visitor
}

export async function getVisitorReport() {
  const todayStr = new Date().toISOString().slice(0, 10)

  const [total, expected, inside, completed, today] = await Promise.all([
    Visitor.countDocuments(),
    Visitor.countDocuments({ status: "expected" }),
    Visitor.countDocuments({ status: "checked-in" }),
    Visitor.countDocuments({ status: "checked-out" }),
    Visitor.countDocuments({ visitDate: todayStr }),
  ])

  return {
    total,
    expected,
    inside,
    completed,
    today,
  }
}
