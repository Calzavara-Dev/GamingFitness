import { View, ScrollView, Animated, TouchableOpacity, Easing, Switch, Image } from 'react-native';
import { SystemText as Text } from '../../components/SystemText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSystemStore, getHunterRank, AthleteProfile } from '../../store/useSystemStore';
import { supabase } from '../../services/supabase';
import { useEffect, useRef, useState } from 'react';
import * as AuthSession from 'expo-auth-session';
import * as ImagePicker from 'expo-image-picker';
import { STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET, stravaDiscovery } from '../../services/stravaApi';
import { SL, SystemPanel, PanelHeader, SystemButton, SystemScreenWrapper, SystemStaggerGroup } from '../../components/SystemUI';

const AVATARS = {
  male_skinny: require('../../../assets/images/avatars/avatar_male_skinny.jpg'),
  male_fat: require('../../../assets/images/avatars/avatar_male_fat.jpg'),
  male_beginner: require('../../../assets/images/avatars/avatar_male_beginner.jpg'),
  male_athlete: require('../../../assets/images/avatars/avatar_male_athlete.jpg'),
  female_skinny: require('../../../assets/images/avatars/avatar_female_skinny.jpg'),
  female_fat: require('../../../assets/images/avatars/avatar_female_fat.jpg'),
  female_beginner: require('../../../assets/images/avatars/avatar_female_beginner.jpg'),
  female_athlete: require('../../../assets/images/avatars/avatar_female_athlete.jpg'),
};

const getAvatarImage = (profile: AthleteProfile | null) => {
  if (!profile) return AVATARS.male_beginner;
  
  const isFemale = profile.gender === 'Feminino';
  if (profile.fitnessLevel === 'Atleta' || profile.fitnessLevel === 'Intermediário') {
    return isFemale ? AVATARS.female_athlete : AVATARS.male_athlete;
  }
  
  const heightM = profile.height / 100;
  const imc = profile.weight / (heightM * heightM);
  
  if (imc >= 25) {
    return isFemale ? AVATARS.female_fat : AVATARS.male_fat;
  } else if (imc < 18.5) {
    return isFemale ? AVATARS.female_skinny : AVATARS.male_skinny;
  }
  
  return isFemale ? AVATARS.female_beginner : AVATARS.male_beginner;
};

import { useRouter } from 'expo-router';

