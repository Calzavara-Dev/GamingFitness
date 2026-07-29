import { View, TouchableOpacity, ScrollView, Animated, Easing } from 'react-native';
import { SystemText as Text } from '../../components/SystemText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSystemStore } from '../../store/useSystemStore';
import { useEffect, useRef } from 'react';
import { SL, SystemPanel, PanelHeader, SystemButton, SystemAlert, SystemScreenWrapper, SystemStaggerGroup } from '../../components/SystemUI';

export default function SkillsScreen() {
  const { stats, equipSkill, equippedSkillId, equippedSkillStreak, dbSkills } = useSystemStore();

  const equippedSkill = dbSkills.find(s => s.id === equippedSkillId);

  return (
    <SystemScreenWrapper>
      <SafeAreaView style={{ flex: 1, backgroundColor: SL.bg }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          <SystemStaggerGroup staggerDelay={90}>
            <View style={{ paddingHorizontal: 18, paddingTop: 16 }}>
              <Text style={{ color: SL.purple, fontSize: 10, letterSpacing: 5, fontWeight: '800', marginBottom: 4 }}>
                ══ BANCO DE DADOS ══
              </Text>
              <Text style={{ color: SL.white, fontSize: 24, fontWeight: '900', letterSpacing: 1, marginBottom: 6 }}>
                ENCICLOPÉDIA DE SKILLS
              </Text>
              <Text style={{ color: SL.muted, fontSize: 12, marginBottom: 20 }}>
                Habilidades especiais desbloqueadas através de batalhas e treinamento.
              </Text>
            </View>

          {/* Skill equipada */}
          {equippedSkill && (
            <SystemPanel color={SL.purple} style={{ marginBottom: 20 }}>
              <PanelHeader title="Habilidade Ativa" subtitle="Equipada na missão diária" color={SL.purple} />
              <Text style={{ color: SL.white, fontSize: 20, fontWeight: '900', marginBottom: 10 }}>
                {equippedSkill.epic_name}
              </Text>

              {/* Barra de streak visual com 7 pontos */}
              <View style={{ marginBottom: 8 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                  <Text style={{ color: SL.muted, fontSize: 11, letterSpacing: 2 }}>SEQUÊNCIA DE CONQUISTA</Text>
                  <Text style={{ color: SL.gold, fontWeight: '700', fontFamily: 'monospace' }}>
                    {equippedSkillStreak} / 7 dias
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 5 }}>
                  {Array.from({ length: 7 }).map((_, i) => (
                    <View key={i} style={{
                      flex: 1, height: 8, borderRadius: 1,
                      backgroundColor: i < equippedSkillStreak ? SL.gold : SL.bgInner,
                      borderWidth: 1, borderColor: i < equippedSkillStreak ? `${SL.gold}88` : SL.dim,
                      shadowColor: SL.gold, shadowOpacity: i < equippedSkillStreak ? 0.8 : 0, shadowRadius: 6,
                    }} />
                  ))}
                </View>
              </View>

              {equippedSkillStreak < 7 && (
                <Text style={{ color: SL.muted, fontSize: 11, marginTop: 4 }}>
                  Complete {7 - equippedSkillStreak} dia{7 - equippedSkillStreak > 1 ? 's' : ''} mais para desbloquear troca de habilidade.
                </Text>
              )}
            </SystemPanel>
          )}
          {/* Lista de Skills */}
          <View style={{ paddingHorizontal: 18 }}>
          {dbSkills.map((skill, index) => {
            const isUnlocked = stats.level >= skill.required_level;
            const isEquipped = equippedSkillId === skill.id;
            return (
              <SkillCard
                key={skill.id}
                skill={skill}
                isUnlocked={isUnlocked}
                isEquipped={isEquipped}
                onEquip={() => equipSkill(skill.id)}
                index={index}
              />
            );
            })}
          </View>
        </SystemStaggerGroup>
      </ScrollView>
    </SafeAreaView>
  </SystemScreenWrapper>
  );
}

function SkillCard({ skill, isUnlocked, isEquipped, onEquip }: any) {
  const borderColor = isEquipped ? `${SL.purple}88` : isUnlocked ? `${SL.cyan}30` : SL.dim;
  const bgColor = isEquipped ? `rgba(139,92,246,0.08)` : isUnlocked ? SL.bgPanel : SL.bgInner;

  return (
    <View style={{ marginBottom: 12 }}>
      <View style={{ backgroundColor: bgColor, borderWidth: 1, borderColor, borderRadius: 3, padding: 16 }}>

        {/* Badge de status */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
          <Text style={{ color: isEquipped ? SL.purple : isUnlocked ? SL.cyan : SL.dim, fontWeight: '900', fontSize: 16, flex: 1, marginRight: 10 }}>
            {isUnlocked ? skill.epic_name : '???'}
          </Text>
          <View>
            {isEquipped ? (
              <View style={{ backgroundColor: `${SL.purple}30`, borderRadius: 2, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: `${SL.purple}66` }}>
                <Text style={{ color: SL.purple, fontSize: 10, fontWeight: '800', letterSpacing: 2 }}>ATIVA</Text>
              </View>
            ) : !isUnlocked ? (
              <View style={{ backgroundColor: SL.bgInner, borderRadius: 2, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: SL.dim }}>
                <Text style={{ color: SL.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1 }}>🔒 Lv.{skill.required_level}</Text>
              </View>
            ) : null}
          </View>
        </View>

        {isUnlocked ? (
          <>
            <View style={{ height: 1, backgroundColor: `${SL.cyan}20`, marginBottom: 10 }} />
            <Text style={{ color: SL.muted, fontSize: 12, marginBottom: 4 }}>
              Exercício: <Text style={{ color: SL.white }}>{skill.real_name}</Text>
            </Text>
            <Text style={{ color: SL.muted, fontSize: 13, lineHeight: 20, marginBottom: 14 }}>
              {skill.description}
            </Text>
            <SystemButton
              label={isEquipped ? '✓ Habilidade Equipada' : 'Equipar Habilidade'}
              onPress={onEquip}
              disabled={isEquipped}
              color={isEquipped ? SL.purple : SL.cyan}
            />
          </>
        ) : (
          <Text style={{ color: SL.dim, fontSize: 12, fontStyle: 'italic' }}>
            Alcance o Nível {skill.required_level} para revelar esta habilidade.
          </Text>
        )}
      </View>
    </View>
  );
}
