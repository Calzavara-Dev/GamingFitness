export interface Skill {
  id: string;
  epicName: string;
  realName: string;
  category: 'Força' | 'Mobilidade' | 'Corrida' | 'HIIT';
  requiredLevel: number;
  description: string;
  unit: string;
  baseTarget: number;
}

export const SKILLS_DB: Skill[] = [
  {
    id: 's1',
    epicName: 'Golpe do Despertar',
    realName: 'Burpees',
    category: 'HIIT',
    requiredLevel: 2,
    description: 'Um exercício full-body explosivo. Excelente para queima de gordura e resistência cardiovascular.',
    unit: ' reps',
    baseTarget: 15
  },
  {
    id: 's2',
    epicName: 'Passos da Sombra',
    realName: 'Tiros de Sprint (100m)',
    category: 'Corrida',
    requiredLevel: 4,
    description: 'Corra na velocidade máxima. Melhora a Agilidade e a capacidade anaeróbica.',
    unit: ' tiros',
    baseTarget: 5
  },
  {
    id: 's3',
    epicName: 'Postura do Titã',
    realName: 'Agachamento Búlgaro',
    category: 'Força',
    requiredLevel: 5,
    description: 'Foco absurdo nas pernas e glúteos. O pesadelo do dia de perna.',
    unit: ' reps/perna',
    baseTarget: 12
  },
  {
    id: 's4',
    epicName: 'Gravidade Zero',
    realName: 'Barra Fixa (Pull-ups)',
    category: 'Força',
    requiredLevel: 7,
    description: 'Erga o próprio peso. O verdadeiro teste de Força nas costas e braços.',
    unit: ' reps',
    baseTarget: 10
  },
  {
    id: 's5',
    epicName: 'Pele de Ferro',
    realName: 'Dragon Flag',
    category: 'Força',
    requiredLevel: 10,
    description: 'Técnica lendária de Bruce Lee. Exige um core impenetrável.',
    unit: ' segs',
    baseTarget: 20
  }
];
