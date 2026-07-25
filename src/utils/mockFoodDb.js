// Preloaded mock database containing nutrition facts per 100g of food.
export const MOCK_FOOD_DB = [
  {
    foodName: 'Chicken Breast (Boneless Skinless)',
    calories: 165,
    protein: 31.0,
    carbs: 0.0,
    fat: 3.6,
    fiber: 0.0,
    sugar: 0.0,
  },
  {
    foodName: 'Whey Protein Powder',
    calories: 390,
    protein: 80.0,
    carbs: 10.0,
    fat: 5.0,
    fiber: 0.0,
    sugar: 3.3, // Scaled for 100g (Approx 24g P / 120 kcal per 30g scoop)
  },
  {
    foodName: 'Whole Eggs (Large)',
    calories: 155,
    protein: 13.0,
    carbs: 1.1,
    fat: 11.0,
    fiber: 0.0,
    sugar: 1.1,
  },
  {
    foodName: 'Oatmeal (Raw Oats)',
    calories: 389,
    protein: 16.9,
    carbs: 66.3,
    fat: 6.9,
    fiber: 10.6,
    sugar: 0.0,
  },
  {
    foodName: 'White Jasmine Rice (Cooked)',
    calories: 130,
    protein: 2.7,
    carbs: 28.0,
    fat: 0.3,
    fiber: 0.4,
    sugar: 0.0,
  },
  {
    foodName: 'Brown Basmati Rice (Cooked)',
    calories: 111,
    protein: 2.6,
    carbs: 23.0,
    fat: 0.9,
    fiber: 1.8,
    sugar: 0.0,
  },
  {
    foodName: 'Banana',
    calories: 89,
    protein: 1.1,
    carbs: 22.8,
    fat: 0.3,
    fiber: 2.6,
    sugar: 12.2,
  },
  {
    foodName: 'Almonds',
    calories: 579,
    protein: 21.2,
    carbs: 21.6,
    fat: 49.9,
    fiber: 12.5,
    sugar: 4.3,
  },
  {
    foodName: 'Peanut Butter (Smooth)',
    calories: 588,
    protein: 25.0,
    carbs: 20.0,
    fat: 50.0,
    fiber: 6.0,
    sugar: 9.0,
  },
  {
    foodName: 'Sweet Potato (Baked)',
    calories: 86,
    protein: 1.6,
    carbs: 20.1,
    fat: 0.1,
    fiber: 3.0,
    sugar: 4.2,
  },
  {
    foodName: 'Greek Yogurt (0% Plain)',
    calories: 59,
    protein: 10.0,
    carbs: 3.6,
    fat: 0.4,
    fiber: 0.0,
    sugar: 3.2,
  },
  {
    foodName: 'Avocado',
    calories: 160,
    protein: 2.0,
    carbs: 8.5,
    fat: 14.7,
    fiber: 6.7,
    sugar: 0.7,
  },
  {
    foodName: 'Salmon Fillet (Raw)',
    calories: 208,
    protein: 20.0,
    carbs: 0.0,
    fat: 13.0,
    fiber: 0.0,
    sugar: 0.0,
  },
  {
    foodName: 'Ribeye Steak (Raw)',
    calories: 291,
    protein: 20.0,
    carbs: 0.0,
    fat: 22.0,
    fiber: 0.0,
    sugar: 0.0,
  },
  {
    foodName: 'Broccoli (Raw)',
    calories: 34,
    protein: 2.8,
    carbs: 7.0,
    fat: 0.4,
    fiber: 2.6,
    sugar: 1.7,
  }
];

/**
 * Searches the database for matching query items
 * @param {string} query 
 * @returns {Array} Matches
 */
export function searchFoodDatabase(query) {
  if (!query) return [];
  const cleanQuery = query.toLowerCase().trim();
  return MOCK_FOOD_DB.filter((item) =>
    item.foodName.toLowerCase().includes(cleanQuery)
  );
}

/**
 * Scale nutrients based on log weight in grams
 * @param {{calories: number, protein: number, carbs: number, fat: number, fiber: number, sugar: number}} food 
 * @param {number} weightGrams 
 * @returns {{calories: number, protein: number, carbs: number, fat: number, fiber: number, sugar: number}}
 */
export function scaleNutrients(food, weightGrams) {
  const factor = weightGrams / 100;
  return {
    calories: Math.round(food.calories * factor),
    protein: parseFloat((food.protein * factor).toFixed(1)),
    carbs: parseFloat((food.carbs * factor).toFixed(1)),
    fat: parseFloat((food.fat * factor).toFixed(1)),
    fiber: parseFloat((food.fiber * factor).toFixed(1)),
    sugar: parseFloat((food.sugar * factor).toFixed(1)),
  };
}
