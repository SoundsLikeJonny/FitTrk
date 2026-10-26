import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) })

const EXERCISES = [
  { name: 'Barbell Bench Press', bodyPart: 'chest', category: 'compound', weightType: 'barbell' },
  { name: 'Incline Dumbbell Press', bodyPart: 'chest', category: 'compound', weightType: 'dumbbell' },
  { name: 'Cable Fly', bodyPart: 'chest', category: 'isolation', weightType: 'cable' },
  { name: 'Push Up', bodyPart: 'chest', category: 'compound', weightType: 'bodyweight' },
  { name: 'Barbell Squat', bodyPart: 'legs', category: 'compound', weightType: 'barbell' },
  { name: 'Leg Press', bodyPart: 'legs', category: 'compound', weightType: 'machine' },
  { name: 'Romanian Deadlift', bodyPart: 'legs', category: 'compound', weightType: 'barbell' },
  { name: 'Leg Extension', bodyPart: 'legs', category: 'isolation', weightType: 'machine' },
  { name: 'Leg Curl', bodyPart: 'legs', category: 'isolation', weightType: 'machine' },
  { name: 'Calf Raise', bodyPart: 'legs', category: 'isolation', weightType: 'machine' },
  { name: 'Lunge', bodyPart: 'legs', category: 'compound', weightType: 'dumbbell' },
  { name: 'Deadlift', bodyPart: 'back', category: 'compound', weightType: 'barbell' },
  { name: 'Barbell Row', bodyPart: 'back', category: 'compound', weightType: 'barbell' },
  { name: 'Lat Pulldown', bodyPart: 'back', category: 'compound', weightType: 'cable' },
  { name: 'Seated Cable Row', bodyPart: 'back', category: 'compound', weightType: 'cable' },
  { name: 'Pull Up', bodyPart: 'back', category: 'compound', weightType: 'bodyweight' },
  { name: 'Dumbbell Row', bodyPart: 'back', category: 'compound', weightType: 'dumbbell' },
  { name: 'Overhead Press', bodyPart: 'shoulders', category: 'compound', weightType: 'barbell' },
  { name: 'Lateral Raise', bodyPart: 'shoulders', category: 'isolation', weightType: 'dumbbell' },
  { name: 'Face Pull', bodyPart: 'shoulders', category: 'isolation', weightType: 'cable' },
  { name: 'Rear Delt Fly', bodyPart: 'shoulders', category: 'isolation', weightType: 'dumbbell' },
  { name: 'Barbell Curl', bodyPart: 'arms', category: 'isolation', weightType: 'barbell' },
  { name: 'Dumbbell Curl', bodyPart: 'arms', category: 'isolation', weightType: 'dumbbell' },
  { name: 'Hammer Curl', bodyPart: 'arms', category: 'isolation', weightType: 'dumbbell' },
  { name: 'Tricep Pushdown', bodyPart: 'arms', category: 'isolation', weightType: 'cable' },
  { name: 'Overhead Tricep Extension', bodyPart: 'arms', category: 'isolation', weightType: 'cable' },
  { name: 'Skull Crusher', bodyPart: 'arms', category: 'isolation', weightType: 'barbell' },
  { name: 'Plank', bodyPart: 'core', category: 'isolation', weightType: 'bodyweight' },
  { name: 'Cable Crunch', bodyPart: 'core', category: 'isolation', weightType: 'cable' },
  { name: 'Hanging Leg Raise', bodyPart: 'core', category: 'isolation', weightType: 'bodyweight' },
]

