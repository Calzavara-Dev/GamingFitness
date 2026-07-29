import { View, TextInput, TouchableOpacity, Animated, Easing, ScrollView } from 'react-native';
import { SystemText as Text } from '../../components/SystemText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useRef, useEffect } from 'react';
import { useSystemStore, AthleteProfile } from '../../store/useSystemStore';
import { SL, SystemButton } from '../../components/SystemUI';

export default function OnboardingScreen() {
  const { completeOnboarding, systemMessages } = useSystemStore();
  
  const [step, setStep] = useState(0);
  const [messages, setMessages] = useState<string[]>([]);
  
  // Profile State
  const [name, setName] = useState('');
  const [gender, setGender] = useState<AthleteProfile['gender'] | null>(null);
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [fitnessLevel, setFitnessLevel] = useState<AthleteProfile['fitnessLevel'] | null>(null);
  const [primaryGoal, setPrimaryGoal] = useState<AthleteProfile['primaryGoal'] | null>(null);
  const [availableTime, setAvailableTime] = useState<AthleteProfile['availableTime'] | null>(null);
  const [injuries, setInjuries] = useState({ knee: false, shoulder: false, lowerBack: false });

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  // Typewriter effect logic
  useEffect(() => {
    let currentMsgIndex = 0;
    
    if (step === 0) {
      const interval = setInterval(() => {
        if (currentMsgIndex < systemMessages.length) {
          setMessages(prev => [...prev, systemMessages[currentMsgIndex]]);
          currentMsgIndex++;
        } else {
          clearInterval(interval);
          setTimeout(() => setStep(1), 800);
        }
      }, 1200);
      return () => clearInterval(interval);
    }
    
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, [step]);

  const nextStep = () => {
    fadeAnim.setValue(0);
    slideAnim.setValue(20);
    setStep(s => s + 1);
  };

  const handleComplete = () => {
    if (!name || !gender || !fitnessLevel || !primaryGoal || !availableTime) return;
    
    completeOnboarding({
      name,
      gender,
      age: Number(age) || 25,
      weight: Number(weight) || 70,
      height: Number(height) || 170,
      fitnessLevel,
      primaryGoal,
      availableTime,
      injuries,
    });
  };

  const renderStep = () => {
    switch(step) {
      case 0:
        return (
          <View style={{ flex: 1, justifyContent: 'center' }}>
            {messages.map((msg, idx) => (
              <Animated.Text key={idx} style={{
                color: SL.cyan, fontSize: 14, fontFamily: 'monospace', marginBottom: 20,
                textShadowColor: SL.cyanGlow, textShadowRadius: 10,
              }}>
                {'>'} {msg}
              </Animated.Text>
            ))}
          </View>
        );

      case 1:
        return (
          <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }], justifyContent: 'center' }}>
            <Text style={{ color: SL.cyan, fontSize: 12, fontFamily: 'monospace', marginBottom: 24 }}>
              {'>'} Identifique-se, Jogador. Qual é o seu nome ou codinome?
            </Text>
            <View style={{ gap: 16 }}>
              <View>
                <Text style={{ color: SL.muted, fontSize: 11, letterSpacing: 2, marginBottom: 6 }}>NOME DO CAÇADOR</Text>
                <TextInput 
                  style={{ backgroundColor: SL.bgInner, color: SL.white, padding: 14, borderWidth: 1, borderColor: `${SL.cyan}33`, borderRadius: 3 }} 
                  placeholder="Ex: Sung Jinwoo" 
                  placeholderTextColor={SL.dim} 
                  value={name} 
                  onChangeText={setName} 
                />
              </View>
            </View>
            <View style={{ marginTop: 32 }}>
              <SystemButton label="AVANÇAR" onPress={nextStep} disabled={!name.trim()} variant="solid" />
            </View>
          </Animated.View>
        );

      case 2:
        return (
          <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }], justifyContent: 'center' }}>
            <Text style={{ color: SL.cyan, fontSize: 12, fontFamily: 'monospace', marginBottom: 24 }}>
              {'>'} Qual o gênero biológico do seu Avatar? (Necessário para calibração de aparência).
            </Text>
            <View style={{ gap: 12 }}>
              {(['Masculino', 'Feminino', 'Oculto'] as const).map(g => (
                <TouchableOpacity key={g} onPress={() => setGender(g)} style={{
                  backgroundColor: gender === g ? `${SL.cyan}20` : SL.bgInner,
                  borderWidth: 1, borderColor: gender === g ? SL.cyan : SL.dim,
                  padding: 16, borderRadius: 3, flexDirection: 'row', alignItems: 'center'
                }}>
                  <Text style={{ color: gender === g ? SL.cyan : SL.white, fontWeight: '700', fontSize: 14, flex: 1 }}>{g.toUpperCase()}</Text>
                  {gender === g && <Text style={{ color: SL.cyan, fontSize: 16 }}>◈</Text>}
                </TouchableOpacity>
              ))}
            </View>
            <View style={{ marginTop: 32 }}>
              <SystemButton label="AVANÇAR" onPress={nextStep} disabled={!gender} variant="solid" />
            </View>
          </Animated.View>
        );

      case 3:
        return (
          <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }], justifyContent: 'center' }}>
            <Text style={{ color: SL.cyan, fontSize: 12, fontFamily: 'monospace', marginBottom: 24 }}>
              {'>'} Insira os parâmetros físicos primários (Números Inteiros). O IMC será calculado.
            </Text>
            
            <View style={{ gap: 16 }}>
              <View>
                <Text style={{ color: SL.muted, fontSize: 11, letterSpacing: 2, marginBottom: 6 }}>IDADE</Text>
                <TextInput style={{ backgroundColor: SL.bgInner, color: SL.white, padding: 14, borderWidth: 1, borderColor: `${SL.cyan}33`, borderRadius: 3 }} placeholder="Ex: 24" placeholderTextColor={SL.dim} keyboardType="numeric" value={age} onChangeText={setAge} />
              </View>
              <View>
                <Text style={{ color: SL.muted, fontSize: 11, letterSpacing: 2, marginBottom: 6 }}>PESO (KG)</Text>
                <TextInput style={{ backgroundColor: SL.bgInner, color: SL.white, padding: 14, borderWidth: 1, borderColor: `${SL.cyan}33`, borderRadius: 3 }} placeholder="Ex: 75" placeholderTextColor={SL.dim} keyboardType="numeric" value={weight} onChangeText={setWeight} />
              </View>
              <View>
                <Text style={{ color: SL.muted, fontSize: 11, letterSpacing: 2, marginBottom: 6 }}>ALTURA (CM)</Text>
                <TextInput style={{ backgroundColor: SL.bgInner, color: SL.white, padding: 14, borderWidth: 1, borderColor: `${SL.cyan}33`, borderRadius: 3 }} placeholder="Ex: 175" placeholderTextColor={SL.dim} keyboardType="numeric" value={height} onChangeText={setHeight} />
              </View>
            </View>
            
            <View style={{ marginTop: 32 }}>
              <SystemButton label="AVANÇAR" onPress={nextStep} disabled={!age || !weight || !height} variant="solid" />
            </View>
          </Animated.View>
        );

      case 4:
        return (
          <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }], justifyContent: 'center' }}>
            <Text style={{ color: SL.cyan, fontSize: 12, fontFamily: 'monospace', marginBottom: 24 }}>
              {'>'} Qual o seu histórico de batalhas prévio?
            </Text>
            <View style={{ gap: 12 }}>
              {(['Iniciante', 'Intermediário', 'Atleta'] as const).map(lvl => (
                <TouchableOpacity key={lvl} onPress={() => setFitnessLevel(lvl)} style={{
                  backgroundColor: fitnessLevel === lvl ? `${SL.cyan}20` : SL.bgInner,
                  borderWidth: 1, borderColor: fitnessLevel === lvl ? SL.cyan : SL.dim,
                  padding: 16, borderRadius: 3, flexDirection: 'row', alignItems: 'center'
                }}>
                  <Text style={{ color: fitnessLevel === lvl ? SL.cyan : SL.white, fontWeight: '700', fontSize: 14, flex: 1 }}>{lvl}</Text>
                  {fitnessLevel === lvl && <Text style={{ color: SL.cyan, fontSize: 16 }}>◈</Text>}
                </TouchableOpacity>
              ))}
            </View>
            <View style={{ marginTop: 32 }}>
              <SystemButton label="AVANÇAR" onPress={nextStep} disabled={!fitnessLevel} variant="solid" />
            </View>
          </Animated.View>
        );

      case 5:
        return (
          <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }], justifyContent: 'center' }}>
            <Text style={{ color: SL.cyan, fontSize: 12, fontFamily: 'monospace', marginBottom: 24 }}>
              {'>'} Qual atributo você deseja focar para a sobrevivência?
            </Text>
            <View style={{ gap: 12 }}>
              {(['Força/Massa', 'Perda de Peso', 'Resistência/Stamina'] as const).map(goal => (
                <TouchableOpacity key={goal} onPress={() => setPrimaryGoal(goal)} style={{
                  backgroundColor: primaryGoal === goal ? `${SL.cyan}20` : SL.bgInner,
                  borderWidth: 1, borderColor: primaryGoal === goal ? SL.cyan : SL.dim,
                  padding: 16, borderRadius: 3, flexDirection: 'row', alignItems: 'center'
                }}>
                  <Text style={{ color: primaryGoal === goal ? SL.cyan : SL.white, fontWeight: '700', fontSize: 14, flex: 1 }}>{goal.toUpperCase()}</Text>
                  {primaryGoal === goal && <Text style={{ color: SL.cyan, fontSize: 16 }}>◈</Text>}
                </TouchableOpacity>
              ))}
            </View>
            <View style={{ marginTop: 32 }}>
              <SystemButton label="AVANÇAR" onPress={nextStep} disabled={!primaryGoal} variant="solid" />
            </View>
          </Animated.View>
        );

      case 6:
        return (
          <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }], justifyContent: 'center' }}>
            <Text style={{ color: SL.cyan, fontSize: 12, fontFamily: 'monospace', marginBottom: 24 }}>
              {'>'} Tempo máximo diário disponível para missões?
            </Text>
            <View style={{ gap: 12 }}>
              {(['< 30 min', '30-60 min', '> 60 min'] as const).map(time => (
                <TouchableOpacity key={time} onPress={() => setAvailableTime(time)} style={{
                  backgroundColor: availableTime === time ? `${SL.cyan}20` : SL.bgInner,
                  borderWidth: 1, borderColor: availableTime === time ? SL.cyan : SL.dim,
                  padding: 16, borderRadius: 3, flexDirection: 'row', alignItems: 'center'
                }}>
                  <Text style={{ color: availableTime === time ? SL.cyan : SL.white, fontWeight: '700', fontSize: 14, flex: 1 }}>{time}</Text>
                  {availableTime === time && <Text style={{ color: SL.cyan, fontSize: 16 }}>◈</Text>}
                </TouchableOpacity>
              ))}
            </View>
            <View style={{ marginTop: 32 }}>
              <SystemButton label="AVANÇAR" onPress={nextStep} disabled={!availableTime} variant="solid" />
            </View>
          </Animated.View>
        );

      case 7:
        return (
          <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }], justifyContent: 'center' }}>
            <Text style={{ color: SL.cyan, fontSize: 12, fontFamily: 'monospace', marginBottom: 24 }}>
              {'>'} Identifique falhas estruturais (lesões) para adaptação.
            </Text>
            <View style={{ gap: 12 }}>
              <TouchableOpacity onPress={() => setInjuries(p => ({...p, knee: !p.knee}))} style={{
                backgroundColor: injuries.knee ? `${SL.red}20` : SL.bgInner,
                borderWidth: 1, borderColor: injuries.knee ? SL.red : SL.dim,
                padding: 16, borderRadius: 3, flexDirection: 'row', alignItems: 'center'
              }}>
                <Text style={{ color: injuries.knee ? SL.red : SL.white, fontWeight: '700', fontSize: 14, flex: 1 }}>JOELHOS / PERNAS (Reduz Corrida)</Text>
                {injuries.knee && <Text style={{ color: SL.red, fontSize: 16 }}>⚠</Text>}
              </TouchableOpacity>
              
              <TouchableOpacity onPress={() => setInjuries(p => ({...p, shoulder: !p.shoulder}))} style={{
                backgroundColor: injuries.shoulder ? `${SL.red}20` : SL.bgInner,
                borderWidth: 1, borderColor: injuries.shoulder ? SL.red : SL.dim,
                padding: 16, borderRadius: 3, flexDirection: 'row', alignItems: 'center'
              }}>
                <Text style={{ color: injuries.shoulder ? SL.red : SL.white, fontWeight: '700', fontSize: 14, flex: 1 }}>OMBROS / PULSOS (Reduz Flexão)</Text>
                {injuries.shoulder && <Text style={{ color: SL.red, fontSize: 16 }}>⚠</Text>}
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setInjuries(p => ({...p, lowerBack: !p.lowerBack}))} style={{
                backgroundColor: injuries.lowerBack ? `${SL.red}20` : SL.bgInner,
                borderWidth: 1, borderColor: injuries.lowerBack ? SL.red : SL.dim,
                padding: 16, borderRadius: 3, flexDirection: 'row', alignItems: 'center'
              }}>
                <Text style={{ color: injuries.lowerBack ? SL.red : SL.white, fontWeight: '700', fontSize: 14, flex: 1 }}>LOMBAR (Reduz Abdominal)</Text>
                {injuries.lowerBack && <Text style={{ color: SL.red, fontSize: 16 }}>⚠</Text>}
              </TouchableOpacity>
            </View>
            
            <View style={{ marginTop: 32 }}>
              <SystemButton label="FINALIZAR INTEGRAÇÃO" onPress={handleComplete} color={SL.purple} variant="solid" />
            </View>
          </Animated.View>
        );
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: SL.bg }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24 }}>
        {renderStep()}
      </ScrollView>
    </SafeAreaView>
  );
}
