import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../services/supabase';
import { SoundFX } from '../services/audio';

export interface PlayerStats {
  level: number;
  exp: number;
  maxExp: number;
  availablePoints: number;
  strength: number;
  agility: number;
  vitality: number;
  intelligence: number;
  gold: number;
}

export interface QuestItem {
  current: number;
  target: number;
}

export interface DailyQuest {
  dateString: string;
  pushups: QuestItem;
  situps: QuestItem;
  planks: QuestItem;
  running: QuestItem;
  extraSkill?: QuestItem;
  isCompleted: boolean;
}

export interface AthleteProfile {
  name: string;
  customAvatarUri?: string | null;
  gender: 'Masculino' | 'Feminino' | 'Oculto';
  age: number;
  weight: number;
  height: number;
  fitnessLevel: 'Iniciante' | 'Intermediário' | 'Atleta';
  primaryGoal: 'Força/Massa' | 'Perda de Peso' | 'Resistência/Stamina';
  availableTime: '< 30 min' | '30-60 min' | '> 60 min';
  injuries: {
    knee: boolean;
    shoulder: boolean;
    lowerBack: boolean;
  };
}

export interface Skill {
  id: string;
  epic_name: string;
  real_name: string;
  category: string;
  required_level: number;
  description: string;
  unit: string;
  base_target: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  condition_type: string;
  condition_value: number;
  reward_exp: number;
}

export interface SystemConfig {
  soundEnabled: boolean;
  notificationsEnabled: boolean;
}

interface SystemState {
  stats: PlayerStats;
  quest: DailyQuest;
  config: SystemConfig;
  penaltyDebt: number;
  isPenaltyActive: boolean;
  
  equippedSkillId: string | null;
  equippedSkillStreak: number;

  stravaToken: string | null;
  lastPenaltyStravaId: string | number | null;
  
  hasCompletedOnboarding: boolean;
  profile: AthleteProfile | null;
  
  // Dados do Supabase
  dbSkills: Skill[];
  dbAchievements: Achievement[];
  dbShopItems: any[];
  systemMessages: string[];
  
  // Estado local
  unlockedAchievements: string[];
  showCompletionModal: boolean;
  
  addExp: (amount: number) => void;
  allocatePoint: (stat: 'strength' | 'agility' | 'vitality' | 'intelligence') => void;
  progressQuest: (type: 'pushups' | 'situps' | 'planks' | 'running' | 'extraSkill', amount: number) => void;
  completeMission: () => void;
  generateDailyQuest: () => void;
  checkMidnightFail: () => void;
  payPenalty: (activityId?: string | number | null) => void;
  toggleSound: () => void;
  toggleNotifications: () => void;
  equipSkill: (skillId: string) => void;
  setStravaToken: (token: string) => void;
  syncStravaRunning: (distanceKm: number) => void;
  completeOnboarding: (profile: AthleteProfile) => void;
  resetOnboarding: () => void;
  setCustomAvatar: (uri: string | null) => void;
  
  setShowCompletionModal: (show: boolean) => void;
  checkAchievements: () => void;
  buyAndUseItem: (itemId: string, cost: number) => boolean;
  
  loadFromCloud: () => Promise<void>;
  saveToCloud: () => Promise<void>;
  fetchStaticData: () => Promise<void>;
}

export const getHunterRank = (level: number): string => {
  if (level < 10) return 'E';
  if (level < 25) return 'D';
  if (level < 50) return 'C';
  if (level < 100) return 'B';
  if (level < 200) return 'A';
  return 'S';
};

