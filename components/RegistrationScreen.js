import { FontAwesome, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { styles } from '../styles/RegistrationScreenStyles';

WebBrowser.maybeCompleteAuthSession();

// Replace these with your actual Google OAuth client IDs
// See GOOGLE_SETUP_GUIDE.md for setup instructions
const ANDROID_CLIENT_ID = process.env.ANDROID_CLIENT_ID || 'YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com';
const IOS_CLIENT_ID = process.env.IOS_CLIENT_ID || 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com';
const EXPO_CLIENT_ID = process.env.EXPO_CLIENT_ID || 'YOUR_EXPO_CLIENT_ID.apps.googleusercontent.com';

export default function RegistrationScreen({ onRegister }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const logoAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
    Animated.spring(logoAnim, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();
  }, []);

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: ANDROID_CLIENT_ID,
    iosClientId: IOS_CLIENT_ID,
    expoClientId: EXPO_CLIENT_ID,
    selectAccount: true,
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      setLoading(true);
      fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: `Bearer ${authentication.accessToken}` },
      })
        .then(res => res.json())
        .then(async data => {
          await AsyncStorage.setItem('userProfile', JSON.stringify({ name: data.name, email: data.email, phone: '' }));
          setSuccess(true);
          setTimeout(() => onRegister(), 1200);
        })
        .catch((error) => {
          console.error('Google sign-in error:', error);
          Alert.alert('Google sign-in failed', 'Please check your Google OAuth configuration');
        })
        .finally(() => setLoading(false));
    } else if (response?.type === 'error') {
      console.error('Auth error:', response);
      Alert.alert(
        'Google Authentication Not Configured',
        'Google Sign-In requires proper OAuth setup. Please:\n\n1. Open GOOGLE_SETUP_GUIDE.md\n2. Follow the Google Authentication setup steps\n3. Update the client IDs in RegistrationScreen.js\n\nFor now, please use manual registration below.',
        [{ text: 'OK' }]
      );
    }
  }, [response]);

  const handleRegister = async () => {
    if (!name || !email || !phone) {
      Alert.alert('Please fill all fields');
      return;
    }
    if (!/^\d{10}$/.test(phone)) {
      Alert.alert('Phone number must be exactly 10 digits');
      return;
    }
    if (!/^.+@gmail\.com$/.test(email)) {
      Alert.alert('Email must be a valid @gmail.com address');
      return;
    }
    setLoading(true);
    try {
      await AsyncStorage.setItem('userProfile', JSON.stringify({ name, email, phone }));
      setSuccess(true);
      setTimeout(() => onRegister(), 1200);
    } catch (e) {
      Alert.alert('Error saving data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.bg}>
      <Animated.View style={{ opacity: fadeAnim }}>
        <Text style={styles.welcome}>WELCOME TO THE SHEild</Text>
        <Text style={styles.slogan}>Your Safety, Our Shield.</Text>
      </Animated.View>
      <Animated.View style={[styles.card, { transform: [{ scale: logoAnim }] }]}>  
        <Animated.Image
          source={require('../assets/images/icon.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Register</Text>
        <TouchableOpacity
          style={styles.googleButton}
          onPress={() => promptAsync()}
          disabled={!request || loading}
          activeOpacity={0.8}
        >
          <FontAwesome name="google" size={22} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.googleButtonText}>Register with Google</Text>
        </TouchableOpacity>
        <View style={styles.dividerRow}>
          <View style={styles.divider} />
          <Text style={styles.orText}>or</Text>
          <View style={styles.divider} />
        </View>
        <View style={styles.inputRow}>
          <Ionicons name="person" size={20} color="#7B3FA0" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Name"
            value={name}
            onChangeText={setName}
            editable={!loading}
          />
        </View>
        <View style={styles.inputRow}>
          <Ionicons name="mail" size={20} color="#7B3FA0" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!loading}
          />
        </View>
        <View style={styles.inputRow}>
          <FontAwesome name="phone" size={20} color="#7B3FA0" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Phone Number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            editable={!loading}
          />
        </View>
        <TouchableOpacity
          style={[styles.registerButton, loading && { backgroundColor: '#ccc' }]}
          onPress={handleRegister}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.registerButtonText}>Register</Text>
          )}
        </TouchableOpacity>
        {success && (
          <View style={styles.successContainer}>
            <Ionicons name="checkmark-circle" size={48} color="#4BB543" />
          </View>
        )}
      </Animated.View>
    </View>
  );
}