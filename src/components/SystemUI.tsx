/**
 * Sistema de Design inspirado no Solo Leveling
 * Painéis holográficos azul-ciano com bordas decoradas e glow neon
 */

import React, { useEffect, useRef, useCallback, useState } from 'react';
import { View, ViewStyle, TextStyle, TouchableOpacity, Animated, Easing } from 'react-native';
import { SystemText as Text } from './SystemText';
import { useFocusEffect } from 'expo-router';

// ─── CORES DO SISTEMA ─────────────────────────────────────────
export const SL = {
  bg:          '#00000f',     // fundo absoluto
  bgPanel:     '#020818',     // fundo dos painéis
  bgInner:     '#010610',     // fundo interno
  cyan:        '#00d4ff',     // azul primário
  cyanDim:     '#004a66',     // azul escuro
  cyanGlow:    'rgba(0,212,255,0.15)',
  purple:      '#8b5cf6',
  purpleGlow:  'rgba(139,92,246,0.15)',
  gold:        '#f59e0b',
  goldGlow:    'rgba(245,158,11,0.15)',
  red:         '#ff2244',
  redGlow:     'rgba(255,34,68,0.15)',
  green:       '#00ff88',
  white:       '#e2f0ff',
  dim:         '#2a4060',
  muted:       '#4a6a8a',
};

// ─── CANTOS DECORATIVOS SOLO LEVELING ─────────────────────────
function Corner({ pos }: { pos: 'tl' | 'tr' | 'bl' | 'br' }) {
  const style: ViewStyle = {
    position: 'absolute',
    width: 14,
    height: 14,
  };
  if (pos === 'tl') Object.assign(style, { top: -1, left: -1 });
  if (pos === 'tr') Object.assign(style, { top: -1, right: -1 });
  if (pos === 'bl') Object.assign(style, { bottom: -1, left: -1 });
  if (pos === 'br') Object.assign(style, { bottom: -1, right: -1 });

  return (
    <View style={style}>
      <View style={{
        width: 14, height: 14,
        borderTopWidth: pos === 'tl' || pos === 'tr' ? 2 : 0,
        borderBottomWidth: pos === 'bl' || pos === 'br' ? 2 : 0,
        borderLeftWidth: pos === 'tl' || pos === 'bl' ? 2 : 0,
        borderRightWidth: pos === 'tr' || pos === 'br' ? 2 : 0,
        borderColor: SL.cyan,
        shadowColor: SL.cyan,
        shadowOpacity: 1,
        shadowRadius: 6,
      }} />
    </View>
  );
}

// ─── PAINEL PRINCIPAL DO SISTEMA ──────────────────────────────
interface SystemPanelProps {
  children: React.ReactNode;
  style?: ViewStyle;
  color?: string;
  glow?: string;
}

export function SystemPanel({ children, style, color = SL.cyan, glow = SL.cyanGlow }: SystemPanelProps) {
  return (
    <View style={[{
      backgroundColor: SL.bgPanel,
      borderWidth: 1,
      borderColor: `${color}55`,
      borderRadius: 4,
      padding: 16,
      marginBottom: 14,
      shadowColor: color,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.35,
      shadowRadius: 12,
    }, style]}>
      <Corner pos="tl" />
      <Corner pos="tr" />
      <Corner pos="bl" />
      <Corner pos="br" />
      {children}
    </View>
  );
}

// ─── CABEÇALHO DE PAINEL ──────────────────────────────────────
export function PanelHeader({ title, subtitle, icon, color = SL.cyan }: { title: string; subtitle?: string; icon?: string; color?: string }) {
  return (
    <View style={{ marginBottom: 14 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 }}>
        <View style={{ width: 3, height: 16, backgroundColor: color, borderRadius: 2 }} />
        {icon && <Text style={{ fontSize: 16 }}>{icon}</Text>}
        <Text style={{ color, fontSize: 12, letterSpacing: 4, fontWeight: '800', textTransform: 'uppercase' }}>
          {title}
        </Text>
      </View>
      {subtitle && (
        <Text style={{ color: SL.muted, fontSize: 12, marginLeft: 11 }}>{subtitle}</Text>
      )}
      <View style={{ height: 1, backgroundColor: `${color}33`, marginTop: 10 }} />
    </View>
  );
}

// ─── BADGE DE RANK ────────────────────────────────────────────
const RANK_COLORS: Record<string, string> = {
  'E': '#64748b', 'D': '#22c55e', 'C': '#3b82f6',
  'B': '#a855f7', 'A': '#f59e0b', 'S': '#ef4444',
};

export function RankBadge({ rank }: { rank: string }) {
  const color = RANK_COLORS[rank] || SL.muted;
  return (
    <View style={{
      paddingHorizontal: 10, paddingVertical: 4, borderRadius: 3,
      backgroundColor: `${color}22`, borderWidth: 1, borderColor: `${color}77`,
    }}>
      <Text style={{ color, fontWeight: '900', fontSize: 13, letterSpacing: 2 }}>RANK {rank}</Text>
    </View>
  );
}

