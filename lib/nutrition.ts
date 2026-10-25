// Nutrition calculation logic mirroring the Excel formulas

export interface FoodData {
  amountG: number
  cal: number
  fatG: number
  carbG: number
  proteinG: number
  typicalG: number
}

export interface EntryData {
  multiplier: number
  amountG: number | null
  food: FoodData
}

export function calcEntryNutrition(entry: EntryData) {
  const effectiveAmount = entry.amountG ?? entry.food.typicalG
  const baseAmount = entry.food.amountG || 1
  const mult = entry.multiplier || 1

  return {
    cal: (entry.food.cal / baseAmount) * effectiveAmount * mult,
    fatG: (entry.food.fatG / baseAmount) * effectiveAmount * mult,
    carbG: (entry.food.carbG / baseAmount) * effectiveAmount * mult,
    proteinG: (entry.food.proteinG / baseAmount) * effectiveAmount * mult,
  }
}

export interface SettingsData {
  weightLb: number
  mode: string
  cutDeficit: number
  bulkSurplus: number
  calMultiplier: number
  proteinMultiplier: number
  proteinMinMultiplier: number
  fatMinMultiplier: number
}

export function calcTargets(s: SettingsData) {
  const maintenance = s.weightLb * s.calMultiplier
  let calorieMax: number

  if (s.mode === 'cut') {
    calorieMax = maintenance - s.cutDeficit
  } else if (s.mode === 'bulk') {
    calorieMax = maintenance + s.bulkSurplus
  } else {
    calorieMax = maintenance
  }

  const proteinTarget = s.weightLb * s.proteinMultiplier
  const proteinMin = s.weightLb * s.proteinMinMultiplier
  const fatMin = s.weightLb * s.fatMinMultiplier
  const carbTarget = (calorieMax - (proteinTarget * 4 + fatMin * 9)) / 4

  return {
    maintenance,
    calorieMax,
    proteinTarget,
    proteinMin,
    fatMin,
    carbTarget,
  }
}