const calculateTargets = (stats: PlayerStats, profile: AthleteProfile | null) => {
  let baseReps = 10;
  let baseTime = 30;
  let baseDist = 2.0;

  if (profile) {
    switch (profile.fitnessLevel) {
      case 'Iniciante': baseReps = 5; baseTime = 20; baseDist = 1.0; break;
      case 'Intermediário': baseReps = 15; baseTime = 40; baseDist = 2.5; break;
      case 'Atleta': baseReps = 30; baseTime = 60; baseDist = 5.0; break;
    }

    const heightM = profile.height / 100;
    const imc = profile.weight / (heightM * heightM);
    
    if (imc >= 30) {
      baseDist = baseDist * 0.5;
      baseTime = baseTime * 1.3;
    } else if (imc >= 25) {
      baseDist = baseDist * 0.8;
    }

    if (profile.primaryGoal === 'Força/Massa') {
      baseReps = baseReps * 1.4;
      baseDist = baseDist * 0.8;
    } else if (profile.primaryGoal === 'Perda de Peso') {
      baseDist = baseDist * 1.3;
      baseReps = baseReps * 0.9;
    } else if (profile.primaryGoal === 'Resistência/Stamina') {
      baseTime = baseTime * 1.4;
      baseDist = baseDist * 1.2;
    }

    if (profile.availableTime === '< 30 min') {
      baseDist = Math.min(baseDist, 1.5);
      baseReps = Math.min(baseReps, 20);
      baseTime = Math.min(baseTime, 45);
    } else if (profile.availableTime === '30-60 min') {
      baseDist = Math.min(baseDist, 5.0);
    }

    if (profile.injuries.knee) {
      baseDist = baseDist * 0.2;
    }
    if (profile.injuries.shoulder) {
      baseReps = baseReps * 0.3;
      baseTime = baseTime * 0.5;
    }
    if (profile.injuries.lowerBack) {
      baseReps = baseReps * 0.4;
    }
  }

  const isFemale = profile?.gender === 'Feminino';
  const upperBodyMod = isFemale ? 0.65 : 1.0;
  const cardioMod = isFemale ? 0.9 : 1.0;

  // Curva Híbrida de progressão contínua, mas mais segura que a linear
  const levelScaling = Math.pow(stats.level, 0.8) * 3;
  const strScaling = Math.pow(stats.strength, 0.8) * 3;
  const vitScaling = Math.pow(stats.vitality, 0.8) * 3;
  const agiScaling = Math.pow(stats.agility, 0.8) * 0.4;

  return {
    pushups: Math.round((baseReps + levelScaling + strScaling) * upperBodyMod),
    situps: Math.round(baseReps + levelScaling + vitScaling),
    planks: Math.round(baseTime + (levelScaling * 1.5) + (vitScaling * 2)),
    running: Number(((baseDist + (Math.pow(stats.level, 0.8) * 0.25) + agiScaling) * cardioMod).toFixed(1)),
  };
};

const CLOUD_FIELDS = ['stats', 'quest', 'penaltyDebt', 'isPenaltyActive', 'equippedSkillId', 'equippedSkillStreak', 'hasCompletedOnboarding', 'profile', 'unlockedAchievements', 'config'];

