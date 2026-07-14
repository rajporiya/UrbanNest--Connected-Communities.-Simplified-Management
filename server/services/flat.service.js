import Flat from "../models/Flat.model.js"
import Tower from "../models/Tower.model.js"
import ApiError from "../utils/ApiError.js"

async function requireTower(towerId) {
  const tower = await Tower.findOne({ _id: towerId, isDeleted: false })
  if (!tower) throw new ApiError(404, "Tower not found.")
  return tower
}

function normalizeFlatNumber(value) {
  return value.trim().toUpperCase()
}

async function validateFlatPlacement(data, excludedFlatId = null, enforceCapacity = true) {
  const tower = await requireTower(data.towerId)
  if (data.floorNumber > tower.totalFloors) {
    throw new ApiError(400, `Floor number cannot exceed tower's ${tower.totalFloors} floors.`)
  }
  const duplicateQuery = {
    towerId: data.towerId,
    flatNumber: normalizeFlatNumber(data.flatNumber),
    isDeleted: false,
  }
  if (excludedFlatId) duplicateQuery._id = { $ne: excludedFlatId }
  if (await Flat.exists(duplicateQuery)) {
    throw new ApiError(409, "Flat number already exists in this tower.")
  }
  if (enforceCapacity) {
    const count = await Flat.countDocuments({ towerId: data.towerId, isDeleted: false })
    if (count >= tower.totalFlats) throw new ApiError(409, "Tower has reached its total flat capacity.")
  }
}

export async function createFlat(data) {
  data.flatNumber = normalizeFlatNumber(data.flatNumber)
  await validateFlatPlacement(data)
  try {
    return await (await Flat.create(data)).populate("towerId", "towerName status")
  } catch (error) {
    if (error.code === 11000) throw new ApiError(409, "Flat number already exists in this tower.")
    throw error
  }
}

export async function getFlats(filters) {
  const page = Number(filters.page) || 1
  const limit = Math.min(Number(filters.limit) || 10, 100)
  const query = { isDeleted: false }
  if (filters.towerId) query.towerId = filters.towerId
  if (filters.floorNumber) query.floorNumber = Number(filters.floorNumber)
  if (filters.flatType) query.flatType = filters.flatType
  if (filters.occupancyStatus) query.occupancyStatus = filters.occupancyStatus
  if (filters.search) {
    const escaped = filters.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    const towers = await Tower.find({ towerName: new RegExp(escaped, "i"), isDeleted: false }).select("_id")
    query.$or = [
      { flatNumber: new RegExp(escaped, "i") },
      { towerId: { $in: towers.map((tower) => tower._id) } },
    ]
  }
  const sortFields = new Set([
    "floorNumber", "flatNumber", "flatType", "area", "maintenanceAmount", "occupancyStatus", "createdAt", "updatedAt",
  ])
  const sortBy = sortFields.has(filters.sortBy) ? filters.sortBy : "flatNumber"
  const sortOrder = filters.sortOrder === "desc" ? -1 : 1
  const [flats, total] = await Promise.all([
    Flat.find(query).populate("towerId", "towerName status").sort({ [sortBy]: sortOrder })
      .skip((page - 1) * limit).limit(limit),
    Flat.countDocuments(query),
  ])
  return { flats, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } }
}

export async function getFlatById(id) {
  const flat = await Flat.findOne({ _id: id, isDeleted: false }).populate("towerId", "towerName status")
  if (!flat) throw new ApiError(404, "Flat not found.")
  return flat
}

export async function updateFlat(id, data) {
  const flat = await Flat.findOne({ _id: id, isDeleted: false })
  if (!flat) throw new ApiError(404, "Flat not found.")
  const placement = {
    towerId: data.towerId || flat.towerId,
    floorNumber: data.floorNumber ?? flat.floorNumber,
    flatNumber: data.flatNumber ? normalizeFlatNumber(data.flatNumber) : flat.flatNumber,
  }
  const isMovingTower = placement.towerId.toString() !== flat.towerId.toString()
  await validateFlatPlacement(placement, id, isMovingTower)
  Object.assign(flat, data, { flatNumber: placement.flatNumber })
  try {
    return (await flat.save()).populate("towerId", "towerName status")
  } catch (error) {
    if (error.code === 11000) throw new ApiError(409, "Flat number already exists in this tower.")
    throw error
  }
}

export async function softDeleteFlat(id) {
  const flat = await Flat.findOne({ _id: id, isDeleted: false })
  if (!flat) throw new ApiError(404, "Flat not found.")
  flat.isDeleted = true
  flat.deletedAt = new Date()
  return flat.save()
}
