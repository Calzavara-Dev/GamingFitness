import { View, TouchableOpacity, ScrollView, Animated, Easing, Alert, Image } from 'react-native';
import { SystemText as Text } from '../../components/SystemText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSystemStore } from '../../store/useSystemStore';
import { useEffect, useRef } from 'react';
import { SL, SystemPanel, PanelHeader, SystemButton, SystemScreenWrapper, SystemStaggerGroup } from '../../components/SystemUI';

export default function ShopScreen() {
  const { stats, dbShopItems, buyAndUseItem, equippedSkillId } = useSystemStore();

  const getItemImage = (id: string) => {
    switch (id) {
      case 'i1': return require('../../../assets/images/shop_potion.jpg');
      case 'i2': return require('../../../assets/images/shop_scroll.jpg');
      case 'stone_s1': 
      case 'stone_s5': return require('../../../assets/images/shop_stone_red.jpg');
      case 'stone_s2': 
      case 'stone_s4': return require('../../../assets/images/shop_stone_blue.jpg');
      case 'stone_s3': return require('../../../assets/images/shop_stone_green.jpg');
      default: return null;
    }
  };



  const handleBuy = (item: any) => {
    Alert.alert(
      "Confirmar Compra",
      `Deseja gastar ${item.cost} Gold para adquirir [${item.name}]?`,
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Comprar", 
          onPress: () => {
            const success = buyAndUseItem(item.id, item.cost);
            if (success) {
              Alert.alert("Sistema", "Item adquirido e consumido com sucesso.");
            } else {
              Alert.alert("Erro", "Gold insuficiente.");
            }
          }
        }
      ]
    );
  };

  return (
    <SystemScreenWrapper>
      <SafeAreaView style={{ flex: 1, backgroundColor: SL.bg }}>
        <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          <SystemStaggerGroup staggerDelay={100}>
            {/* Header */}
            <View style={{ paddingTop: 16, marginBottom: 20 }}>
              <Text style={{ color: SL.gold, fontSize: 10, letterSpacing: 5, fontWeight: '800', marginBottom: 4 }}>
                ══ LOJA DO SISTEMA ══
              </Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: SL.white, fontSize: 24, fontWeight: '900', letterSpacing: 1 }}>
                  MERCADO
                </Text>
                
                <View style={{ backgroundColor: `${SL.gold}20`, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 3, borderWidth: 1, borderColor: `${SL.gold}66`, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={{ fontSize: 16 }}>💰</Text>
                  <Text style={{ color: SL.gold, fontWeight: '900', fontFamily: 'monospace', fontSize: 16 }}>
                    {stats.gold || 0}
                  </Text>
                </View>
              </View>
              <Text style={{ color: SL.muted, fontSize: 12, marginTop: 6 }}>
                Troque suas riquezas por facilidades e cura.
              </Text>
            </View>
          {dbShopItems.length === 0 ? (
            <Text style={{ color: SL.muted, textAlign: 'center', marginTop: 40 }}>A loja está vazia ou carregando...</Text>
          ) : (
            dbShopItems.map((item, index) => {
              const isStone = item.id.startsWith('stone_');
              const isBlockedStone = isStone && equippedSkillId !== null;
              const canAfford = (stats.gold || 0) >= item.cost;
              
              let buttonLabel = 'COMPRAR & USAR';
              let buttonDisabled = false;
              let btnColor = SL.gold;
              
              if (isBlockedStone) {
                buttonLabel = 'PEDRA EM USO';
                buttonDisabled = true;
                btnColor = SL.dim;
              } else if (!canAfford) {
                buttonLabel = 'GOLD INSUFICIENTE';
                buttonDisabled = true;
                btnColor = SL.dim;
              }

              return (
                <View key={item.id} style={{
                  backgroundColor: SL.bgInner,
                  borderWidth: 1,
                  borderColor: canAfford && !isBlockedStone ? `${SL.gold}44` : SL.dim,
                  borderRadius: 3,
                  padding: 16,
                  marginBottom: 14
                }}>
                  <View style={{ flexDirection: 'row', gap: 14, alignItems: 'center', marginBottom: 12 }}>
                    <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: `${SL.gold}10`, borderWidth: 1, borderColor: canAfford && !isBlockedStone ? SL.gold : SL.dim, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                      {getItemImage(item.id) ? (
                        <Image source={getItemImage(item.id)} style={{ width: 60, height: 60 }} />
                      ) : (
                        <Text style={{ fontSize: 24 }}>{item.icon}</Text>
                      )}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: SL.white, fontWeight: '900', fontSize: 16 }}>{item.name}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
                        <Text style={{ fontSize: 12 }}>💰</Text>
                        <Text style={{ color: canAfford && !isBlockedStone ? SL.gold : SL.red, fontFamily: 'monospace', fontWeight: '700', fontSize: 14 }}>
                          {item.cost}
                        </Text>
                      </View>
                    </View>
                  </View>
                  
                  <Text style={{ color: SL.muted, fontSize: 13, lineHeight: 20, marginBottom: 16 }}>
                    {item.description}
                  </Text>
                  
                  <SystemButton 
                    label={buttonLabel}
                    color={btnColor}
                    disabled={buttonDisabled}
                    onPress={() => handleBuy(item)}
                  />
                </View>
              );
            })
          )}
          </SystemStaggerGroup>
        </ScrollView>
      </SafeAreaView>
    </SystemScreenWrapper>
  );
}
