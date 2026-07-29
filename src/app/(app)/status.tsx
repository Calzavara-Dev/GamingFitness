import { View, TouchableOpacity, Animated, Easing, ScrollView } from 'react-native';
import { SystemText as Text } from '../../components/SystemText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSystemStore, getHunterRank } from '../../store/useSystemStore';
import { useEffect, useRef } from 'react';
import { SL, SystemPanel, PanelHeader, SystemProgressBar, RankBadge, SystemButton, SystemScreenWrapper, SystemStaggerGroup } from '../../components/SystemUI';

// Linha de atributo no estilo janela de status do manhwa
function StatRow({ label, abbr, value, stat, onAdd, canAdd, color, icon, description }: any) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  const handlePress = () => {
    if (!canAdd) return;
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.94, duration: 80, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();
    Animated.sequence([
      Animated.timing(glowAnim, { toValue: 1, duration: 200, useNativeDriver: false }),
      Animated.timing(glowAnim, { toValue: 0, duration: 600, useNativeDriver: false }),
    ]).start();
    onAdd();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }], marginBottom: 10 }}>
      <View style={{
        backgroundColor: SL.bgInner, borderWidth: 1, borderColor: `${color}30`,
        borderRadius: 3, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 14,
      }}>
        {/* Ícone */}
        <View style={{ width: 46, height: 46, borderRadius: 3, backgroundColor: `${color}15`, borderWidth: 1, borderColor: `${color}40`, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 22 }}>{icon}</Text>
        </View>

        {/* Info */}
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6, marginBottom: 2 }}>
            <Text style={{ color, fontWeight: '900', fontSize: 11, letterSpacing: 3 }}>{abbr}</Text>
            <Text style={{ color: SL.muted, fontSize: 12 }}>{label}</Text>
          </View>
          <Text style={{ color: SL.white, fontWeight: '900', fontSize: 28, fontFamily: 'monospace', lineHeight: 32 }}>{value}</Text>
          <Text style={{ color: SL.muted, fontSize: 11, marginTop: 2 }}>{description}</Text>
        </View>

        {/* Botão + */}
        <TouchableOpacity
          onPress={handlePress}
          disabled={!canAdd}
          style={{
            width: 40, height: 40, borderRadius: 3,
            backgroundColor: canAdd ? `${color}20` : '#0d1a2a',
            borderWidth: 1, borderColor: canAdd ? `${color}70` : SL.dim,
            alignItems: 'center', justifyContent: 'center',
            shadowColor: canAdd ? color : 'transparent',
            shadowOpacity: canAdd ? 0.5 : 0, shadowRadius: 8,
          }}
        >
          <Text style={{ color: canAdd ? color : SL.muted, fontWeight: '900', fontSize: 20 }}>+</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}