export const useSystemStore = create<SystemState>()(
  persist(
    (set, get) => ({
      stats: { level: 1, exp: 0, maxExp: 100, availablePoints: 0, strength: 0, agility: 0, vitality: 0, intelligence: 0, gold: 0 },
      quest: {
        dateString: new Date().toISOString().split('T')[0],
        pushups: { current: 0, target: 15 },
        situps: { current: 0, target: 15 },
        planks: { current: 0, target: 32 },
        running: { current: 0, target: 2.5 },
        isCompleted: false,
      },
      config: {
        soundEnabled: true,
        notificationsEnabled: true,
      },
      penaltyDebt: 0,
      isPenaltyActive: false,
      equippedSkillId: null,
      equippedSkillStreak: 0,
      stravaToken: null,
      lastPenaltyStravaId: null,
      hasCompletedOnboarding: false,
      profile: null,
      
      dbSkills: [],
      dbAchievements: [],
      dbShopItems: [],
      systemMessages: [
        "Iniciando escaneamento biométrico...",
        "Caçador não identificado encontrado.",
        "Para estabelecer conexão, o Sistema necessita de dados vitais.",
        "Qual é o estado atual do seu Avatar?"
      ],
      unlockedAchievements: [],
      showCompletionModal: false,

      fetchStaticData: async () => {
        try {
          const [skillsRes, achRes, shopRes, configRes] = await Promise.all([
            supabase.from('skills').select('*'),
            supabase.from('achievements').select('*'),
            supabase.from('shop_items').select('*'),
            supabase.from('system_config').select('*').eq('key', 'SYSTEM_MESSAGES').single()
          ]);
          
          const updates: any = {};
          if (skillsRes.data) updates.dbSkills = skillsRes.data;
          if (achRes.data) updates.dbAchievements = achRes.data;
          if (shopRes.data) updates.dbShopItems = shopRes.data;
          if (configRes.data && configRes.data.value) updates.systemMessages = configRes.data.value;
          
          set(updates);
          get().checkAchievements();
        } catch (e) {
          console.warn('Erro ao buscar dados do Supabase', e);
        }
      },

      loadFromCloud: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('players')
          .select('state_json')
          .eq('id', user.id)
          .single();

        if (data?.state_json && !error) {
          set(data.state_json);
        }
      },

      saveToCloud: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const state = get();
        const cloudState: Record<string, any> = {};
        CLOUD_FIELDS.forEach(field => {
          cloudState[field] = (state as any)[field];
        });

        await supabase.from('players').upsert({
          id: user.id,
          state_json: cloudState,
          updated_at: new Date().toISOString(),
        });
      },

      completeOnboarding: (profile) => {
        set({ hasCompletedOnboarding: true, profile });
        get().generateDailyQuest();
        setTimeout(() => get().saveToCloud(), 1000);
      },

      resetOnboarding: () => {
        set({ hasCompletedOnboarding: false });
        setTimeout(() => get().saveToCloud(), 500);
      },

      setCustomAvatar: (uri) => {
        const { profile } = get();
        if (profile) {
          set({ profile: { ...profile, customAvatarUri: uri } });
          setTimeout(() => get().saveToCloud(), 500);
        }
      },

      setStravaToken: (token) => set({ stravaToken: token }),

      setShowCompletionModal: (show) => set({ showCompletionModal: show }),

      toggleSound: () => {
        set((state) => ({ config: { ...state.config, soundEnabled: !state.config.soundEnabled } }));
      },

      toggleNotifications: () => {
        set((state) => ({ config: { ...state.config, notificationsEnabled: !state.config.notificationsEnabled } }));
      },

      checkAchievements: () => {
        const { stats, dbAchievements, unlockedAchievements, equippedSkillId } = get();
        if (!dbAchievements.length) return;
        
        let newUnlocks = false;
        
        dbAchievements.forEach(ach => {
          if (unlockedAchievements.includes(ach.id)) return;
          
          let isMet = false;
          if (ach.condition_type === 'level' && stats.level >= ach.condition_value) {
            isMet = true;
          } else if (ach.condition_type === 'skills_equipped' && equippedSkillId) {
            isMet = true;
          }
          
          if (isMet) {
            unlockedAchievements.push(ach.id);
            newUnlocks = true;
            setTimeout(() => get().addExp(ach.reward_exp), 500);
          }
        });
        
        if (newUnlocks) {
          set({ unlockedAchievements: [...unlockedAchievements] });
          get().saveToCloud();
        }
      },

      syncStravaRunning: (distanceKm) => {
        const { quest, isPenaltyActive, equippedSkillStreak, dbAchievements, unlockedAchievements } = get();
        if (isPenaltyActive || quest.isCompleted) return;

        const updatedQuest = { ...quest };
        updatedQuest.running.current = Math.min(Number(distanceKm.toFixed(2)), updatedQuest.running.target);
        
        let isCompleted = 
          updatedQuest.pushups.current >= updatedQuest.pushups.target &&
          updatedQuest.situps.current >= updatedQuest.situps.target &&
          updatedQuest.planks.current >= updatedQuest.planks.target &&
          updatedQuest.running.current >= updatedQuest.running.target;
          
        if (updatedQuest.extraSkill) {
           isCompleted = isCompleted && updatedQuest.extraSkill.current >= updatedQuest.extraSkill.target;
        }
        
        if (isCompleted) {
          get().completeMission();
        }

        set({ quest: updatedQuest });
        setTimeout(() => get().saveToCloud(), 500);
      },

      equipSkill: (skillId) => {
        const { equippedSkillId, equippedSkillStreak } = get();
        if (equippedSkillId && equippedSkillStreak > 0 && equippedSkillStreak < 7) {
          alert('Você só pode trocar de habilidade após 7 dias de conclusão perfeita com ela.');
          return;
        }
        set({ equippedSkillId: skillId, equippedSkillStreak: 0 });
        get().generateDailyQuest();
        setTimeout(() => get().checkAchievements(), 500);
      },

      generateDailyQuest: () => {
        const { stats, equippedSkillId, equippedSkillStreak, profile, dbSkills } = get();
        const targets = calculateTargets(stats, profile);
        
        let activeSkillId = equippedSkillId;
        // Quebra a pedra após 7 missões completas
        if (equippedSkillId && equippedSkillStreak >= 7) {
          activeSkillId = null;
          set({ equippedSkillId: null, equippedSkillStreak: 0 });
          alert('Sua Pedra de Habilidade quebrou! A habilidade extra não está mais disponível.');
        }
        
        let extraSkillTarget = undefined;
        if (activeSkillId) {
          const skill = dbSkills.find(s => s.id === activeSkillId);
          if (skill) {
            const scaling = skill.category === 'Inteligência' ? (stats.intelligence * 2) : (stats.level * 2);
            extraSkillTarget = { current: 0, target: skill.base_target + scaling };
          }
        }
        
        set({
          quest: {
            dateString: new Date().toISOString().split('T')[0],
            pushups: { current: 0, target: targets.pushups },
            situps: { current: 0, target: targets.situps },
            planks: { current: 0, target: targets.planks },
            running: { current: 0, target: targets.running },
            ...(extraSkillTarget ? { extraSkill: extraSkillTarget } : {}),
            isCompleted: false,
          }
        });
      },

      progressQuest: (type, amount) => {
        const { quest, isPenaltyActive } = get();
        if (isPenaltyActive || quest.isCompleted) return;

        const updatedQuest = { ...quest };
        if (updatedQuest[type]) {
          updatedQuest[type]!.current = Math.min(updatedQuest[type]!.current + amount, updatedQuest[type]!.target);
        }
        
        let isCompleted = 
          updatedQuest.pushups.current >= updatedQuest.pushups.target &&
          updatedQuest.situps.current >= updatedQuest.situps.target &&
          updatedQuest.planks.current >= updatedQuest.planks.target &&
          updatedQuest.running.current >= updatedQuest.running.target;
          
        if (updatedQuest.extraSkill) {
           isCompleted = isCompleted && updatedQuest.extraSkill.current >= updatedQuest.extraSkill.target;
        }
        
        if (isCompleted) {
          get().completeMission();
        } else {
          set({ quest: updatedQuest });
          setTimeout(() => get().saveToCloud(), 500);
        }
      },

      addExp: (amount) => {
        set((state) => {
          let newExp = state.stats.exp + amount;
          let newGold = (state.stats.gold || 0) + amount;
          let newLevel = state.stats.level;
          let newMaxExp = state.stats.maxExp;
          let newAvailablePoints = state.stats.availablePoints;

          while (newExp >= newMaxExp) {
            newExp -= newMaxExp;
            newLevel += 1;
            newMaxExp = 100 + (newLevel * 50) + (newLevel * newLevel * 10);
            newAvailablePoints += 5;
            SoundFX.playLevelUp();
          }

          return {
            stats: { ...state.stats, exp: newExp, level: newLevel, maxExp: newMaxExp, availablePoints: newAvailablePoints, gold: newGold }
          };
        });
        setTimeout(() => get().checkAchievements(), 500);
        setTimeout(() => get().saveToCloud(), 500);
      },

      allocatePoint: (stat) => {
        const { stats } = get();
        if (stats.availablePoints > 0) {
          set({
            stats: { ...stats, availablePoints: stats.availablePoints - 1, [stat]: stats[stat] + 1 }
          });
          setTimeout(() => get().saveToCloud(), 500);
        }
      },

      completeMission: () => {
        const { quest, equippedSkillStreak, dbAchievements, unlockedAchievements } = get();
        if (quest.isCompleted) return;
        
        SoundFX.playQuestComplete();
        const updatedQuest = { ...quest, isCompleted: true };
        const newStreak = equippedSkillStreak + 1;
        set({ quest: updatedQuest, equippedSkillStreak: newStreak, showCompletionModal: true });
        
        const pushupsExp = updatedQuest.pushups.target * 1;
        const situpsExp = updatedQuest.situps.target * 1;
        const planksExp = updatedQuest.planks.target * 0.5;
        const runningExp = updatedQuest.running.target * 30;
        let baseExp = pushupsExp + situpsExp + planksExp + runningExp;
        
        const extraSkillExp = updatedQuest.extraSkill ? updatedQuest.extraSkill.target * 2 : 0;
        
        let rewardAmount = Math.round((baseExp + extraSkillExp) * (updatedQuest.extraSkill ? 1.2 : 1));
        
        setTimeout(() => get().addExp(rewardAmount), 500); 
        
        const achStreak1 = dbAchievements.find(a => a.id === 'a1');
        if (achStreak1 && !unlockedAchievements.includes('a1')) {
          unlockedAchievements.push('a1');
          setTimeout(() => get().addExp(achStreak1.reward_exp), 500);
        }
        const achStreak7 = dbAchievements.find(a => a.id === 'a2');
        if (achStreak7 && newStreak >= 7 && !unlockedAchievements.includes('a2')) {
          unlockedAchievements.push('a2');
          setTimeout(() => get().addExp(achStreak7.reward_exp), 500);
        }
        setTimeout(() => get().saveToCloud(), 500);
      },

      buyAndUseItem: (itemId, cost) => {
        const { stats } = get();
        if ((stats.gold || 0) < cost) return false;

        if (itemId === 'i1') {
          // Poção de Descanso
          set((state) => ({
            stats: { ...state.stats, gold: state.stats.gold - cost },
            quest: {
              ...state.quest,
              pushups: { ...state.quest.pushups, current: state.quest.pushups.target },
              situps: { ...state.quest.situps, current: state.quest.situps.target },
              planks: { ...state.quest.planks, current: state.quest.planks.target },
              running: { ...state.quest.running, current: state.quest.running.target },
              ...(state.quest.extraSkill ? { extraSkill: { ...state.quest.extraSkill, current: state.quest.extraSkill.target } } : {})
            }
          }));
          get().completeMission();
          return true;
        }

        if (itemId === 'i2') {
          // Pergaminho da Sorte: Remove Penalty
          set((state) => ({
            stats: { ...state.stats, gold: state.stats.gold - cost },
            isPenaltyActive: false,
            penaltyDebt: 0
          }));
          get().generateDailyQuest(); // Gera a missão do dia se estava bloqueado
          setTimeout(() => get().saveToCloud(), 500);
          return true;
        }

        if (itemId.startsWith('stone_')) {
          const { equippedSkillId } = get();
          if (equippedSkillId) {
            alert('Você já possui uma Pedra de Habilidade ativa!');
            return false;
          }
          const skillId = itemId.replace('stone_', '');
          set((state) => ({
            stats: { ...state.stats, gold: state.stats.gold - cost },
            equippedSkillId: skillId,
            equippedSkillStreak: 0
          }));
          get().generateDailyQuest();
          setTimeout(() => get().saveToCloud(), 500);
          return true;
        }

        return false;
      },

      checkMidnightFail: () => {
        const { quest, stats, penaltyDebt, isPenaltyActive, equippedSkillId } = get();
        const today = new Date().toISOString().split('T')[0];
        
        if (quest.dateString !== today) {
          if (!quest.isCompleted && !isPenaltyActive) {
            const debtIncrease = stats.level * 10;
            SoundFX.playPenalty();
            set({ 
              penaltyDebt: penaltyDebt + debtIncrease,
              isPenaltyActive: true,
              equippedSkillStreak: 0
            });
            setTimeout(() => get().saveToCloud(), 500);
          } else if (quest.isCompleted && !isPenaltyActive) {
            get().generateDailyQuest();
          }
        }
      },

      payPenalty: (activityId?: string | number | null) => {
        if (activityId) {
          set({ isPenaltyActive: false, lastPenaltyStravaId: activityId });
        } else {
          set({ isPenaltyActive: false });
        }
        get().generateDailyQuest();
        setTimeout(() => get().saveToCloud(), 500);
      }
    }),
    {
      name: 'system-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
