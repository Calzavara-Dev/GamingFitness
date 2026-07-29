-- Insere as Pedras de Habilidade (Skill Stones) na loja, associadas às skills existentes
-- As pedras de habilidade concedem uma skill extra por 7 missões (1 semana).

INSERT INTO shop_items (id, name, description, cost, icon, type) VALUES
('stone_s1', 'Pedra: Golpe do Despertar', 'Uma pedra mágica que invoca a Habilidade Extra "Golpe do Despertar" (Burpees) nas suas missões diárias por 1 semana. Ganhe EXP e Gold Bônus ao completar.', 100, '💎', 'skill_stone'),
('stone_s2', 'Pedra: Passos da Sombra', 'Uma pedra mágica que invoca a Habilidade Extra "Passos da Sombra" (Sprints) nas suas missões diárias por 1 semana. Ganhe EXP e Gold Bônus ao completar.', 100, '💎', 'skill_stone'),
('stone_s3', 'Pedra: Postura do Titã', 'Uma pedra mágica que invoca a Habilidade Extra "Postura do Titã" (Agachamento Búlgaro) nas suas missões diárias por 1 semana. Ganhe EXP e Gold Bônus ao completar.', 100, '💎', 'skill_stone'),
('stone_s4', 'Pedra: Gravidade Zero', 'Uma pedra mágica que invoca a Habilidade Extra "Gravidade Zero" (Pull-ups) nas suas missões diárias por 1 semana. Ganhe EXP e Gold Bônus ao completar.', 100, '💎', 'skill_stone'),
('stone_s5', 'Pedra: Pele de Ferro', 'Uma pedra mágica que invoca a Habilidade Extra "Pele de Ferro" (Dragon Flag) nas suas missões diárias por 1 semana. Ganhe EXP e Gold Bônus ao completar.', 100, '💎', 'skill_stone');