export default function StatusScreen() {
  const { stats, allocatePoint, profile, dbAchievements, unlockedAchievements } = useSystemStore();
  const progressPercent = stats.exp / stats.maxExp;
  const rank = getHunterRank(stats.level);

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
            ══ JANELA DE STATUS ══
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ color: SL.white, fontSize: 24, fontWeight: '900', letterSpacing: 1 }}>{profile?.name?.toUpperCase() || 'CAÇADOR'}</Text>
            <RankBadge rank={rank} />
          </View>
        </View>

        {/* Card de Level */}
        <SystemPanel style={{ marginBottom: 18 }}>
          <PanelHeader title="Level & Experiência" />

          <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 16 }}>
            <View>
              <Text style={{ color: SL.muted, fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 2 }}>Nível Atual</Text>
              <Text style={{ color: SL.white, fontWeight: '900', fontSize: 60, fontFamily: 'monospace', lineHeight: 66 }}>
                {stats.level}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end', marginBottom: 8 }}>
              <Text style={{ color: SL.muted, fontSize: 10, letterSpacing: 2 }}>EXPERIÊNCIA</Text>
              <Text style={{ color: SL.cyan, fontWeight: '700', fontFamily: 'monospace', fontSize: 18 }}>
                {stats.exp}
              </Text>
              <View style={{ width: 80, height: 1, backgroundColor: SL.dim, marginVertical: 4 }} />
              <Text style={{ color: SL.muted, fontFamily: 'monospace', fontSize: 14 }}>
                {stats.maxExp}
              </Text>
            </View>
          </View>

          <SystemProgressBar progress={progressPercent} color={SL.cyan} height={8} label="Progresso para próximo nível" />
        </SystemPanel>

        {/* Alerta de pontos */}
        {stats.availablePoints > 0 && (
          <View style={{
            backgroundColor: `${SL.gold}12`, borderWidth: 1, borderColor: `${SL.gold}55`,
            borderRadius: 3, padding: 14, marginBottom: 18, flexDirection: 'row', alignItems: 'center', gap: 10,
          }}>
            <Text style={{ color: SL.gold, fontSize: 20 }}>⚡</Text>
            <View>
              <Text style={{ color: SL.gold, fontWeight: '800', fontSize: 13, letterSpacing: 1 }}>PONTOS DISPONÍVEIS</Text>
              <Text style={{ color: SL.muted, fontSize: 12 }}>Você tem {stats.availablePoints} ponto{stats.availablePoints > 1 ? 's' : ''} para distribuir.</Text>
            </View>
          </View>
        )}

        {/* Atributos */}
        <SystemPanel>
          <PanelHeader title="Atributos do Caçador" subtitle={`Total de pontos disponíveis: ${stats.availablePoints}`} />
          <StatRow
            label="Força" abbr="STR" value={stats.strength}
            onAdd={() => allocatePoint('strength')} canAdd={stats.availablePoints > 0}
            color={SL.red} icon="⚔️"
            description="Aumenta metas de flexões"
          />
          <StatRow
            label="Agilidade" abbr="AGI" value={stats.agility}
            onAdd={() => allocatePoint('agility')} canAdd={stats.availablePoints > 0}
            color={SL.green} icon="🌀"
            description="Aumenta metas de corrida"
          />
          <StatRow
            label="Vitalidade" abbr="VIT" value={stats.vitality}
            onAdd={() => allocatePoint('vitality')} canAdd={stats.availablePoints > 0}
            color="#3b82f6" icon="🛡️"
            description="Aumenta metas de abdominais e prancha"
          />
          <StatRow
            label="Inteligência" abbr="INT" value={stats.intelligence || 0}
            onAdd={() => allocatePoint('intelligence')} canAdd={stats.availablePoints > 0}
            color="#a855f7" icon="🧠"
            description="Necessário para equipar habilidades mentais"
          />
        </SystemPanel>

        {/* Conquistas (Achievements) */}
        {dbAchievements.length > 0 && (
          <SystemPanel style={{ marginTop: 18 }}>
            <PanelHeader title="Galeria de Conquistas" subtitle="Títulos desbloqueados no Sistema" />
            <View style={{ gap: 12 }}>
              {dbAchievements.map((ach) => {
                const isUnlocked = unlockedAchievements.includes(ach.id);
                return (
                  <View key={ach.id} style={{
                    flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14,
                    backgroundColor: isUnlocked ? 'rgba(0,255,136,0.05)' : SL.bgInner,
                    borderWidth: 1, borderColor: isUnlocked ? `${SL.green}44` : SL.dim,
                    borderRadius: 3, opacity: isUnlocked ? 1 : 0.5
                  }}>
                    <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: isUnlocked ? `${SL.green}20` : '#0d1a2a', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: isUnlocked ? SL.green : SL.dim }}>
                      <Text style={{ fontSize: 20 }}>{isUnlocked ? ach.icon : '🔒'}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: isUnlocked ? SL.green : SL.muted, fontWeight: '800', fontSize: 14 }}>{ach.title}</Text>
                      <Text style={{ color: isUnlocked ? SL.white : SL.dim, fontSize: 12, marginTop: 2 }}>{ach.description}</Text>
                    </View>
                    {isUnlocked && (
                      <View style={{ backgroundColor: `${SL.green}20`, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 2 }}>
                        <Text style={{ color: SL.green, fontSize: 10, fontWeight: '700' }}>+{ach.reward_exp} EXP</Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          </SystemPanel>
        )}

          </SystemStaggerGroup>
        </ScrollView>
      </SafeAreaView>
    </SystemScreenWrapper>
  );
}
