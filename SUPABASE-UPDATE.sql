-- Agregar campo para trackear quién cortó en la ronda actual
ALTER TABLE games ADD COLUMN current_round_cut_by UUID REFERENCES players(id);

-- Cuando pases a la siguiente ronda, este campo se limpia automáticamente
-- porque current_round cambia
