import React from 'react';
import { Text as RNText, TextProps, StyleSheet } from 'react-native';

/**
 * Componente de Texto global do Sistema (Solo Leveling).
 * Substitui automaticamente o Text do React Native aplicando a fonte Rajdhani.
 * Mantém as cores e outras propriedades intactas.
 */
export function SystemText(props: TextProps) {
  // A Rajdhani tem variantes: 300, 400, 500, 600, 700.
  // Vamos mapear o fontWeight inline (se existir) para a fonte correta no Android,
  // pois no Android a fonte customizada pode não suportar bold se não for especificada pelo nome.
  let fontFamily = 'Rajdhani_500Medium'; // Default

  const flatStyle = StyleSheet.flatten(props.style || {});
  
  if (flatStyle.fontWeight) {
    const weight = String(flatStyle.fontWeight);
    if (weight === 'bold' || weight === '700' || weight === '800' || weight === '900') {
      fontFamily = 'Rajdhani_700Bold';
    } else if (weight === '600') {
      fontFamily = 'Rajdhani_600SemiBold';
    } else if (weight === '300' || weight === '200' || weight === '100') {
      fontFamily = 'Rajdhani_300Light';
    } else {
      fontFamily = 'Rajdhani_400Regular';
    }
  }

  return (
    <RNText {...props} style={[props.style, { fontFamily }]} />
  );
}
