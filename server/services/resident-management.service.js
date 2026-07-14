import mongoose from "mongoose"

import { allowMultipleTenants } from "../config/resident.js"
import ROLES from "../config/roles.js"
import FamilyMember from "../models/FamilyMember.model.js"
import Flat from "../models/Flat.model.js"
import Resident from "../models/Resident.model.js"
import Tower from "../models/Tower.model.js"
import User from "../models/User.model.js"
import ApiError from "../utils/ApiError.js"
import { deleteResidentDocument, uploadResidentDocument } from "./resident-document.service.js"

const residentPopulate = [
  { path: "userId", select: "firstName lastName email phone profileImage role isActive" },
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

async function requireResidentUser(userId, session = null) {
  const query = User.findOne({ _id: userId, role: ROLES.RESIDENT, isDeleted: { $ne: true } })
  if (session) query.session(session)
  const user = await query
  if (!user) throw new ApiError(400, "Only users with the Resident role can be managed.")
  return user
}

async function requireLocation(towerId, flatId, session = null) {
  const towerQuery = Tower.findOne({ _id: towerId, isDeleted: false })
  const flatQuery = Flat.findOne({ _id: flatId, towerId, isDeleted: false })
  if (session) {
    towerQuery.session(session)
    flatQuery.session(session)
  }
  const [tower, flat] = await Promise.all([towerQuery, flatQuery])
  if (!tower) throw new ApiError(404, "Tower not found.")
  if (!flat) throw new ApiError(404, "Flat not found in the selected tower.")
  return { tower, flat }
}

async function requireResidentProfile(id, populate = true) {
  let query = Resident.findOne({ _id: id, isDeleted: false })
  if (populate) query = query.populate(residentPopulate)
  const resident = await query
  if (!resident) throw new ApiError(404, "Resident not found.")
  if (populate && (!resident.userId || resident.userId.role !== ROLES.RESIDENT)) {
    throw new ApiError(409, "The linked user no longer has the Resident role.")
  }
  return resident
}

async function validateOccupancy(flatId, ownershipType, excludedResidentId = null, session = null) {
  const base = { flatId, isDeleted: false }
  if (excludedResidentId) base._id = { $ne: excludedResidentId }
  if (ownershipType === "Owner" && await Resident.exists({ ...base, ownershipType: "Owner" }).session(session)) {
    throw new ApiError(409, "This flat already has an owner.")
  }
  if (ownershipType === "Tenant" && !allowMultipleTenants()) {
    if (await Resident.exists({ ...base, ownershipType: "Tenant", status: "Active" }).session(session)) {
      throw new ApiError(409, "Multiple tenants are disabled for this society.")
    }
  }
}

async function updateFlatOccupancy(flatId, session) {
  const activeCount = await Resident.countDocuments({ flatId, isDeleted: false, status: "Active" }).session(session)
  await Flat.updateOne(
    { _id: flatId, isDeleted: false },
    { $set: { occupancyStatus: activeCount ? "Occupied" : "Vacant" } },
    { session }
  )
}

async function populateResident(id) {
  return Resident.findById(id).populate(residentPopulate)
}

export async function createResident(data) {
  try {
    const id = await withTransaction(async (session) => {
      const user = await requireResidentUser(data.userId, session)
      if (await Resident.exists({ userId: user._id }).session(session)) {
        throw new ApiError(409, "This user already has a resident profile.")
      }
      const { tower, flat } = await requireLocation(data.towerId, data.flatId, session)
      await validateOccupancy(flat._id, data.ownershipType, null, session)
      const [resident] = await Resident.create([{
        userId: user._id,
        towerId: tower._id,
        flatId: flat._id,
        ownershipType: data.ownershipType,
        moveInDate: data.moveInDate,
        emergencyContact: data.emergencyContact,
        bloodGroup: data.bloodGroup || null,
        occupation: data.occupation || "",
        status: data.status || "Active",
      }], { session })
      const isActive = resident.status === "Active"
      const userUpdate = {
        $set: {
          isActive,
          tower: tower.towerName,
          floor: String(flat.floorNumber),
          flat: flat.flatNumber,
        },
      }
      if (!isActive) userUpdate.$unset = { refreshToken: "", sessionId: "" }
      await User.updateOne({ _id: user._id }, userUpdate, { session })
      await updateFlatOccupancy(flat._id, session)
      return resident._id
    })
    return populateResident(id)
  } catch (error) {
    if (error.code === 11000) {
      if (error.keyPattern?.userId) throw new ApiError(409, "This user already has a resident profile.")
      throw new ApiError(409, "This flat already has an owner.")
    }
    throw error
  }
}

export async function getResidents(filters) {
  const page = Number(filters.page) || 1
  const limit = Math.min(Number(filters.limit) || 10, 100)
  const query = { isDeleted: false }
  if (filters.towerId) query.towerId = filters.towerId
  if (filters.ownershipType) query.ownershipType = filters.ownershipType
  if (filters.status) query.status = filters.status

  if (filters.floorNumber || filters.flatNumber) {
    const flatFilter = { isDeleted: false }
    if (filters.floorNumber) flatFilter.floorNumber = Number(filters.floorNumber)
    if (filters.flatNumber) flatFilter.flatNumber = filters.flatNumber.toUpperCase()
    const filteredFlats = await Flat.find(flatFilter).select("_id")
    query.flatId = { $in: filteredFlats.map((flat) => flat._id) }
  }

  const validUserQuery = { role: ROLES.RESIDENT, isDeleted: { $ne: true } }
  const validUserIds = (await User.find(validUserQuery).select("_id")).map((user) => user._id)
  query.userId = { $in: validUserIds }
  if (filters.search) {
    const escaped = filters.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    const pattern = new RegExp(escaped, "i")
    const [users, searchFlats] = await Promise.all([
      User.find({
        ...validUserQuery,
        $or: [{ firstName: pattern }, { lastName: pattern }, { phone: pattern }, { email: pattern }],
      }).select("_id"),
      Flat.find({ flatNumber: pattern, isDeleted: false }).select("_id"),
    ])
    query.$and = [{
      $or: [
        { userId: { $in: users.map((user) => user._id) } },
        { flatId: { $in: searchFlats.map((flat) => flat._id) } },
      ],
    }]
  }

  const sortFields = new Set(["ownershipType", "moveInDate", "status", "createdAt", "updatedAt"])
  const sortBy = sortFields.has(filters.sortBy) ? filters.sortBy : "moveInDate"
  const sortOrder = filters.sortOrder === "asc" ? 1 : -1
  const [residents, total] = await Promise.all([
    Resident.find(query).populate(residentPopulate).sort({ [sortBy]: sortOrder })
      .skip((page - 1) * limit).limit(limit),
    Resident.countDocuments(query),
  ])
  return { residents, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } }
}

