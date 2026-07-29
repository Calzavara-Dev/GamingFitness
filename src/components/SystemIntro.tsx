import React, { useEffect, useState, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { SystemText as Text } from './SystemText';
import { useAudioPlayer } from 'expo-audio';

export function SystemIntro({ onFinish }: { onFinish: () => void }) {
  const [lines, setLines] = useState<string[]>([]);
  const [showCursor, setShowCursor] = useState(true);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const player = useAudioPlayer(require('../../musics/intro.mp3'));

  const messages = [
    "> CONECTANDO AO SERVIDOR DO SISTEMA...",
    "> SINCRONIZANDO DADOS DO CAÇADOR...",
    "> ACESSO CONCEDIDO."
  ];

  async function playSound() {
    try {
      player.play();
    } catch (e) {
      console.log('Erro ao tocar som:', e);
    }
  }

  useEffect(() => {
    playSound();

    let currentIndex = 0;
    const interval = setInterval(() => {
      setLines((prev) => [...prev, messages[currentIndex]]);
      currentIndex++;
      
      if (currentIndex === messages.length) {
        clearInterval(interval);
        setTimeout(() => {
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }).start(() => {
            onFinish();
          });
        }, 1000);
      }
    }, 800);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // Animação do cursor (blink)
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);
    return () => clearInterval(blinkInterval);
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.terminal}>
        {lines.map((line, index) => (
          <Text key={index} style={styles.text}>{line}</Text>
        ))}
        {lines.length < messages.length && (
          <Text style={[styles.cursor, { opacity: showCursor ? 1 : 0 }]}>█</Text>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#010610',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  terminal: {
    width: '80%',
    alignItems: 'flex-start',
  },
  text: {
    color: '#00ff88',
    fontFamily: 'monospace',
    fontSize: 14,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  cursor: {
    color: '#00ff88',
    fontFamily: 'monospace',
    fontSize: 14,
  }
});
