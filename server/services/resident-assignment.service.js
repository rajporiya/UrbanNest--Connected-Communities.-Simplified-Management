import mongoose from "mongoose"

import ROLES from "../config/roles.js"
import Flat from "../models/Flat.model.js"
import ResidentAssignment from "../models/ResidentAssignment.model.js"
import Tower from "../models/Tower.model.js"
import User from "../models/User.model.js"
import ApiError from "../utils/ApiError.js"

const assignmentPopulate = [
  { path: "residentId", select: "firstName lastName email phone" },
  { path: "towerId", select: "towerName status" },
  { path: "flatId", select: "floorNumber flatNumber flatType occupancyStatus" },
]

async function withTransaction(work) {
  const session = await mongoose.startSession()
  try {
    let result
    await session.withTransaction(async () => {
      result = await work(session)
    })
    return result
  } finally {
    await session.endSession()
  }
}

async function requireResident(residentId, session = null) {
  const query = User.findOne({
    _id: residentId,
    role: ROLES.RESIDENT,
    isActive: true,
    isDeleted: { $ne: true },
  })
  if (session) query.session(session)
  const resident = await query
  if (!resident) throw new ApiError(404, "Active resident not found.")
  return resident
}

async function requireResidentRecord(residentId) {
  const resident = await User.findOne({
    _id: residentId,
    role: ROLES.RESIDENT,
    isDeleted: { $ne: true },
  })
  if (!resident) throw new ApiError(404, "Resident not found.")
  return resident
}

async function requireFlatInTower(flatId, towerId, session) {
  const [tower, flat] = await Promise.all([
    Tower.findOne({ _id: towerId, isDeleted: false }).session(session),
    Flat.findOne({ _id: flatId, towerId, isDeleted: false }).session(session),
  ])
  if (!tower) throw new ApiError(404, "Tower not found.")
  if (!flat) throw new ApiError(404, "Flat not found in the selected tower.")
  return { tower, flat }
}

function duplicateAssignmentError(error) {
  if (error.code !== 11000) return error
  if (error.keyPattern?.residentId) return new ApiError(409, "Resident already owns an active flat.")
  return new ApiError(409, "Flat already has an active owner.")
}

export async function assignResidentToFlat(data, actorUserId) {
  try {
    return await withTransaction(async (session) => {
      const resident = await requireResident(data.residentId, session)
      const { tower, flat } = await requireFlatInTower(data.flatId, data.towerId, session)
      if (flat.occupancyStatus !== "Vacant") {
        throw new ApiError(409, "Only a vacant flat can be assigned.")
      }
      if (await ResidentAssignment.exists({ residentId: resident._id, status: "Active" }).session(session)) {
        throw new ApiError(409, "Resident already owns an active flat.")
      }
      if (await ResidentAssignment.exists({ flatId: flat._id, status: "Active" }).session(session)) {
        throw new ApiError(409, "Flat already has an active owner.")
      }

      const occupied = await Flat.updateOne(
        { _id: flat._id, occupancyStatus: "Vacant", isDeleted: false },
        { $set: { occupancyStatus: "Occupied" } },
        { session }
      )
      if (occupied.modifiedCount !== 1) throw new ApiError(409, "Flat is no longer vacant.")

      const [assignment] = await ResidentAssignment.create([{
        residentId: resident._id,
        towerId: tower._id,
        flatId: flat._id,
        status: "Active",
        assignedAt: new Date(),
        reason: data.reason || "Initial assignment",
        assignedBy: actorUserId,
      }], { session })
      await User.updateOne(
        { _id: resident._id },
        { $set: { tower: tower.towerName, floor: String(flat.floorNumber), flat: flat.flatNumber } },
        { session }
      )
      return assignment
    })
  } catch (error) {
    throw duplicateAssignmentError(error)
  }
}