function assertResidentView(resident, requester) {
  if ([ROLES.COMMITTEE_HEAD, ROLES.COMMITTEE_MEMBER].includes(requester.role)) return
  const linkedUserId = resident.userId?._id || resident.userId
  if (requester.role !== ROLES.RESIDENT || linkedUserId.toString() !== requester.userId) {
    throw new ApiError(403, "You can only view your own resident profile.")
  }
}

export async function getResidentById(id, requester) {
  const resident = await requireResidentProfile(id)
  assertResidentView(resident, requester)
  const familyMembers = await FamilyMember.find({ residentId: resident._id }).sort({ createdAt: 1 })
  return { resident, familyMembers }
}

export async function updateResident(id, data) {
  const current = await requireResidentProfile(id, false)
  const residentId = current._id
  try {
    await withTransaction(async (session) => {
      const resident = await Resident.findById(residentId).session(session)
      const nextTowerId = data.towerId || resident.towerId
      const nextFlatId = data.flatId || resident.flatId
      const nextOwnership = data.ownershipType || resident.ownershipType
      const { tower, flat } = await requireLocation(nextTowerId, nextFlatId, session)
      await validateOccupancy(flat._id, nextOwnership, resident._id, session)
      const oldFlatId = resident.flatId
      Object.assign(resident, data, { towerId: tower._id, flatId: flat._id, ownershipType: nextOwnership })
      await resident.save({ session })

      const isActive = resident.status === "Active"
      const userUpdate = {
        $set: { isActive, tower: tower.towerName, floor: String(flat.floorNumber), flat: flat.flatNumber },
      }
      if (!isActive) userUpdate.$unset = { refreshToken: "", sessionId: "" }
      await User.updateOne({ _id: resident.userId }, userUpdate, { session })
      await updateFlatOccupancy(oldFlatId, session)
      if (oldFlatId.toString() !== flat._id.toString()) await updateFlatOccupancy(flat._id, session)
    })
    return populateResident(residentId)
  } catch (error) {
    if (error.code === 11000) throw new ApiError(409, "This flat already has an owner.")
    throw error
  }
}

