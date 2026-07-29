import React, { useEffect, useState, useRef } from 'react';
import { View, ScrollView, Animated, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { SystemText as Text } from '../../components/SystemText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SL, SystemScreenWrapper, SystemStaggerGroup, PanelHeader } from '../../components/SystemUI';
import { supabase } from '../../services/supabase';
import { useRouter } from 'expo-router';

interface LeaderboardEntry {
  player_id: string;
  player_name: string;
  avatar_uri: string | null;
  fitness_level: string;
  level: number;
  exp: number;
}

export default function LeaderboardScreen() {
  const [ranking, setRanking] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchRanking() {
      try {
        const { data, error } = await supabase
          .from('global_ranking')
          .select('*')
          .limit(50);
          
        if (error) throw error;
        setRanking(data || []);
      } catch (err) {
        console.warn('Leaderboard fetch error, fallback to empty', err);
      } finally {
        setLoading(false);
      }
    }
    fetchRanking();
  }, []);

  const renderTop3 = () => {
    if (ranking.length < 3) return null;
    const top1 = ranking[0];
    const top2 = ranking[1];
    const top3 = ranking[2];

    const getAvatar = (uri: string | null) => uri ? { uri } : require('../../../assets/images/avatars/avatar_male_beginner.jpg');

    return (
      <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'flex-end', marginTop: 30, marginBottom: 40, height: 160 }}>
        
        {/* RANK 2 */}
        <View style={{ alignItems: 'center', opacity: 0.9 }}>
          <Text style={{ fontSize: 24, marginBottom: 4 }}>🥈</Text>
          <View style={{ width: 70, height: 70, borderRadius: 35, borderWidth: 2, borderColor: '#C0C0C0', overflow: 'hidden', marginBottom: 8 }}>
            <Image source={getAvatar(top2.avatar_uri)} style={{ width: '100%', height: '100%' }} />
          </View>
          <Text style={{ color: SL.white, fontSize: 14, fontWeight: '700', letterSpacing: 1 }} numberOfLines={1}>{top2.player_name.split(' ')[0]}</Text>
          <Text style={{ color: '#C0C0C0', fontSize: 12, fontWeight: '900' }}>Nv {top2.level}</Text>
        </View>

        {/* RANK 1 */}
        <View style={{ alignItems: 'center', zIndex: 10, transform: [{ translateY: -20 }] }}>
          <Text style={{ fontSize: 32, marginBottom: 4, textShadowColor: '#FFD700', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 10 }}>👑</Text>
          <View style={{ width: 90, height: 90, borderRadius: 45, borderWidth: 3, borderColor: '#FFD700', overflow: 'hidden', marginBottom: 8, shadowColor: '#FFD700', shadowOpacity: 0.8, shadowRadius: 15 }}>
            <Image source={getAvatar(top1.avatar_uri)} style={{ width: '100%', height: '100%' }} />
          </View>
          <Text style={{ color: '#FFD700', fontSize: 16, fontWeight: '900', letterSpacing: 1 }} numberOfLines={1}>{top1.player_name.split(' ')[0]}</Text>
          <Text style={{ color: '#FFD700', fontSize: 14, fontWeight: '900' }}>Nv {top1.level}</Text>
        </View>

        {/* RANK 3 */}
        <View style={{ alignItems: 'center', opacity: 0.8 }}>
          <Text style={{ fontSize: 24, marginBottom: 4 }}>🥉</Text>
          <View style={{ width: 70, height: 70, borderRadius: 35, borderWidth: 2, borderColor: '#CD7F32', overflow: 'hidden', marginBottom: 8 }}>
            <Image source={getAvatar(top3.avatar_uri)} style={{ width: '100%', height: '100%' }} />
          </View>
          <Text style={{ color: SL.white, fontSize: 14, fontWeight: '700', letterSpacing: 1 }} numberOfLines={1}>{top3.player_name.split(' ')[0]}</Text>
          <Text style={{ color: '#CD7F32', fontSize: 12, fontWeight: '900' }}>Nv {top3.level}</Text>
        </View>

      </View>
    );
  };

  return (
    <SystemScreenWrapper>
      <SafeAreaView style={{ flex: 1, backgroundColor: SL.bg }}>
        
        {/* Header Customizado */}
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingTop: 16, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: SL.dim }}>
          <TouchableOpacity onPress={() => router.back()} style={{ padding: 10, marginLeft: -10 }}>
            <Text style={{ color: SL.cyan, fontSize: 20 }}>{'<'}</Text>
          </TouchableOpacity>
          <View style={{ flex: 1, alignItems: 'center', paddingRight: 20 }}>
            <Text style={{ color: SL.dim, fontSize: 10, letterSpacing: 5, fontWeight: '800' }}>RANKING GLOBAL</Text>
            <Text style={{ color: SL.white, fontSize: 18, fontWeight: '900', letterSpacing: 2 }}>TOP CAÇADORES</Text>
          </View>
        </View>

        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator color={SL.cyan} size="large" />
            <Text style={{ color: SL.cyan, marginTop: 16, letterSpacing: 2 }}>Sincronizando Banco de Dados...</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
            {ranking.length === 0 ? (
              <View style={{ padding: 40, alignItems: 'center' }}>
                <Text style={{ color: SL.red, textAlign: 'center', fontSize: 12 }}>Acesso ao Leaderboard Negado ou View 'global_ranking' não foi criada no banco de dados.</Text>
              </View>
            ) : (
              <SystemStaggerGroup staggerDelay={80}>
                {renderTop3()}

                <View style={{ backgroundColor: SL.bgInner, borderRadius: 5, borderWidth: 1, borderColor: SL.dim, overflow: 'hidden' }}>
                  {ranking.slice(3).map((player, index) => (
                    <View key={player.player_id} style={{ flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(0, 255, 255, 0.05)' }}>
                      <Text style={{ color: SL.muted, fontSize: 14, fontWeight: '800', width: 30 }}>#{index + 4}</Text>
                      <View style={{ width: 40, height: 40, borderRadius: 20, overflow: 'hidden', marginRight: 12, borderWidth: 1, borderColor: SL.dim }}>
                        <Image source={player.avatar_uri ? { uri: player.avatar_uri } : require('../../../assets/images/avatars/avatar_male_beginner.jpg')} style={{ width: '100%', height: '100%' }} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: SL.white, fontSize: 16, fontWeight: '800' }} numberOfLines={1}>{player.player_name}</Text>
                        <Text style={{ color: SL.muted, fontSize: 10, letterSpacing: 1 }}>{player.fitness_level.toUpperCase()}</Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={{ color: SL.cyan, fontSize: 16, fontWeight: '900' }}>Nv {player.level}</Text>
                        <Text style={{ color: SL.dim, fontSize: 10 }}>{player.exp} XP</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </SystemStaggerGroup>
            )}
          </ScrollView>
        )}
      </SafeAreaView>
    </SystemScreenWrapper>
  );
}