export async function transferResidentFlat(data, actorUserId) {
  try {
    return await withTransaction(async (session) => {
      if (data.currentFlatId.toString() === data.newFlatId.toString()) {
        throw new ApiError(400, "New flat must be different from current flat.")
      }
      const resident = await requireResident(data.residentId, session)
      const activeAssignment = await ResidentAssignment.findOne({
        residentId: resident._id,
        flatId: data.currentFlatId,
        status: "Active",
      }).session(session)
      if (!activeAssignment) throw new ApiError(409, "Resident does not own the specified current flat.")

      const currentFlat = await Flat.findOne({ _id: data.currentFlatId, isDeleted: false }).session(session)
      const newFlat = await Flat.findOne({ _id: data.newFlatId, isDeleted: false }).session(session)
      if (!currentFlat) throw new ApiError(404, "Current flat not found.")
      if (!newFlat) throw new ApiError(404, "New flat not found.")
      if (newFlat.occupancyStatus !== "Vacant") throw new ApiError(409, "New flat must be vacant.")
      const newTower = await Tower.findOne({ _id: newFlat.towerId, isDeleted: false }).session(session)
      if (!newTower) throw new ApiError(404, "New flat's tower not found.")

      const occupied = await Flat.updateOne(
        { _id: newFlat._id, occupancyStatus: "Vacant", isDeleted: false },
        { $set: { occupancyStatus: "Occupied" } },
        { session }
      )
      if (occupied.modifiedCount !== 1) throw new ApiError(409, "New flat is no longer vacant.")

      await Flat.updateOne(
        { _id: currentFlat._id },
        { $set: { occupancyStatus: "Vacant" } },
        { session }
      )
      const transferDate = new Date()
      activeAssignment.status = "Transferred"
      activeAssignment.transferDate = transferDate
      activeAssignment.reason = data.reason
      activeAssignment.endedBy = actorUserId
      await activeAssignment.save({ session })

      const [newAssignment] = await ResidentAssignment.create([{
        residentId: resident._id,
        towerId: newTower._id,
        flatId: newFlat._id,
        status: "Active",
        assignedAt: transferDate,
        reason: `Transferred: ${data.reason}`,
        assignedBy: actorUserId,
      }], { session })
      await User.updateOne(
        { _id: resident._id },
        { $set: { tower: newTower.towerName, floor: String(newFlat.floorNumber), flat: newFlat.flatNumber } },
        { session }
      )
      return newAssignment
    })
  } catch (error) {
    throw duplicateAssignmentError(error)
  }
}

export async function removeResidentFromFlat(data, actorUserId) {
  return withTransaction(async (session) => {
    const resident = await requireResident(data.residentId, session)
    const assignment = await ResidentAssignment.findOne({
      residentId: resident._id,
      status: "Active",
      ...(data.flatId ? { flatId: data.flatId } : {}),
    }).session(session)
    if (!assignment) throw new ApiError(404, "Active resident assignment not found.")

    await Flat.updateOne(
      { _id: assignment.flatId, isDeleted: false },
      { $set: { occupancyStatus: "Vacant" } },
      { session }
    )
    assignment.status = "Removed"
    assignment.removalDate = new Date()
    assignment.reason = data.reason || "Resident removed from flat"
    assignment.endedBy = actorUserId
    await assignment.save({ session })
    await User.updateOne(
      { _id: resident._id },
      { $set: { tower: "", floor: "", flat: "" } },
      { session }
    )
    return assignment
  })
}

function assertReadAccess(requester, residentId = null) {
  const canViewAll = [ROLES.COMMITTEE_HEAD, ROLES.COMMITTEE_MEMBER].includes(requester.role)
  if (canViewAll) return
  if (requester.role !== ROLES.RESIDENT || !residentId || requester.userId !== residentId.toString()) {
    throw new ApiError(403, "You do not have permission to view this assignment.")
  }
}

export async function getResidentHistory(residentId, requester) {
  assertReadAccess(requester, residentId)
  await requireResidentRecord(residentId)
  return ResidentAssignment.find({ residentId })
    .populate(assignmentPopulate)
    .sort({ assignedAt: -1 })
}

export async function getResidentAssignments(filters, requester) {
  const ownResidentId = requester.role === ROLES.RESIDENT ? requester.userId : null
  assertReadAccess(requester, ownResidentId)
  const page = Number(filters.page) || 1
  const limit = Math.min(Number(filters.limit) || 10, 100)
  const query = { status: "Active" }
  if (ownResidentId) query.residentId = ownResidentId
  if (filters.towerId) query.towerId = filters.towerId

  if (filters.floorNumber || filters.flatNumber) {
    const flatQuery = { isDeleted: false }
    if (filters.floorNumber) flatQuery.floorNumber = Number(filters.floorNumber)
    if (filters.flatNumber) flatQuery.flatNumber = filters.flatNumber.toUpperCase()
    const flats = await Flat.find(flatQuery).select("_id")
    query.flatId = { $in: flats.map((flat) => flat._id) }
  }
  if (filters.residentName && !ownResidentId) {
    const escaped = filters.residentName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    const pattern = new RegExp(escaped, "i")
    const residents = await User.find({
      role: ROLES.RESIDENT,
      $or: [{ firstName: pattern }, { lastName: pattern }],
    }).select("_id")
    query.residentId = { $in: residents.map((resident) => resident._id) }
  }

  const [assignments, total] = await Promise.all([
    ResidentAssignment.find(query).populate(assignmentPopulate).sort({ assignedAt: -1 })
      .skip((page - 1) * limit).limit(limit),
    ResidentAssignment.countDocuments(query),
  ])
  return { assignments, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } }
}
