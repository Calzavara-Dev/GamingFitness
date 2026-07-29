import { View, TouchableOpacity, Animated, Easing, Image } from 'react-native';
import { SystemText as Text } from '../../components/SystemText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSystemStore } from '../../store/useSystemStore';
import { useEffect, useRef, useState } from 'react';
import { SL, SystemPanel, PanelHeader, SystemButton, SystemScreenWrapper, SystemStaggerGroup } from '../../components/SystemUI';
import { checkStravaPenaltyWorkout } from '../../services/stravaApi';

export default function PenaltyScreen() {
  const { isPenaltyActive, penaltyDebt, payPenalty, stravaToken } = useSystemStore();
  const [isSyncing, setIsSyncing] = useState(false);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const flickerAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {

    if (isPenaltyActive) {
      // Pulso lento no título
      Animated.loop(Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.04, duration: 1200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])).start();

      // Flicker no fundo vermelho
      Animated.loop(Animated.sequence([
        Animated.timing(flickerAnim, { toValue: 0.85, duration: 80, useNativeDriver: true }),
        Animated.timing(flickerAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
        Animated.timing(flickerAnim, { toValue: 0.9, duration: 60, useNativeDriver: true }),
        Animated.timing(flickerAnim, { toValue: 1, duration: 3000, useNativeDriver: true }),
      ])).start();
    }
  }, [isPenaltyActive]);

  if (!isPenaltyActive) {
    return (
      <SystemScreenWrapper>
        <SafeAreaView style={{ flex: 1, backgroundColor: SL.bg }}>
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <SystemStaggerGroup staggerDelay={80}>
              <View style={{ alignItems: 'center', marginBottom: 32 }}>
                <Image source={require('../../../assets/images/icons/tab_penalty.jpg')} style={{ width: 80, height: 80, marginBottom: 16, opacity: 0.5 }} resizeMode="contain" />
                <Text style={{ color: SL.cyan, fontSize: 10, letterSpacing: 5, fontWeight: '800', marginBottom: 10 }}>
            ══ PENALTY ZONE ══
          </Text>
          <Text style={{ color: SL.white, fontSize: 26, fontWeight: '900', textAlign: 'center', marginBottom: 14 }}>
            Sem Punições Ativas
          </Text>
          <Text style={{ color: SL.muted, textAlign: 'center', lineHeight: 22, marginBottom: 32 }}>
            Você está em conformidade com o Sistema.{'\n'}Continue completando suas missões diárias, Caçador.
          </Text>
              </View>

            {penaltyDebt > 0 ? (
              <SystemPanel color={SL.gold} style={{ width: '100%' }}>
                <PanelHeader title="Dívida Histórica" color={SL.gold} />
                <Text style={{ color: SL.muted, fontSize: 12, marginBottom: 6 }}>Total acumulado de punições passadas:</Text>
                <Text style={{ color: SL.gold, fontSize: 40, fontWeight: '900', fontFamily: 'monospace', textAlign: 'center' }}>
                  R$ {penaltyDebt.toFixed(2)}
                </Text>
                <Text style={{ color: SL.muted, fontSize: 11, textAlign: 'center', marginTop: 8 }}>
                  Deposite este valor na sua poupança pessoal de punição.
                </Text>
              </SystemPanel>
            ) : <View />}
            </SystemStaggerGroup>
          </View>
        </SafeAreaView>
      </SystemScreenWrapper>
    );
  }

  const handleStravaSync = async () => {
    if (!stravaToken) {
      alert('Você precisa vincular o Strava nas Configurações primeiro!');
      return;
    }
    setIsSyncing(true);
    const hasWorkout = await checkStravaPenaltyWorkout(stravaToken);
    setIsSyncing(false);
    
    if (hasWorkout) {
      payPenalty();
      alert('Punição redimida com sucesso. Bem-vindo de volta ao Sistema.');
    } else {
      alert('Nenhuma atividade encontrada hoje no Strava. Complete seu HIIT primeiro.');
    }
  };

  return (
    <SystemScreenWrapper>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#080002' }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <SystemStaggerGroup staggerDelay={120}>

        {/* Título pulsante */}
        <Animated.View style={{ transform: [{ scale: pulseAnim }], alignItems: 'center', marginBottom: 32 }}>
          <Animated.View style={{ flexDirection: 'row', alignItems: 'center', opacity: flickerAnim, marginBottom: 12, gap: 10 }}>
            <Image source={require('../../../assets/images/icons/tab_penalty.jpg')} style={{ width: 16, height: 16 }} resizeMode="contain" />
            <Text style={{
              color: SL.red, fontSize: 11, letterSpacing: 6, fontWeight: '800',
            }}>
              PROTOCOLO DE PUNIÇÃO ATIVO
            </Text>
            <Image source={require('../../../assets/images/icons/tab_penalty.jpg')} style={{ width: 16, height: 16 }} resizeMode="contain" />
          </Animated.View>
          <Text style={{
            color: SL.red, fontSize: 54, fontWeight: '900', letterSpacing: 8,
            textAlign: 'center', lineHeight: 62,
            textShadowColor: SL.red, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 30,
          }}>
            PENALTY{'\n'}ZONE
          </Text>
        </Animated.View>

        {/* Card de dívida */}
        <View style={{
          width: '100%', backgroundColor: '#120004',
          borderWidth: 1, borderColor: `${SL.red}55`,
          borderRadius: 3, padding: 22, marginBottom: 20, alignItems: 'center',
          shadowColor: SL.red, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 20,
        }}>
          {/* Cantos vermelhos */}
          {['tl','tr','bl','br'].map(pos => (
            <View key={pos} style={{
              position: 'absolute', width: 12, height: 12,
              top: pos.startsWith('t') ? -1 : undefined,
              bottom: pos.startsWith('b') ? -1 : undefined,
              left: pos.endsWith('l') ? -1 : undefined,
              right: pos.endsWith('r') ? -1 : undefined,
              borderTopWidth: pos.startsWith('t') ? 2 : 0,
              borderBottomWidth: pos.startsWith('b') ? 2 : 0,
              borderLeftWidth: pos.endsWith('l') ? 2 : 0,
              borderRightWidth: pos.endsWith('r') ? 2 : 0,
              borderColor: SL.red,
            }} />
          ))}

          <Text style={{ color: SL.muted, fontSize: 11, letterSpacing: 3, marginBottom: 6 }}>DÍVIDA ACUMULADA AO SISTEMA</Text>
          <Text style={{
            color: SL.red, fontSize: 52, fontWeight: '900', fontFamily: 'monospace',
            textShadowColor: SL.red, textShadowRadius: 20,
          }}>
            R$ {penaltyDebt.toFixed(2)}
          </Text>
          <View style={{ width: '60%', height: 1, backgroundColor: `${SL.red}44`, marginVertical: 14 }} />
          <Text style={{ color: SL.muted, fontSize: 13, textAlign: 'center', lineHeight: 22 }}>
            Deposite este valor na sua poupança pessoal.{'\n'}O Sistema não esquece. O Sistema não perdoa.
          </Text>
        </View>

        {/* Card da missão HIIT */}
        <View style={{
          width: '100%', backgroundColor: `${SL.red}10`,
          borderWidth: 1, borderColor: `${SL.red}35`,
          borderRadius: 3, padding: 16, marginBottom: 24,
        }}>
          <Text style={{ color: SL.red, fontSize: 10, letterSpacing: 3, fontWeight: '800', marginBottom: 8 }}>
            MISSÃO DE SOBREVIVÊNCIA OBRIGATÓRIA
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <Image source={require('../../../assets/images/shop_stone_red.jpg')} style={{ width: 20, height: 20 }} resizeMode="contain" />
            <Text style={{ color: SL.white, fontSize: 18, fontWeight: '800' }}>Protocolo HIIT: A Zona da Morte</Text>
          </View>
          <Text style={{ color: SL.muted, fontSize: 13, lineHeight: 20, marginBottom: 12 }}>
            Para resgatar sua liberdade, você deve registrar uma atividade no Strava cumprindo as seguintes diretrizes:
          </Text>
          <Text style={{ color: SL.red, fontSize: 13, lineHeight: 20, fontWeight: 'bold' }}>
            1. Aqueça por 5 minutos.{'\n'}
            2. Corra 1 minuto em Esforço Máximo (Sprint).{'\n'}
            3. Caminhe 1 minuto para recuperação.{'\n'}
            4. Repita as etapas 2 e 3 por 10x.
          </Text>
        </View>

          <SystemButton
            label={isSyncing ? "PROCURANDO REGISTRO NO STRAVA..." : "SINCRONIZAR STRAVA (VALIDAR HIIT)"}
            onPress={handleStravaSync}
            color={SL.red}
            variant="solid"
          />
          </SystemStaggerGroup>
        </View>
      </SafeAreaView>
    </SystemScreenWrapper>
  );
}
