// As cinco categorias alimentares, fechadas pela RN3 do UC006.
// Só ALLERGY exige descrição no texto livre (UC006 RN2).

export const DietaryCategoryCode = {
  Vegetarian: 'VEGETARIAN',
  Vegan: 'VEGAN',
  GlutenFree: 'GLUTEN_FREE',
  LactoseFree: 'LACTOSE_FREE',
  Allergy: 'ALLERGY',
} as const;
export type DietaryCategoryCode = (typeof DietaryCategoryCode)[keyof typeof DietaryCategoryCode];
