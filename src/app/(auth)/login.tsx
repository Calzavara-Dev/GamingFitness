import { View, TextInput, TouchableOpacity, ActivityIndicator, Animated, Easing } from 'react-native';
import { SystemText as Text } from '../../components/SystemText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useRef, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { SL } from '../../components/SystemUI';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const glowAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();

    Animated.loop(Animated.sequence([
      Animated.timing(glowAnim, { toValue: 1, duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
      Animated.timing(glowAnim, { toValue: 0.4, duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
    ])).start();
  }, []);

  async function handleAuth() {
    setErrorMessage('');
    setSuccessMessage('');
    if (!email || !password) { setErrorMessage('Preencha o email e a senha, Caçador.'); return; }

    setLoading(true);
    let error;
    if (isSignUp) {
      const res = await supabase.auth.signUp({ email, password });
      error = res.error;
      if (!error) setSuccessMessage('Registro concluído. Verifique seu email para ativar o acesso.');
    } else {
      const res = await supabase.auth.signInWithPassword({ email, password });
      error = res.error;
    }
    if (error) setErrorMessage(error.message);
    setLoading(false);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: SL.bg, justifyContent: 'center', paddingHorizontal: 24 }}>
      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

        {/* Logo / Título */}
        <View style={{ alignItems: 'center', marginBottom: 44 }}>
          <Animated.Text style={{
            color: SL.cyan, fontSize: 10, letterSpacing: 6, fontWeight: '800',
            marginBottom: 14, opacity: glowAnim,
          }}>
            ══ PROTOCOLO DE VERIFICAÇÃO ══
          </Animated.Text>
          <Text style={{
            color: SL.white, fontSize: 32, fontWeight: '900', letterSpacing: 3, textAlign: 'center',
            textShadowColor: SL.cyan, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 10,
          }}>
            ACESSO AO{'\n'}SISTEMA
          </Text>
          <Text style={{ color: SL.muted, fontSize: 12, marginTop: 10, textAlign: 'center' }}>
            Identifique-se para que o Sistema possa{'\n'}monitorar seu progresso de Caçador.
          </Text>
        </View>

        {/* Mensagens */}
        {errorMessage ? (
          <View style={{ backgroundColor: `${SL.red}15`, borderWidth: 1, borderColor: `${SL.red}55`, borderRadius: 3, padding: 12, marginBottom: 14 }}>
            <Text style={{ color: SL.red, fontWeight: '700', fontSize: 13 }}>⚠ {errorMessage}</Text>
          </View>
        ) : null}
        {successMessage ? (
          <View style={{ backgroundColor: `${SL.green}12`, borderWidth: 1, borderColor: `${SL.green}55`, borderRadius: 3, padding: 12, marginBottom: 14 }}>
            <Text style={{ color: SL.green, fontWeight: '700', fontSize: 13 }}>✔ {successMessage}</Text>
          </View>
        ) : null}

        {/* Campos */}
        <View style={{ marginBottom: 10 }}>
          <Text style={{ color: SL.muted, fontSize: 11, letterSpacing: 3, fontWeight: '700', marginBottom: 6 }}>ID DO CAÇADOR (EMAIL)</Text>
          <TextInput
            style={{ backgroundColor: SL.bgPanel, color: SL.white, padding: 14, borderRadius: 3, borderWidth: 1, borderColor: `${SL.cyan}33`, fontSize: 15 }}
            placeholder="caçador@email.com"
            placeholderTextColor={SL.dim}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View style={{ marginBottom: 28 }}>
          <Text style={{ color: SL.muted, fontSize: 11, letterSpacing: 3, fontWeight: '700', marginBottom: 6 }}>CÓDIGO DE ACESSO</Text>
          <TextInput
            style={{ backgroundColor: SL.bgPanel, color: SL.white, padding: 14, borderRadius: 3, borderWidth: 1, borderColor: `${SL.cyan}33`, fontSize: 15 }}
            placeholder="••••••••"
            placeholderTextColor={SL.dim}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        {/* Botão principal */}
        <TouchableOpacity
          onPress={handleAuth}
          disabled={loading}
          style={{
            backgroundColor: SL.cyan, borderRadius: 3, padding: 18, alignItems: 'center', marginBottom: 16,
            shadowColor: SL.cyan, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 20,
          }}
        >
          {loading ? (
            <ActivityIndicator color={SL.bg} />
          ) : (
            <Text style={{ color: SL.bg, fontWeight: '900', fontSize: 14, letterSpacing: 4 }}>
              {isSignUp ? 'REGISTRAR NO SISTEMA' : 'ACESSAR O SISTEMA'}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)} style={{ alignItems: 'center' }}>
          <Text style={{ color: SL.muted, fontSize: 13 }}>
            {isSignUp ? 'Já registrado? → Fazer login' : 'Novo Caçador? → Criar registro'}
          </Text>
        </TouchableOpacity>

        {/* Footer */}
        <View style={{ alignItems: 'center', marginTop: 40 }}>
          <Text style={{ color: SL.dim, fontSize: 10, letterSpacing: 1 }}>
            © Todos os direitos reservados para 3SG-CI Calzavara
          </Text>
        </View>

      </Animated.View>
    </SafeAreaView>
  );
}
