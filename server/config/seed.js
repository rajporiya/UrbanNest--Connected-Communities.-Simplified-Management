import Tower from "../models/Tower.model.js"
import Flat from "../models/Flat.model.js"

export async function seedDB() {
  const towerCount = await Tower.countDocuments()
  if (towerCount === 0) {
    console.log("Seeding database with default Towers and Flats...")
    const towersData = [
      { towerName: "TOWER A", totalFloors: 10, totalFlats: 30, description: "Tower A" },
      { towerName: "TOWER B", totalFloors: 10, totalFlats: 30, description: "Tower B" },
      { towerName: "TOWER C", totalFloors: 10, totalFlats: 30, description: "Tower C" },
      { towerName: "TOWER D", totalFloors: 10, totalFlats: 30, description: "Tower D" },
    ]
    const towers = await Tower.insertMany(towersData)
    const towerMap = {}
    towers.forEach(t => {
      towerMap[t.towerName] = t._id
    })

    const flatsData = [
      { towerId: towerMap["TOWER A"], floorNumber: 1, flatNumber: "A-101", flatType: "2BHK", area: 1200, maintenanceAmount: 4500 },
      { towerId: towerMap["TOWER A"], floorNumber: 2, flatNumber: "A-203", flatType: "2BHK", area: 1200, maintenanceAmount: 4500 },
      { towerId: towerMap["TOWER A"], floorNumber: 4, flatNumber: "A-404", flatType: "3BHK", area: 1600, maintenanceAmount: 6000 },
      { towerId: towerMap["TOWER B"], floorNumber: 1, flatNumber: "B-102", flatType: "2BHK", area: 1200, maintenanceAmount: 4500 },
      { towerId: towerMap["TOWER B"], floorNumber: 3, flatNumber: "B-304", flatType: "3BHK", area: 1600, maintenanceAmount: 6000 },
      { towerId: towerMap["TOWER B"], floorNumber: 6, flatNumber: "B-602", flatType: "2BHK", area: 1200, maintenanceAmount: 4500 },
      { towerId: towerMap["TOWER C"], floorNumber: 1, flatNumber: "C-103", flatType: "2BHK", area: 1200, maintenanceAmount: 4500 },
      { towerId: towerMap["TOWER C"], floorNumber: 3, flatNumber: "C-302", flatType: "2BHK", area: 1200, maintenanceAmount: 4500 },
      { towerId: towerMap["TOWER C"], floorNumber: 5, flatNumber: "C-501", flatType: "3BHK", area: 1600, maintenanceAmount: 6000 },
      { towerId: towerMap["TOWER D"], floorNumber: 1, flatNumber: "D-104", flatType: "2BHK", area: 1200, maintenanceAmount: 4500 },
      { towerId: towerMap["TOWER D"], floorNumber: 2, flatNumber: "D-202", flatType: "2BHK", area: 1200, maintenanceAmount: 4500 },
      { towerId: towerMap["TOWER D"], floorNumber: 7, flatNumber: "D-703", flatType: "3BHK", area: 1600, maintenanceAmount: 6000 },
    ]
    await Flat.insertMany(flatsData)
    console.log("Database seeded successfully with default Towers and Flats.")
  }
}
