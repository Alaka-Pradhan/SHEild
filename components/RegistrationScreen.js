import { FontAwesome, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as AuthSession from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { styles } from '../styles/RegistrationScreenStyles';

WebBrowser.maybeCompleteAuthSession();

const ANDROID_CLIENT_ID = 'YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com';
const IOS_CLIENT_ID = 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com';
const EXPO_CLIENT_ID = 'YOUR_EXPO_CLIENT_ID.apps.googleusercontent.com';

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
        .catch(() => Alert.alert('Google sign-in failed'))
        .finally(() => setLoading(false));
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
          <Ionicons name="email" size={20} color="#7B3FA0" style={styles.inputIcon} />
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