const FOODS = [
  { name: 'Dan Dan 1/2 Bowl', amountG: 450, cal: 325, fatG: 14, carbG: 35, proteinG: 13, typicalG: 225 },
  { name: 'Barebell Bar', amountG: 55, cal: 220, fatG: 7, carbG: 20, proteinG: 20, typicalG: 55 },
  { name: 'Rice 100g', amountG: 100, cal: 121, fatG: 0, carbG: 27, proteinG: 2.5, typicalG: 100 },
  { name: 'Nuts (25g)', amountG: 50, cal: 320, fatG: 28, carbG: 12, proteinG: 8, typicalG: 25 },
  { name: 'Ice Cream Sandwich', amountG: 120, cal: 170, fatG: 6, carbG: 28, proteinG: 2, typicalG: 120 },
  { name: 'Muffin Bar', amountG: 35, cal: 140, fatG: 6, carbG: 23, proteinG: 2, typicalG: 35 },
  { name: 'Oyakodon 100g', amountG: 100, cal: 130, fatG: 7, carbG: 5, proteinG: 14, typicalG: 200 },
  { name: 'Protein Shake', amountG: 32, cal: 130, fatG: 1.5, carbG: 4, proteinG: 24, typicalG: 64 },
  { name: 'Greek Yogurt 90g', amountG: 175, cal: 100, fatG: 0, carbG: 7, proteinG: 13, typicalG: 90 },
  { name: 'Oil 1tbsp', amountG: 15, cal: 120, fatG: 14, carbG: 0, proteinG: 0, typicalG: 15 },
  { name: 'Banana', amountG: 118, cal: 100, fatG: 0, carbG: 27, proteinG: 1, typicalG: 118 },
  { name: 'Granola 30g', amountG: 102, cal: 430, fatG: 12, carbG: 75, proteinG: 10, typicalG: 30 },
  { name: 'Egg', amountG: 57, cal: 78, fatG: 5, carbG: 1, proteinG: 6, typicalG: 57 },
  { name: 'Activia Drink', amountG: 93, cal: 60, fatG: 1.5, carbG: 9, proteinG: 3, typicalG: 93 },
  { name: 'Fish Oil x2', amountG: 15, cal: 23, fatG: 2.5, carbG: 0, proteinG: 0, typicalG: 15 },
  { name: 'White Rabbit', amountG: 5, cal: 20, fatG: 0.4, carbG: 4, proteinG: 0.25, typicalG: 20 },
  { name: 'Milk Tea', amountG: 700, cal: 200, fatG: 10, carbG: 28, proteinG: 2, typicalG: 700 },
  { name: 'Protein Bar', amountG: 55, cal: 190, fatG: 5, carbG: 18, proteinG: 20, typicalG: 55 },
  { name: 'Coke', amountG: 355, cal: 140, fatG: 0, carbG: 39, proteinG: 0, typicalG: 355 },
  { name: 'Tomato Egg Noodles', amountG: 350, cal: 400, fatG: 12, carbG: 58, proteinG: 15, typicalG: 350 },
  { name: 'Agedashi Tofu', amountG: 350, cal: 340, fatG: 24, carbG: 18, proteinG: 16, typicalG: 350 },
  { name: 'Pastry Sweet Sesame', amountG: 100, cal: 400, fatG: 5, carbG: 35, proteinG: 5, typicalG: 87.5 },
  { name: 'Pizza Slice (Panago)', amountG: 93, cal: 220, fatG: 8, carbG: 26, proteinG: 10, typicalG: 93 },
  { name: 'Chicken Wing x1', amountG: 50, cal: 105, fatG: 7, carbG: 2, proteinG: 7, typicalG: 50 },
  { name: 'Nandos Chicken Skewers x2', amountG: 150, cal: 210, fatG: 6, carbG: 2, proteinG: 34, typicalG: 150 },
  { name: 'Fig bar', amountG: 57, cal: 200, fatG: 5, carbG: 38, proteinG: 3, typicalG: 57 },
  { name: 'Chicken katsu thai', amountG: 100, cal: 400, fatG: 24, carbG: 15, proteinG: 25, typicalG: 75 },
  { name: 'Milk bread slice', amountG: 40, cal: 120, fatG: 2.5, carbG: 20, proteinG: 4, typicalG: 40 },
  { name: '16 brookside choco', amountG: 40, cal: 170, fatG: 7, carbG: 29, proteinG: 1, typicalG: 40 },
  { name: '1 hash brown', amountG: 66, cal: 110, fatG: 5, carbG: 15, proteinG: 1, typicalG: 66 },
  { name: 'Pandesal', amountG: 38, cal: 120, fatG: 3.5, carbG: 20, proteinG: 3, typicalG: 38 },
  { name: 'Yogurt fruit cup', amountG: 100, cal: 80, fatG: 0, carbG: 12, proteinG: 8, typicalG: 100 },
  { name: 'Guiseppe Pizza 1/2', amountG: 180, cal: 430, fatG: 14, carbG: 59, proteinG: 18, typicalG: 360 },
  { name: 'Shelled soybean Edamame', amountG: 75, cal: 105, fatG: 4, carbG: 8, proteinG: 9, typicalG: 75 },
  { name: 'Crispers 25g', amountG: 70, cal: 340, fatG: 15, carbG: 47, proteinG: 4, typicalG: 25 },
  { name: 'Chicko Chicken', amountG: 50, cal: 100, fatG: 7, carbG: 9, proteinG: 8, typicalG: 200 },
  { name: 'Carrot', amountG: 100, cal: 41, fatG: 0, carbG: 9.6, proteinG: 1, typicalG: 100 },
  { name: 'Cucumber', amountG: 100, cal: 15, fatG: 0, carbG: 3.6, proteinG: 1, typicalG: 100 },
  { name: 'Sugar Snap Peas', amountG: 100, cal: 42, fatG: 0, carbG: 7.5, proteinG: 2.8, typicalG: 100 },
  { name: 'Hummus', amountG: 30, cal: 70, fatG: 5, carbG: 6, proteinG: 2, typicalG: 30 },
  { name: 'Celery', amountG: 100, cal: 16, fatG: 0, carbG: 3, proteinG: 1, typicalG: 100 },
  { name: 'Hopia', amountG: 40, cal: 160, fatG: 8, carbG: 27, proteinG: 4, typicalG: 40 },
  { name: 'Beef jerky', amountG: 50, cal: 110, fatG: 2, carbG: 11, proteinG: 12, typicalG: 50 },
  { name: 'Feta Pasta 220g', amountG: 435, cal: 642, fatG: 25, carbG: 84, proteinG: 21, typicalG: 220 },
  { name: 'Chicken Thigh 100g', amountG: 100, cal: 209, fatG: 11, carbG: 0, proteinG: 26, typicalG: 100 },
  { name: 'Brookside chocolate', amountG: 40, cal: 170, fatG: 7, carbG: 29, proteinG: 1, typicalG: 40 },
  { name: 'Banh Mi Chicken', amountG: 400, cal: 650, fatG: 20, carbG: 85, proteinG: 35, typicalG: 400 },
  { name: 'Tofu, extra firm 1/2 Pack', amountG: 85, cal: 130, fatG: 8, carbG: 3, proteinG: 14, typicalG: 170 },
  { name: 'Scone', amountG: 85, cal: 300, fatG: 13, carbG: 42, proteinG: 5, typicalG: 85 },
  { name: 'Hyashi Chuka, no ham', amountG: 399, cal: 685, fatG: 24, carbG: 80, proteinG: 20, typicalG: 399 },
  { name: 'Choco Mont 1 pack', amountG: 36, cal: 200, fatG: 11, carbG: 22, proteinG: 2, typicalG: 36 },
  { name: 'Pepero 1/2 pack', amountG: 32, cal: 160, fatG: 7, carbG: 22, proteinG: 2, typicalG: 16 },
  { name: 'Apple Danish, Pure Bread', amountG: 150, cal: 580, fatG: 35, carbG: 75, proteinG: 9, typicalG: 150 },
  { name: 'Barebell bar, less protein', amountG: 55, cal: 200, fatG: 9, carbG: 23, proteinG: 16, typicalG: 55 },
  { name: 'Bread, artisan loaf 2 slices', amountG: 70, cal: 180, fatG: 3.5, carbG: 31, proteinG: 8, typicalG: 70 },
  { name: 'Tuna Bun, SGM', amountG: 120, cal: 380, fatG: 20, carbG: 45, proteinG: 14, typicalG: 120 },
  { name: 'Chicken, Jollibee Drumstick x2', amountG: 260, cal: 400, fatG: 24, carbG: 15, proteinG: 32, typicalG: 260 },
  { name: 'Mango', amountG: 200, cal: 120, fatG: 0.8, carbG: 30, proteinG: 1.6, typicalG: 200 },
  { name: 'Banana Bread, 1/8 slice', amountG: 1000, cal: 2770, fatG: 108, carbG: 420, proteinG: 48, typicalG: 125 },
  { name: 'Honey', amountG: 20, cal: 60, fatG: 0, carbG: 16, proteinG: 0, typicalG: 4 },
  { name: "Oat milk, Barista's Own", amountG: 250, cal: 150, fatG: 7, carbG: 18, proteinG: 3, typicalG: 250 },
]