export function setResidentStatus(id, status) {
  return updateResident(id, { status })
}

export async function softDeleteResident(id) {
  const current = await requireResidentProfile(id, false)
  await withTransaction(async (session) => {
    await Resident.updateOne(
      { _id: current._id },
      { $set: { isDeleted: true, deletedAt: new Date(), status: "Inactive" } },
      { session }
    )
    await User.updateOne(
      { _id: current.userId },
      {
        $set: { isActive: false, tower: "", floor: "", flat: "" },
        $unset: { refreshToken: "", sessionId: "" },
      },
      { session }
    )
    await updateFlatOccupancy(current.flatId, session)
  })
}

async function validateFamilyContacts(data, excludedId = null) {
  for (const [field, value] of [["mobileNumber", data.mobileNumber], ["email", data.email?.toLowerCase()]]) {
    if (!value) continue
    const query = { [field]: value }
    if (excludedId) query._id = { $ne: excludedId }
    if (await FamilyMember.exists(query)) throw new ApiError(409, `Family member ${field} already exists.`)
    const userField = field === "mobileNumber" ? "phone" : "email"
    if (await User.exists({ [userField]: value })) throw new ApiError(409, `${field} already belongs to a user.`)
  }
}

export async function addFamilyMember(residentId, data) {
  await requireResidentProfile(residentId, false)
  await validateFamilyContacts(data)
  try {
    const familyId = await withTransaction(async (session) => {
      const claimedSlot = await Resident.updateOne(
        { _id: residentId, isDeleted: false, familyMemberCount: { $lt: 10 } },
        { $inc: { familyMemberCount: 1 } },
        { session }
      )
      if (claimedSlot.modifiedCount !== 1) throw new ApiError(409, "A resident can have at most 10 family members.")
      const [member] = await FamilyMember.create([{
        ...data,
        email: data.email?.toLowerCase() || null,
        mobileNumber: data.mobileNumber || null,
        residentId,
      }], { session })
      return member._id
    })
    return FamilyMember.findById(familyId)
  } catch (error) {
    if (error.code === 11000) throw new ApiError(409, "Family member mobile number or email already exists.")
    throw error
  }
}

export async function updateFamilyMember(residentId, familyId, data) {
  await requireResidentProfile(residentId, false)
  const member = await FamilyMember.findOne({ _id: familyId, residentId })
  if (!member) throw new ApiError(404, "Family member not found.")
  await validateFamilyContacts(data, familyId)
  Object.assign(member, data)
  if (data.email !== undefined) member.email = data.email?.toLowerCase() || null
  try {
    return await member.save()
  } catch (error) {
    if (error.code === 11000) throw new ApiError(409, "Family member mobile number or email already exists.")
    throw error
  }
}

export async function removeFamilyMember(residentId, familyId) {
  await requireResidentProfile(residentId, false)
  return withTransaction(async (session) => {
    const removed = await FamilyMember.findOneAndDelete({ _id: familyId, residentId }, { session })
    if (!removed) throw new ApiError(404, "Family member not found.")
    await Resident.updateOne(
      { _id: residentId, familyMemberCount: { $gt: 0 } },
      { $inc: { familyMemberCount: -1 } },
      { session }
    )
  })
}

export async function addResidentDocument(residentId, documentType, file) {
  await requireResidentProfile(residentId, false)
  if (!file?.buffer) throw new ApiError(400, "Resident document is required.")
  const uploaded = await uploadResidentDocument(file.buffer, residentId, file.originalname)
  try {
    const updated = await Resident.findOneAndUpdate(
      { _id: residentId, isDeleted: false },
      { $push: { documents: { ...uploaded, documentType, uploadedAt: new Date() } } },
      { new: true, runValidators: true }
    ).populate(residentPopulate)
    if (!updated) throw new ApiError(404, "Resident not found.")
    return updated
  } catch (error) {
    await deleteResidentDocument(uploaded.public_id, uploaded.resource_type).catch(() => null)
    throw error
  }
}
