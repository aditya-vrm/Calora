/**
 * Calculate Body Mass Index (BMI)
 * @param {number} weightKg 
 * @param {number} heightCm 
 * @returns {number}
 */
export function calculateBMI(weightKg, heightCm) {
  const heightMeters = heightCm / 100;
  if (heightMeters <= 0) return 0;
  return parseFloat((weightKg / (heightMeters * heightMeters)).toFixed(1));
}

/**
 * Get BMI category and suggestion text
 * @param {number} bmi 
 * @returns {{category: string, color: string, suggestion: string}}
 */
export function getBMICategory(bmi) {
  if (bmi < 18.5) {
    return {
      category: 'Underweight',
      color: '#38BDF8', // Sky Blue
      suggestion: 'Consuming nutrient-dense foods and engaging in strength training can help build healthy muscle mass.',
    };
  } else if (bmi >= 18.5 && bmi < 25) {
    return {
      category: 'Healthy Weight',
      color: '#10B981', // Emerald Green
      suggestion: 'Great job! Maintain your current weight by balancing daily physical activity with a nutritious diet.',
    };
  } else if (bmi >= 25 && bmi < 30) {
    return {
      category: 'Overweight',
      color: '#F59E0B', // Amber
      suggestion: 'A slight caloric deficit combined with regular cardiovascular exercise can assist in safe fat loss.',
    };
  } else {
    return {
      category: 'Obese',
      color: '#EF4444', // Red
      suggestion: 'Consult a physician or dietitian. Aim for a structured exercise routine and sustainable dietary adjustments.',
    };
  }
}

/**
 * Calculate Basal Metabolic Rate (BMR) using Mifflin-St Jeor
 * @param {number} weightKg 
 * @param {number} heightCm 
 * @param {number} age 
 * @param {string} gender 
 * @returns {number}
 */
export function calculateBMR(weightKg, heightCm, age, gender) {
  if (gender === 'male') {
    return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age + 5);
  } else if (gender === 'female') {
    return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age - 161);
  } else {
    // Average default
    const maleBmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
    const femaleBmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
    return Math.round((maleBmr + femaleBmr) / 2);
  }
}

/**
 * Calculate Maintenance Calories based on BMR and active days
 * @param {number} bmr 
 * @param {string} workoutFrequency - '0', '1-2', '3-4', '5-6', '7'
 * @returns {number}
 */
export function calculateMaintenance(bmr, workoutFrequency) {
  let multiplier = 1.2; // Sedentary Default
  switch (workoutFrequency) {
    case '0':
      multiplier = 1.2;
      break;
    case '1-2':
      multiplier = 1.375;
      break;
    case '3-4':
      multiplier = 1.55;
      break;
    case '5-6':
      multiplier = 1.725;
      break;
    case '7':
    case 'Everyday':
      multiplier = 1.9;
      break;
  }
  return Math.round(bmr * multiplier);
}

/**
 * Calculate daily requirements based on profile
 * @param {{weight: number, height: number, age: number, gender: string, workoutFrequency: string, goal: string}} profile 
 * @returns {{bmi: number, bmr: number, maintenance: number, targetCalories: number, macros: {protein: number, carbs: number, fat: number}}}
 */
export function calculateFitnessParams(profile) {
  const { weight, height, age, gender, workoutFrequency, goal } = profile;
  
  const bmi = calculateBMI(weight, height);
  const bmr = calculateBMR(weight, height, age, gender);
  const maintenance = calculateMaintenance(bmr, workoutFrequency);
  
  // Caloric targets based on goal
  let targetCalories = maintenance;
  if (goal === 'lose' || goal === 'Lose Fat') {
    targetCalories = maintenance - 500;
  } else if (goal === 'lean-bulk' || goal === 'Lean Bulk') {
    targetCalories = maintenance + 300;
  } else if (goal === 'gain' || goal === 'Muscle Gain') {
    targetCalories = maintenance + 500;
  }
  
  // Enforce minimal healthy limit
  if (targetCalories < 1200) {
    targetCalories = 1200;
  }
  
  // Macronutrient calculation:
  // Protein: 2.0g per kg of weight (1g = 4 kcal)
  const proteinGrams = Math.round(weight * 2.0);
  const proteinKcal = proteinGrams * 4;
  
  // Fat: 25% of target calories (1g = 9 kcal)
  const fatKcal = targetCalories * 0.25;
  const fatGrams = Math.round(fatKcal / 9);
  
  // Carbs: remaining calories (1g = 4 kcal)
  const carbKcal = Math.max(0, targetCalories - (proteinKcal + fatKcal));
  const carbGrams = Math.round(carbKcal / 4);
  
  return {
    bmi,
    bmr,
    maintenance,
    targetCalories,
    macros: {
      protein: proteinGrams,
      carbs: carbGrams,
      fat: fatGrams
    }
  };
}

/**
 * Convert lbs to kg
 * @param {number} lbs 
 * @returns {number}
 */
export function lbsToKg(lbs) {
  return parseFloat((lbs * 0.45359237).toFixed(1));
}

/**
 * Convert kg to lbs
 * @param {number} kg 
 * @returns {number}
 */
export function kgToLbs(kg) {
  return parseFloat((kg / 0.45359237).toFixed(1));
}

/**
 * Convert ft/in to cm
 * @param {number} ft 
 * @param {number} inches 
 * @returns {number}
 */
export function feetInToCm(ft, inches) {
  return Math.round(ft * 30.48 + inches * 2.54);
}

/**
 * Convert cm to ft/in
 * @param {number} cm 
 * @returns {{feet: number, inches: number}}
 */
export function cmToFeetIn(cm) {
  const realInches = cm / 2.54;
  const feet = Math.floor(realInches / 12);
  const inches = Math.round(realInches % 12);
  return { feet, inches };
}
