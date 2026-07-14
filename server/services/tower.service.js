import Flat from "../models/Flat.js"
import Tower from "../models/Tower.js"
import ApiError from "../utils/ApiError.js"

function normalizeName(name) {
  return name.trim().toUpperCase()
}

export async function createTower(data) {
  const towerName = normalizeName(data.towerName)
  if (await Tower.exists({ towerName })) throw new ApiError(409, "Tower name already exists.")

  try {
    return await Tower.create({ ...data, towerName })
  } catch (error) {
    if (error.code === 11000) throw new ApiError(409, "Tower name already exists.")
    throw error
  }
}

export async function getTowers(filters) {
  const page = Number(filters.page) || 1
  const limit = Math.min(Number(filters.limit) || 10, 100)
  const query = { isDeleted: false }
  if (filters.status) query.status = filters.status
  if (filters.search) {
    const escaped = filters.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    query.$or = [
      { towerName: new RegExp(escaped, "i") },
      { description: new RegExp(escaped, "i") },
    ]
  }
  const sortFields = new Set(["towerName", "totalFloors", "totalFlats", "status", "createdAt", "updatedAt"])
  const sortBy = sortFields.has(filters.sortBy) ? filters.sortBy : "towerName"
  const sortOrder = filters.sortOrder === "desc" ? -1 : 1
  const [towers, total] = await Promise.all([
    Tower.find(query).sort({ [sortBy]: sortOrder }).skip((page - 1) * limit).limit(limit),
    Tower.countDocuments(query),
  ])
  return { towers, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } }
}

export async function getTowerById(id) {
  const tower = await Tower.findOne({ _id: id, isDeleted: false })
  if (!tower) throw new ApiError(404, "Tower not found.")
  return tower
}

export async function updateTower(id, data) {
  const tower = await getTowerById(id)
  if (data.towerName) {
    data.towerName = normalizeName(data.towerName)
    if (await Tower.exists({ towerName: data.towerName, _id: { $ne: id } })) {
      throw new ApiError(409, "Tower name already exists.")
    }
  }

  if (data.totalFloors !== undefined || data.totalFlats !== undefined) {
    const [highestFlat] = await Flat.find({ towerId: id, isDeleted: false })
      .sort({ floorNumber: -1 }).limit(1).select("floorNumber")
    const flatCount = await Flat.countDocuments({ towerId: id, isDeleted: false })
    if (data.totalFloors !== undefined && highestFlat && data.totalFloors < highestFlat.floorNumber) {
      throw new ApiError(409, "Total floors cannot be lower than an existing flat's floor.")
    }
    if (data.totalFlats !== undefined && data.totalFlats < flatCount) {
      throw new ApiError(409, "Total flats cannot be lower than the existing flat count.")
    }
  }

  Object.assign(tower, data)
  try {
    return await tower.save()
  } catch (error) {
    if (error.code === 11000) throw new ApiError(409, "Tower name already exists.")
    throw error
  }
}

export async function softDeleteTower(id) {
  const tower = await getTowerById(id)
  if (await Flat.exists({ towerId: id, isDeleted: false })) {
    throw new ApiError(409, "Tower cannot be deleted while it contains flats.")
  }
  tower.isDeleted = true
  tower.deletedAt = new Date()
  tower.status = "Inactive"
  return tower.save()
}
