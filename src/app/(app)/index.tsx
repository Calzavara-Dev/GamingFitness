import { View, TouchableOpacity, ScrollView, Animated, Easing, Image } from 'react-native';
import { SystemText as Text } from '../../components/SystemText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSystemStore, getHunterRank } from '../../store/useSystemStore';
import { useEffect, useRef, useState } from 'react';
import { fetchTodayRunningDistance } from '../../services/stravaApi';
import { SL, SystemPanel, PanelHeader, SystemProgressBar, SystemButton, SystemAlert, SystemScreenWrapper, SystemStaggerGroup } from '../../components/SystemUI';
import { supabase } from '../../services/supabase';

// Timer regressivo para meia noite
function useCountdownToMidnight(isActive: boolean) {
  const [timeLeft, setTimeLeft] = useState('00:00:00');

  useEffect(() => {
    if (!isActive) return;
    
    const interval = setInterval(() => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      
      const diff = midnight.getTime() - now.getTime();
      
      if (diff <= 0) {
        setTimeLeft('00:00:00');
        return;
      }

      const h = Math.floor((diff / (1000 * 60 * 60)) % 24).toString().padStart(2, '0');
      const m = Math.floor((diff / 1000 / 60) % 60).toString().padStart(2, '0');
      const s = Math.floor((diff / 1000) % 60).toString().padStart(2, '0');
      
      setTimeLeft(`${h}:${m}:${s}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive]);

  return timeLeft;
}

// Card de missão no estilo Solo Leveling
function QuestMissionRow({ label, iconSource, type, unit, quest, progressQuest, amount, color }: any) {
  const item = quest[type];
  if (!item) return null;
  const isDone = item.current >= item.target;
  const progress = Math.min(item.current / item.target, 1);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.93, duration: 70, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();
    progressQuest(type, amount);
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }], marginBottom: 10 }}>
      <View style={{
        backgroundColor: isDone ? 'rgba(0,255,136,0.05)' : SL.bgInner,
        borderWidth: 1,
        borderColor: isDone ? `${SL.green}44` : `${color}25`,
        borderRadius: 3,
        padding: 14,
      }}>
        {/* Linha superior */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            {iconSource ? (
              <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: isDone ? `${SL.green}22` : `${color}15`, borderWidth: 1, borderColor: isDone ? SL.green : `${color}55`, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                <Image source={iconSource} style={{ width: 30, height: 30 }} resizeMode="contain" />
              </View>
            ) : (
              <Text style={{ fontSize: 16 }}>{isDone ? '◈' : '◇'}</Text>
            )}
            <Text style={{ color: isDone ? SL.green : SL.white, fontWeight: '700', fontSize: 14, letterSpacing: 1 }}>
              {label.toUpperCase()}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Text style={{ color: isDone ? SL.green : color, fontFamily: 'monospace', fontWeight: '700', fontSize: 13 }}>
              {item.current} / {item.target}{unit}
            </Text>
            {!quest.isCompleted && !isDone && (
              <TouchableOpacity
                onPress={handlePress}
                style={{
                  backgroundColor: `${color}20`, borderWidth: 1, borderColor: `${color}66`,
                  borderRadius: 3, paddingHorizontal: 12, paddingVertical: 3,
                }}
              >
                <Text style={{ color, fontWeight: '900', fontSize: 15 }}>+</Text>
              </TouchableOpacity>
            )}
            {isDone && !quest.isCompleted && (
              <View style={{ backgroundColor: `${SL.green}22`, borderWidth: 1, borderColor: `${SL.green}55`, borderRadius: 3, paddingHorizontal: 8, paddingVertical: 3 }}>
                <Text style={{ color: SL.green, fontSize: 11, fontWeight: '700' }}>DONE</Text>
              </View>
            )}
          </View>
        </View>
        <SystemProgressBar progress={progress} color={isDone ? SL.green : color} height={4} />
      </View>
    </Animated.View>
  );
}

export default function HomeScreen() {
  const { quest, stats, progressQuest, isPenaltyActive, checkMidnightFail, equippedSkillId, stravaToken, lastPenaltyStravaId, syncStravaRunning, dbSkills, showCompletionModal, setShowCompletionModal } = useSystemStore();
  const [isSyncing, setIsSyncing] = useState(false);

  const timeToNextQuest = useCountdownToMidnight(quest.isCompleted);

  useEffect(() => {
    checkMidnightFail();
  }, []);

function LeaderboardMarquee() {
  const [ranking, setRanking] = useState<any[]>([]);
  const scrollRef = useRef<ScrollView>(null);
  
  useEffect(() => {
    async function fetchRanking() {
      try {
        const { data } = await supabase.from('global_ranking').select('*').limit(10);
        if (data) setRanking(data);
      } catch (e) {}
    }
    fetchRanking();
  }, []);

  useEffect(() => {
    if (ranking.length === 0) return;
    let offset = 0;
    const interval = setInterval(() => {
      offset += 150; 
      if (offset > ranking.length * 80) offset = 0;
      scrollRef.current?.scrollTo({ x: offset, animated: true });
    }, 3000);
    return () => clearInterval(interval);
  }, [ranking.length]);

  if (ranking.length === 0) return null;

  return (
    <View style={{ backgroundColor: SL.bgInner, borderBottomWidth: 1, borderTopWidth: 1, borderColor: SL.dim, paddingVertical: 8, marginBottom: 16 }}>
      <ScrollView ref={scrollRef} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 18, alignItems: 'center' }}>
        <Text style={{ color: SL.cyan, fontSize: 10, letterSpacing: 2, marginRight: 16, fontWeight: '900' }}>🏆 RANKING GLOBAL {'>>'}</Text>
        {ranking.map((p, i) => (
          <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginRight: 24 }}>
            <Text style={{ color: i === 0 ? '#FFD700' : (i === 1 ? '#C0C0C0' : (i === 2 ? '#CD7F32' : SL.cyan)), fontWeight: '900', marginRight: 6, fontSize: 12 }}>#{i+1}</Text>
            <Text style={{ color: SL.white, fontWeight: '700', marginRight: 6, fontSize: 12 }}>{p.player_name.split(' ')[0]}</Text>
            <Text style={{ color: SL.muted, fontSize: 10, fontWeight: '800' }}>Nv {p.level}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

  const handleStravaSync = async () => {
    if (!stravaToken) return;
    setIsSyncing(true);
    const distanceKm = await fetchTodayRunningDistance(stravaToken, lastPenaltyStravaId);
    syncStravaRunning(distanceKm);
    setIsSyncing(false);
  };

  const equippedSkill = equippedSkillId ? dbSkills.find(s => s.id === equippedSkillId) : null;
  const totalQuests = [quest.pushups, quest.situps, quest.planks, quest.running, quest.extraSkill].filter(Boolean).length;
  const completedCount = [quest.pushups, quest.situps, quest.planks, quest.running, quest.extraSkill]
    .filter(Boolean).filter(q => q!.current >= q!.target).length;

  if (isPenaltyActive) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#0a0002', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <Text style={{ color: SL.red, fontSize: 11, letterSpacing: 6, fontWeight: '800', marginBottom: 16 }}>⚠  SISTEMA — ALERTA CRÍTICO  ⚠</Text>
        <Text style={{ color: SL.red, fontSize: 52, fontWeight: '900', letterSpacing: 8, textAlign: 'center', textShadowColor: SL.red, textShadowRadius: 30, lineHeight: 60 }}>
          PENALTY{'\n'}ZONE
        </Text>
        <Text style={{ color: SL.muted, textAlign: 'center', marginTop: 24, lineHeight: 24 }}>
          Você negligenciou seus deveres, Caçador.{'\n'}O Sistema exige redenção. Vá para a aba Penalty.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SystemScreenWrapper>
      <SafeAreaView style={{ flex: 1, backgroundColor: SL.bg }}>
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 18, paddingTop: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          <SystemStaggerGroup staggerDelay={100}>
          {/* Header */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ color: SL.cyan, fontSize: 10, letterSpacing: 5, fontWeight: '800', marginBottom: 4 }}>
              ══ SISTEMA ATIVO ══
            </Text>
            <Text style={{ color: SL.white, fontSize: 24, fontWeight: '900', letterSpacing: 1 }}>
              MISSÃO DIÁRIA
            </Text>
            <Text style={{ color: SL.muted, fontSize: 12, marginTop: 2 }}>
              [{quest.isCompleted ? 'CONCLUÍDA' : 'EM ANDAMENTO'}] · Rank {getHunterRank(stats.level)} (Nv {stats.level}) · {completedCount}/{totalQuests} objetivos
            </Text>
          </View>
          
          <LeaderboardMarquee />

          {/* Condicional: Missão em Andamento VS Missão Concluída */}
          {!quest.isCompleted ? (
            <>
              {/* Progresso geral */}
              <SystemPanel style={{ marginBottom: 18 }}>
                <PanelHeader title="Progresso da Missão" />
                <SystemProgressBar
                  progress={totalQuests > 0 ? completedCount / totalQuests : 0}
                  color={SL.cyan}
                  height={8}
                  label="Progresso Total"
                />
              </SystemPanel>

              {/* Missões */}
              <SystemPanel>
                <PanelHeader title="Objetivos de Batalha" subtitle="Complete todos os objetivos para ganhar EXP" />

                <QuestMissionRow label="Flexões" iconSource={require('../../../assets/images/icons/mission_pushup.jpg')} type="pushups" unit="" quest={quest} progressQuest={progressQuest} amount={10} color={SL.cyan} />
                <QuestMissionRow label="Abdominais" iconSource={require('../../../assets/images/icons/mission_situp.jpg')} type="situps" unit="" quest={quest} progressQuest={progressQuest} amount={10} color={SL.purple} />
                <QuestMissionRow label="Prancha" iconSource={require('../../../assets/images/shop_stone_green.jpg')} type="planks" unit="s" quest={quest} progressQuest={progressQuest} amount={10} color={SL.gold} />

                {/* Corrida */}
                <View style={{
                  backgroundColor: quest.running.current >= quest.running.target ? 'rgba(0,255,136,0.05)' : SL.bgInner,
                  borderWidth: 1, borderColor: quest.running.current >= quest.running.target ? `${SL.green}44` : 'rgba(252,76,2,0.25)',
                  borderRadius: 3, padding: 14,
                }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Image source={require('../../../assets/images/shop_stone_blue.jpg')} style={{ width: 24, height: 24 }} resizeMode="contain" />
                      <Text style={{ color: quest.running.current >= quest.running.target ? SL.green : SL.white, fontWeight: '700', fontSize: 14, letterSpacing: 1 }}>CORRIDA</Text>
                      {stravaToken && (
                        <TouchableOpacity onPress={handleStravaSync} disabled={isSyncing} style={{ backgroundColor: 'rgba(252,76,2,0.2)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 3, borderWidth: 1, borderColor: '#fc4c0266' }}>
                          <Text style={{ color: '#fc4c02', fontSize: 10, fontWeight: '700', letterSpacing: 1 }}>{isSyncing ? 'SYNC...' : '⚡STRAVA'}</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                      <Text style={{ color: quest.running.current >= quest.running.target ? SL.green : '#fc4c02', fontFamily: 'monospace', fontWeight: '700', fontSize: 13 }}>
                        {quest.running.current} / {quest.running.target} km
                      </Text>
                      {!quest.isCompleted && !stravaToken && (
                        <Text style={{ color: '#fc4c0266', fontSize: 10, letterSpacing: 1, fontWeight: 'bold' }}>REQUER STRAVA</Text>
                      )}
                    </View>
                  </View>
                  <SystemProgressBar progress={Math.min(quest.running.current / quest.running.target, 1)} color={quest.running.current >= quest.running.target ? SL.green : '#fc4c02'} height={4} />
                </View>
              </SystemPanel>

              {/* Habilidade extra */}
              {quest.extraSkill && equippedSkill ? (
                <SystemPanel color={SL.purple} glow={SL.purpleGlow} style={{ marginTop: 18 }}>
                  <PanelHeader title="Habilidade Especial" subtitle={`Streak: ${equippedSkill.real_name}`} color={SL.purple} />
                  <QuestMissionRow
                    label={equippedSkill.epic_name} iconSource={require('../../../assets/images/icons/tab_quest.jpg')} type="extraSkill"
                    unit={equippedSkill.unit} quest={quest} progressQuest={progressQuest} amount={1} color={SL.purple}
                  />
                </SystemPanel>
              ) : <View />}
            </>
          ) : (
            /* TELA DE MISSÃO CONCLUÍDA NO CENTRO */
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 40, padding: 20 }}>
              <View style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: `${SL.green}15`, borderWidth: 2, borderColor: SL.green, justifyContent: 'center', alignItems: 'center', marginBottom: 24, shadowColor: SL.green, shadowOpacity: 0.8, shadowRadius: 20 }}>
                <Text style={{ fontSize: 40, color: SL.green }}>✔</Text>
              </View>

              <Text style={{ color: SL.green, fontSize: 24, fontWeight: '900', letterSpacing: 4, textAlign: 'center', marginBottom: 12 }}>
                MISSÃO DIÁRIA CONCLUÍDA
              </Text>

              <Text style={{ color: SL.muted, fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 40 }}>
                Os deuses do Sistema reconhecem seu esforço. Seus músculos estão se adaptando.
              </Text>

              <View style={{ backgroundColor: SL.bgInner, borderWidth: 1, borderColor: SL.dim, borderRadius: 3, padding: 20, width: '100%', alignItems: 'center' }}>
                <Text style={{ color: SL.cyan, fontSize: 10, letterSpacing: 3, fontWeight: '800', marginBottom: 12 }}>
                  TEMPO PARA A PRÓXIMA MISSÃO
                </Text>
                <Text style={{ color: SL.white, fontSize: 42, fontWeight: '900', fontFamily: 'monospace', letterSpacing: 6 }}>
                  {timeToNextQuest}
                </Text>
              </View>
            </View>
          )}
        </SystemStaggerGroup>
        </ScrollView>
      </SafeAreaView>

      {/* MODAL DE CONCLUSÃO DE MISSÃO */}
      {showCompletionModal && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center', padding: 24, zIndex: 100 }}>
          <View style={{ backgroundColor: SL.bgInner, padding: 30, borderRadius: 5, borderWidth: 1, borderColor: SL.green, alignItems: 'center', width: '100%', shadowColor: SL.green, shadowOpacity: 0.5, shadowRadius: 30 }}>
            <Text style={{ color: SL.green, fontSize: 18, fontWeight: '900', letterSpacing: 4, marginBottom: 16, textAlign: 'center' }}>
              MISSÃO DIÁRIA CONCLUÍDA
            </Text>
            <Text style={{ color: SL.white, fontSize: 14, textAlign: 'center', marginBottom: 30, lineHeight: 22 }}>
              Você sobreviveu mais um dia.{'\n'}O Sistema reconhece seu esforço.
            </Text>
            <SystemButton label="ACEITAR RECOMPENSAS" onPress={() => setShowCompletionModal(false)} variant="solid" color={SL.green} />
          </View>
        </View>
      )}

    </SystemScreenWrapper>
  );
}