export default function SettingsScreen() {
  const router = useRouter();
  const { stats, stravaToken, setStravaToken, resetOnboarding, profile, setCustomAvatar, config, toggleSound, toggleNotifications } = useSystemStore();

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    { 
      clientId: STRAVA_CLIENT_ID, 
      scopes: ['read', 'activity:read_all'], 
      redirectUri: AuthSession.makeRedirectUri({ scheme: 'gamingfitness', path: 'settings' }) 
    },
    stravaDiscovery
  );

  useEffect(() => {
    if (response?.type === 'success') {
      const { code } = response.params;
      fetch(stravaDiscovery.tokenEndpoint, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_id: STRAVA_CLIENT_ID, client_secret: STRAVA_CLIENT_SECRET, code, grant_type: 'authorization_code' })
      }).then(r => r.json()).then(d => { if (d.access_token) setStravaToken(d.access_token); });
    }
  }, [response]);

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setCustomAvatar(result.assets[0].uri);
    }
  };

  return (
    <SystemScreenWrapper>
      <SafeAreaView style={{ flex: 1, backgroundColor: SL.bg }}>
        <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingTop: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          <SystemStaggerGroup staggerDelay={120}>
          
          <View style={{ marginBottom: 24 }}>
            <Text style={{ color: SL.dim, fontSize: 10, letterSpacing: 5, fontWeight: '800', marginBottom: 4 }}>
              ══ ADMINISTRAÇÃO ══
            </Text>
            <Text style={{ color: SL.white, fontSize: 24, fontWeight: '900', letterSpacing: 1 }}>
              CONFIGURAÇÕES DO SISTEMA
            </Text>
          </View>

          {/* Dados do Usuário */}
          <SystemPanel style={{ marginBottom: 20 }}>
            <PanelHeader title="Perfil do Caçador" />
            
            {stats && (
              <View style={{ marginBottom: 16 }}>
                
                {/* Avatar Display */}
                <View style={{ alignItems: 'center', marginBottom: 20 }}>
                  <TouchableOpacity onPress={pickImage} activeOpacity={0.8} style={{ width: 100, height: 100, borderRadius: 50, borderWidth: 2, borderColor: SL.cyan, overflow: 'hidden', shadowColor: SL.cyanGlow, shadowOpacity: 1, shadowRadius: 10, marginBottom: 10, backgroundColor: SL.bgInner }}>
                    <Image 
                      source={
                        profile?.customAvatarUri 
                          ? { uri: profile.customAvatarUri } 
                          : getAvatarImage(profile)
                      } 
                      style={{ width: '100%', height: '100%' }} 
                    />
                  </TouchableOpacity>
                  <Text style={{ color: SL.cyan, fontSize: 10, letterSpacing: 3, fontWeight: '800', marginBottom: 4 }}>
                    CAÇADOR IDENTIFICADO: {profile?.name?.toUpperCase() || 'DESCONHECIDO'}
                  </Text>
                  <Text style={{ color: SL.muted, fontSize: 10, fontStyle: 'italic' }}>Tocar na foto para alterar</Text>
                </View>

                <Text style={{ color: SL.muted, fontSize: 11, letterSpacing: 2, marginBottom: 4 }}>RANK ATUAL</Text>
                <View style={{ backgroundColor: SL.bgInner, padding: 12, borderRadius: 3, borderWidth: 1, borderColor: SL.dim, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ color: SL.white, fontSize: 16, fontWeight: '700' }}>Rank {getHunterRank(stats.level)} <Text style={{ color: SL.muted, fontSize: 14 }}>(Nv {stats.level})</Text></Text>
                  <Text style={{ color: SL.dim, fontSize: 12, fontStyle: 'italic' }}>Ativo</Text>
                </View>
              </View>
            )}

            <Text style={{ color: SL.muted, fontSize: 11, letterSpacing: 2, marginBottom: 4 }}>ANÁLISE BIOMÉTRICA (ESTÁTICA)</Text>
            <View style={{ backgroundColor: SL.bgInner, padding: 12, borderRadius: 3, borderWidth: 1, borderColor: SL.dim }}>
              <Text style={{ color: SL.muted, fontSize: 13, fontStyle: 'italic', marginBottom: 12 }}>
                O recálculo de status biométrico só pode ser feito via Re-Despertar (Nova Conta).
              </Text>
              
              <Text style={{ color: SL.cyan, fontSize: 12, fontFamily: 'monospace', marginBottom: 4 }}>{'>>'} Classe: {useSystemStore.getState().profile?.fitnessLevel || 'N/A'}</Text>
              <Text style={{ color: SL.cyan, fontSize: 12, fontFamily: 'monospace', marginBottom: 4 }}>{'>>'} Objetivo: {useSystemStore.getState().profile?.primaryGoal || 'N/A'}</Text>
              <Text style={{ color: SL.cyan, fontSize: 12, fontFamily: 'monospace', marginBottom: 4 }}>{'>>'} Limite Diário: {useSystemStore.getState().profile?.availableTime || 'N/A'}</Text>
              
              <View style={{ height: 1, backgroundColor: SL.dim, marginVertical: 8 }} />
              
              <Text style={{ color: SL.muted, fontSize: 12, fontFamily: 'monospace' }}>Peso: {useSystemStore.getState().profile?.weight}kg  |  Altura: {useSystemStore.getState().profile?.height}cm</Text>
              <Text style={{ color: SL.red, fontSize: 12, fontFamily: 'monospace', marginTop: 4 }}>
                Restrições: {
                  [
                    useSystemStore.getState().profile?.injuries?.knee && 'Joelho',
                    useSystemStore.getState().profile?.injuries?.shoulder && 'Ombro/Pulso',
                    useSystemStore.getState().profile?.injuries?.lowerBack && 'Lombar'
                  ].filter(Boolean).join(', ') || 'Nenhuma'
                }
              </Text>
            </View>

            <View style={{ marginTop: 14 }}>
              <SystemButton
                label="RANKING GLOBAL"
                // @ts-ignore
                onPress={() => router.push('/(app)/leaderboard')}
                color={SL.cyan}
              />
              <View style={{ height: 12 }} />
              <SystemButton
                label="REFAZER ANÁLISE BIOMÉTRICA"
                onPress={resetOnboarding}
                color={SL.cyan}
                variant="outline"
              />
            </View>
          </SystemPanel>

          {/* Preferências do Sistema */}
          <SystemPanel style={{ marginBottom: 18 }}>
            <PanelHeader title="Controle de Áudio" icon="🔉" />
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <View>
                <Text style={{ color: SL.white, fontSize: 16, fontWeight: 'bold' }}>Efeitos Sonoros</Text>
                <Text style={{ color: SL.muted, fontSize: 12 }}>Ativar áudios do Sistema</Text>
              </View>
              <Switch 
                value={config?.soundEnabled ?? true} 
                onValueChange={toggleSound} 
                trackColor={{ false: SL.dim, true: SL.cyan }}
                thumbColor={SL.white}
              />
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <Text style={{ color: SL.white, fontSize: 16, fontWeight: 'bold' }}>Notificações Push</Text>
                <Text style={{ color: SL.muted, fontSize: 12 }}>Avisos da Penalty Zone</Text>
              </View>
              <Switch 
                value={config?.notificationsEnabled ?? true} 
                onValueChange={toggleNotifications} 
                trackColor={{ false: SL.dim, true: SL.cyan }}
                thumbColor={SL.white}
              />
            </View>
          </SystemPanel>

          {/* Conexões (Strava & Google Fit) */}
          <SystemPanel style={{ marginBottom: 20 }}>
            <PanelHeader title="Sincronização Externa" subtitle="Sensores de Rastreamento" />
            
            {/* Strava */}
            <View style={{ marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: SL.dim }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <Text style={{ fontSize: 20 }}>🚴</Text>
                  <View>
                    <Text style={{ color: '#fc4c02', fontWeight: '900', fontSize: 16, letterSpacing: 1 }}>STRAVA</Text>
                    <Text style={{ color: SL.muted, fontSize: 12 }}>Rastreamento de Corrida</Text>
                  </View>
                </View>
                <View style={{ paddingHorizontal: 10, paddingVertical: 4, backgroundColor: stravaToken ? 'rgba(0,255,136,0.1)' : SL.bgInner, borderWidth: 1, borderColor: stravaToken ? SL.green : SL.dim, borderRadius: 3 }}>
                  <Text style={{ color: stravaToken ? SL.green : SL.muted, fontSize: 10, fontWeight: '800' }}>
                    {stravaToken ? 'CONECTADO' : 'DESCONECTADO'}
                  </Text>
                </View>
              </View>
              
              {!stravaToken ? (
                <TouchableOpacity
                  onPress={() => promptAsync()}
                  disabled={!request}
                  style={{ backgroundColor: 'rgba(252,76,2,0.15)', borderWidth: 1, borderColor: '#fc4c0266', borderRadius: 3, paddingVertical: 12, alignItems: 'center' }}
                >
                  <Text style={{ color: '#fc4c02', fontWeight: '800', fontSize: 12, letterSpacing: 2 }}>VINCULAR CONTA STRAVA</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={() => setStravaToken('')}
                  style={{ backgroundColor: SL.bgInner, borderWidth: 1, borderColor: SL.dim, borderRadius: 3, paddingVertical: 12, alignItems: 'center' }}
                >
                  <Text style={{ color: SL.muted, fontWeight: '800', fontSize: 12, letterSpacing: 2 }}>DESVINCULAR</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Google Fit */}
            <View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <Text style={{ fontSize: 20 }}>👟</Text>
                  <View>
                    <Text style={{ color: '#4285F4', fontWeight: '900', fontSize: 16, letterSpacing: 1 }}>GOOGLE FIT</Text>
                    <Text style={{ color: SL.muted, fontSize: 12 }}>Rastreamento de Passos (Em breve)</Text>
                  </View>
                </View>
                <View style={{ paddingHorizontal: 10, paddingVertical: 4, backgroundColor: SL.bgInner, borderWidth: 1, borderColor: SL.dim, borderRadius: 3 }}>
                  <Text style={{ color: SL.muted, fontSize: 10, fontWeight: '800' }}>DESCONECTADO</Text>
                </View>
              </View>
              
              <TouchableOpacity
                disabled={true}
                style={{ backgroundColor: SL.bgInner, borderWidth: 1, borderColor: SL.dim, borderRadius: 3, paddingVertical: 12, alignItems: 'center', opacity: 0.5 }}
              >
                <Text style={{ color: SL.muted, fontWeight: '800', fontSize: 12, letterSpacing: 2 }}>INTEGRAÇÃO INDISPONÍVEL</Text>
              </TouchableOpacity>
            </View>
          </SystemPanel>

          {/* Danger Zone */}
          <SystemPanel color={SL.red} glow={SL.redGlow}>
            <PanelHeader title="Zona de Perigo" color={SL.red} />
            <Text style={{ color: SL.muted, fontSize: 12, marginBottom: 16, lineHeight: 18 }}>
              Sair do Sistema fará com que você perca o acompanhamento em tempo real das suas missões diárias.
            </Text>
            <SystemButton
              label="REINICIAR MISSÕES DE HOJE (DEV)"
              onPress={() => useSystemStore.getState().generateDailyQuest()}
              color={SL.cyan}
              variant="outline"
            />
            <View style={{ height: 12 }} />
            <SystemButton
              label="DESCONECTAR DO SISTEMA"
              onPress={handleLogout}
              color={SL.red}
              variant="outline"
            />
          </SystemPanel>

          {/* Footer */}
          <View style={{ alignItems: 'center', marginTop: 10, marginBottom: 20 }}>
            <Text style={{ color: SL.dim, fontSize: 10, letterSpacing: 1 }}>
              © Todos os direitos reservados para 3SG-CI Calzavara
            </Text>
          </View>

          </SystemStaggerGroup>
        </ScrollView>
      </SafeAreaView>
    </SystemScreenWrapper>
  );
}