async function main() {
  // Seed test account
  const hashedPw = await bcrypt.hash('T2$sztNvk5', 12)
  await prisma.user.upsert({
    where: { email: 'abacus-d95afe14@example.com' },
    update: {},
    create: {
      email: 'abacus-d95afe14@example.com',
      name: 'Test User',
      password: hashedPw,
      settings: { create: { weightLb: 165, mode: 'cut' } },
    },
  })

  // Seed exercises
  for (const ex of EXERCISES) {
    await prisma.exercise.upsert({
      where: { id: `seed-${ex.name.replace(/\s+/g, '-').toLowerCase()}` },
      update: {},
      create: {
        id: `seed-${ex.name.replace(/\s+/g, '-').toLowerCase()}`,
        ...ex,
        isCustom: false,
        userId: null,
      },
    })
  }

  // Seed foods
  for (const food of FOODS) {
    await prisma.food.upsert({
      where: { id: `seed-${food.name.replace(/\s+/g, '-').toLowerCase().slice(0, 40)}` },
      update: {},
      create: {
        id: `seed-${food.name.replace(/\s+/g, '-').toLowerCase().slice(0, 40)}`,
        ...food,
        isCustom: false,
        userId: null,
        presets: '[0.5, 1, 2]',
      },
    })
  }

  console.log('Seed complete!')
}

main().catch(console.error).finally(() => prisma.$disconnect())