// ─── BARRA DE PROGRESSO ANIMADA ───────────────────────────────
export function SystemProgressBar({
  progress, color = SL.cyan, height = 6, label,
}: { progress: number; color?: string; height?: number; label?: string }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, {
      toValue: Math.min(progress, 1),
      duration: 900,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [progress]);

  return (
    <View>
      {label && (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
          <Text style={{ color: SL.muted, fontSize: 11 }}>{label}</Text>
          <Text style={{ color, fontSize: 11, fontFamily: 'monospace' }}>{Math.round(progress * 100)}%</Text>
        </View>
      )}
      <View style={{ height, backgroundColor: SL.bgInner, borderRadius: 1, overflow: 'hidden', borderWidth: 1, borderColor: SL.dim }}>
        <Animated.View style={{
          height, backgroundColor: color,
          width: anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
          shadowColor: color, shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 1, shadowRadius: 8,
        }} />
      </View>
    </View>
  );
}

// ─── BOTÃO DO SISTEMA ─────────────────────────────────────────
export function SystemButton({
  label, onPress, disabled, color = SL.cyan, variant = 'outline',
}: { label: string; onPress: () => void; disabled?: boolean; color?: string; variant?: 'solid' | 'outline' }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.95, duration: 70, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 5, useNativeDriver: true }),
    ]).start();
    onPress();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={handlePress}
        disabled={disabled}
        style={{
          backgroundColor: variant === 'solid' ? (disabled ? SL.dim : color) : (disabled ? 'transparent' : `${color}15`),
          borderWidth: 1,
          borderColor: disabled ? SL.dim : `${color}88`,
          borderRadius: 3,
          paddingVertical: 14,
          alignItems: 'center',
          shadowColor: disabled ? 'transparent' : color,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: disabled ? 0 : 0.4,
          shadowRadius: 10,
        }}
      >
        <Text style={{
          color: variant === 'solid' ? (disabled ? SL.muted : '#000') : (disabled ? SL.muted : color),
          fontWeight: '900',
          fontSize: 13,
          letterSpacing: 3,
          textTransform: 'uppercase',
        }}>
          {label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── NOTIFICAÇÃO DO SISTEMA (tipo pop-up do manhwa) ───────────
export function SystemAlert({ type, children }: { type: 'warning' | 'success' | 'info'; children: React.ReactNode }) {
  const color = type === 'warning' ? SL.red : type === 'success' ? SL.green : SL.cyan;
  const icon = type === 'warning' ? '⚠' : type === 'success' ? '✔' : 'ℹ';
  return (
    <View style={{
      backgroundColor: `${color}12`, borderWidth: 1, borderColor: `${color}44`,
      borderRadius: 4, padding: 12, flexDirection: 'row', gap: 10, alignItems: 'flex-start', marginBottom: 12,
    }}>
      <Text style={{ color, fontWeight: '900', fontSize: 14 }}>{icon}</Text>
      <View style={{ flex: 1 }}>{children}</View>
    </View>
  );
}

// ─── ANIMAÇÕES PADRÃO SOLO LEVELING ────────────────────────────

/**
 * Wrapper principal de tela.
 * Toda vez que a aba ganha foco, a tela "materializa" (Fade In + Slide Up rápido).
 */
export function SystemScreenWrapper({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useFocusEffect(
    useCallback(() => {
      // Reseta
      fadeAnim.setValue(0);
      slideAnim.setValue(20);

      // Anima
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
        Animated.spring(slideAnim, { toValue: 0, friction: 6, tension: 50, useNativeDriver: true }),
      ]).start();
    }, [fadeAnim, slideAnim])
  );

  return (
    <Animated.View style={[{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }, style]}>
      {children}
    </Animated.View>
  );
}

function StaggerChild({ children, index, staggerDelay }: { children: React.ReactNode; index: number; staggerDelay: number }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(15)).current;

  useFocusEffect(
    useCallback(() => {
      fadeAnim.setValue(0);
      slideAnim.setValue(15);
      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
          Animated.spring(slideAnim, { toValue: 0, friction: 6, tension: 60, useNativeDriver: true }),
        ]).start();
      }, index * staggerDelay);
      return () => clearTimeout(timer);
    }, [index, staggerDelay, fadeAnim, slideAnim])
  );

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      {children}
    </Animated.View>
  );
}

/**
 * Wrapper de lista animada em cascata.
 * Envolve itens para que apareçam um a um de forma fluida.
 */
export function SystemStaggerGroup({ children, staggerDelay = 80 }: { children: React.ReactNode; staggerDelay?: number }) {
  return (
    <View>
      {React.Children.map(children, (child, i) => {
        if (!React.isValidElement(child)) return child;
        return (
          <StaggerChild index={i} staggerDelay={staggerDelay} key={i}>
            {child}
          </StaggerChild>
        );
      })}
    </View>
  );
}
