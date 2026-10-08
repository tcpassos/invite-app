-- As cinco categorias alimentares, fechadas pela RN3 do UC006.
-- Só a alergia exige descrição no texto livre (UC006 RN2).

INSERT INTO dietary_category (code, display_name, requires_description) VALUES
  ('VEGETARIAN',   'Vegetariano', false),
  ('VEGAN',        'Vegano',      false),
  ('GLUTEN_FREE',  'Sem glúten',  false),
  ('LACTOSE_FREE', 'Sem lactose', false),
  ('ALLERGY',      'Alergia',     true);
