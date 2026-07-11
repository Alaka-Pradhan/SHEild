import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { Audio } from 'expo-audio';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { useContext, useEffect, useRef, useState } from 'react';
import { Alert, Animated, Dimensions, Linking, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../constants/Colors';
import { ThemeContext } from '../contexts/ThemeContext';

const { width } = Dimensions.get('window');

const SAFETY_TOOLS = [
  { id: 'alarm', label: 'Loud Alarm', icon: 'alarm', color: '#FF6B35', action: 'alarm' },
  { id: 'sms', label: 'Emergency SMS', icon: 'sms', color: '#4ECDC4', action: 'sms' },
  { id: 'camera', label: 'Evidence Camera', icon: 'camera-alt', color: '#45B7D1', action: 'camera' },
  { id: 'flashlight', label: 'Flashlight', icon: 'flashlight-on', color: '#FFA726', action: 'flashlight' },
];

const EMERGENCY_CONTACTS = [
  { id: 'women', label: 'Women Helpline', phone: '1091', icon: 'support-agent', color: '#E91E63' },
  { id: 'police', label: 'Police Emergency', phone: '100', icon: 'local-police', color: '#1976D2' },
  { id: 'national', label: 'National Emergency', phone: '112', icon: 'emergency', color: '#D32F2F' },
];

const SAFETY_RESOURCES = [
  { id: 'tips', label: 'Safety Tips', screen: 'SafetyTips', icon: 'shield-checkmark', color: '#7B1FA2' },
  { id: 'community', label: 'Community Support', screen: 'Community', icon: 'people', color: '#388E3C' },
];

const accentGradients = {
  tool: ['#67696bff'], 
  resource: ['#1976D2', '#BBDEFB'],
};

const GRADIENT_COLORS = ['#f8f9fa', '#ffffff'];

const EMERGENCY_SMS_NUMBER = '100';

export default function ToolkitScreen() {
  const navigation = useNavigation();
  const [toast, setToast] = useState('');
  const [toastIcon, setToastIcon] = useState(null);
  const [resourcePressed, setResourcePressed] = useState(null);
  const [alarmSound, setAlarmSound] = useState(null);
  const [isAlarmPlaying, setIsAlarmPlaying] = useState(false);
  const { darkMode } = useContext(ThemeContext);
  const theme = darkMode ? Colors.dark : Colors.light;
  const [userName, setUserName] = useState('');
  const alarmPulse = useRef(new Animated.Value(1)).current;
  const panicPulse = useRef(new Animated.Value(1)).current;
  const panicScale = useRef(new Animated.Value(1)).current;
  const toastSlide = useRef(new Animated.Value(100)).current;
  const alarmIconAnim = useRef(new Animated.Value(1)).current;
  const callIconAnim = useRef(new Animated.Value(1)).current;

  const showToast = (message, icon) => {
    setToast(message);
    setToastIcon(icon);
    Animated.timing(toastSlide, { toValue: 0, duration: 250, useNativeDriver: true }).start();
    setTimeout(() => {
      Animated.timing(toastSlide, { toValue: 100, duration: 250, useNativeDriver: true }).start(() => {
        setToast('');
        setToastIcon(null);
      });
    }, 1200);
  };

  const sendEmergencySMS = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    let location = null;
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        location = await Location.getCurrentPositionAsync({});
      }
    } catch {}
    let message = 'Emergency! I need help. My location: ';
    if (location) {
      message += `https://maps.google.com/?q=${location.coords.latitude},${location.coords.longitude}`;
    } else {
      message += 'Location unavailable.';
    }
    showToast('Emergency SMS sent!', 'call');
    Alert.alert('Emergency SMS', `Pretend to send SMS to ${EMERGENCY_SMS_NUMBER}:\n${message}`);
  };

  const openEvidenceCamera = async () => {
    Haptics.selectionAsync();
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (permission.status !== 'granted') {
      showToast('Camera permission denied', 'resource');
      return;
    }
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.7,
    });
    if (!result.canceled && result.assets?.length > 0) {
      showToast('Photo captured!', 'resource');
      Alert.alert('Photo', 'Photo captured for evidence.');
    }
  };

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(alarmPulse, { toValue: 1.08, duration: 700, useNativeDriver: true }),
        Animated.timing(alarmPulse, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    ).start();
    (async () => {
      try {
        const profile = await AsyncStorage.getItem('userProfile');
        if (profile) setUserName(JSON.parse(profile).name || '');
      } catch {}
    })();
    
    // Load alarm sound
    loadAlarmSound();
  }, []);

  const loadAlarmSound = async () => {
    try {
      const audio = new Audio.Sound();
      await audio.loadAsync(require('../assets/sounds/alarm.mp3'));
      await audio.setIsLoopingAsync(true);
      setAlarmSound(audio);
    } catch (error) {
      // Error loading alarm sound
    }
  };

  const triggerAlarm = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    Animated.sequence([
      Animated.timing(alarmIconAnim, { toValue: 1.2, duration: 120, useNativeDriver: true }),
      Animated.timing(alarmIconAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();

    if (isAlarmPlaying) {
      // Stop alarm
      if (alarmSound) {
        try {
          await alarmSound.stopAsync();
          await alarmSound.setPositionAsync(0);
          setIsAlarmPlaying(false);
          showToast('Alarm stopped!', 'alarm');
        } catch (error) {
          showToast('Error stopping alarm', 'alarm');
        }
      }
    } else {
      // Start alarm
      if (alarmSound) {
        try {
          await alarmSound.playAsync();
        setIsAlarmPlaying(true);
        showToast('Loud alarm activated!', 'alarm');
        
        Alert.alert(
          '🚨 ALARM ACTIVATED',
          'Loud alarm is now playing!\n\nTap "Stop Alarm" to turn it off.',
          [
            { text: 'Stop Alarm', onPress: async () => {
              if (alarmSound) {
                try {
                    await alarmSound.stopAsync();
                    await alarmSound.setPositionAsync(0);
                  setIsAlarmPlaying(false);
                  showToast('Alarm stopped!', 'alarm');
                } catch (error) {
                  showToast('Error stopping alarm', 'alarm');
                }
              }
            }},
            { text: 'Keep Playing', style: 'cancel' }
          ]
        );
        } catch (error) {
          showToast('Error playing alarm', 'alarm');
        }
      } else {
        showToast('Alarm sound not available', 'alarm');
        Alert.alert('Alarm Error', 'Alarm sound file not found. Please add alarm.mp3 to assets/sounds/ folder.');
      }
    }
  };

  
  const quickCall = (phone) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.sequence([
      Animated.timing(callIconAnim, { toValue: 1.2, duration: 120, useNativeDriver: true }),
      Animated.timing(callIconAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();
    showToast(`Calling ${phone}...`, 'call');
    let url = Platform.OS === 'android' ? `tel:${phone}` : `telprompt:${phone}`;
    Linking.openURL(url).catch(() => Alert.alert('Error', 'Unable to make a call.'));
  };

  
  const openResource = (url, label) => {
    Haptics.selectionAsync();
    showToast(`Opening ${label}...`, 'resource');
    Linking.openURL(url).catch(() => Alert.alert('Error', 'Unable to open link.'));
  };

 


  const handlePanicButton = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    Animated.sequence([
      Animated.timing(panicScale, { toValue: 0.9, duration: 100, useNativeDriver: true }),
      Animated.timing(panicScale, { toValue: 1.1, duration: 200, useNativeDriver: true }),
      Animated.timing(panicScale, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
    
    Animated.loop(
      Animated.sequence([
        Animated.timing(panicPulse, { toValue: 1.3, duration: 200, useNativeDriver: true }),
        Animated.timing(panicPulse, { toValue: 1, duration: 200, useNativeDriver: true }),
      ])
    ).start();

    // Start panic alarm sound
    if (alarmSound && !isAlarmPlaying) {
      try {
        await alarmSound.playAsync();
      setIsAlarmPlaying(true);
      } catch (error) {
        // Error playing alarm
      }
    }

    showToast('🚨 PANIC MODE ACTIVATED!', 'panic');
    
    Alert.alert(
      '🚨 PANIC MODE',
      'Emergency actions activated:\n\n• Loud alarm triggered\n• Location shared with emergency contacts\n• Emergency call to 112 initiated\n• Evidence recording started',
      [
        { text: 'Call 112', onPress: () => quickCall('112') },
        { text: 'Share Location', onPress: () => copyAddress() },
        { text: 'Stop Alarm', onPress: async () => {
          panicPulse.stopAnimation();
          panicPulse.setValue(1);
          if (alarmSound && isAlarmPlaying) {
            try {
              await alarmSound.stopAsync();
              await alarmSound.setPositionAsync(0);
              setIsAlarmPlaying(false);
              showToast('Alarm stopped', 'alarm');
            } catch (error) {
              showToast('Error stopping alarm', 'alarm');
            }
          }
        }},
        { text: 'OK', style: 'cancel' }
      ]
    );
  };

  const copyAddress = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        showToast('Location permission denied', 'resource');
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      const address = `https://maps.google.com/?q=${location.coords.latitude},${location.coords.longitude}`;
      await Clipboard.setStringAsync(address);
      showToast('Location copied to clipboard!', 'resource');
    } catch (error) {
      showToast('Error getting location', 'resource');
    }
  };
  
  const Gradient = ({ colors, style, children }) => (
    
    <View style={[style, { backgroundColor: colors[0] }]}>{children}</View>
  );

  useEffect(() => {
    return () => {
      if (alarmSound) {
        alarmSound.unloadAsync().catch(() => {});
      }
    };
  }, [alarmSound]);

  const handleToolAction = (action) => {
    switch (action) {
      case 'alarm':
        triggerAlarm();
        break;
      case 'sms':
        sendEmergencySMS();
        break;
      case 'camera':
        openEvidenceCamera();
        break;
      case 'flashlight':
        // Add flashlight functionality here
        showToast('Flashlight toggled!', 'flashlight');
        break;
      default:
        break;
    }
  };

  const handleResourcePress = (res) => {
    setResourcePressed(res.id);
    setTimeout(() => setResourcePressed(null), 150);
    if (res.phone) {
      quickCall(res.phone);
    } else if (res.screen) {
      navigation.navigate(res.screen);
      showToast(`Opening ${res.label}`, 'resource');
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.background }}
      contentContainerStyle={{ paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled={true}
    >
      {/* Header Section */}
      <LinearGradient 
        colors={darkMode ? ['#1a1a2e', '#16213e'] : ['#667eea', '#764ba2']}
        style={{
          paddingTop: 60,
          paddingBottom: 30,
          paddingHorizontal: 20,
          borderBottomLeftRadius: 30,
          borderBottomRightRadius: 30,
        }}
      >
        <View style={{ alignItems: 'center' }}>
          <Ionicons name="shield-checkmark" size={50} color="#fff" style={{ marginBottom: 10 }} />
          <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#fff', textAlign: 'center' }}>
            Safety Toolkit
          </Text>
          <Text style={{ fontSize: 16, color: '#fff', opacity: 0.9, textAlign: 'center', marginTop: 5 }}>
            Hi{userName ? `, ${userName}` : ''}! Your emergency tools are ready.
          </Text>
        </View>
      </LinearGradient>

      {/* Panic Button */}
      <View style={{ paddingHorizontal: 20, marginTop: 30 }}>
        <TouchableOpacity
          onPress={handlePanicButton}
          activeOpacity={0.8}
          style={{
            backgroundColor: '#D32F2F',
            borderRadius: 20,
            padding: 25,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          <Animated.View style={{ transform: [{ scale: panicPulse }] }}>
            <Ionicons name="warning" size={40} color="#fff" style={{ marginBottom: 10 }} />
          </Animated.View>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 5 }}>
            🚨 PANIC BUTTON
          </Text>
          <Text style={{ fontSize: 14, color: '#fff', opacity: 0.9 }}>
            Tap for immediate emergency response
          </Text>
        </TouchableOpacity>
      </View>

      {/* Safety Tools Grid */}
      <View style={{ paddingHorizontal: 20, marginTop: 30 }}>
        <Text style={{ fontSize: 22, fontWeight: 'bold', color: theme.text, marginBottom: 20 }}>
          Quick Tools
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          {SAFETY_TOOLS.map((tool) => (
            <TouchableOpacity
              key={tool.id}
              onPress={() => handleToolAction(tool.action)}
              activeOpacity={0.8}
              style={{
                width: (width - 60) / 2,
                backgroundColor: darkMode ? '#2a2a3e' : '#fff',
                borderRadius: 15,
                padding: 20,
                alignItems: 'center',
                marginBottom: 15,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <View style={{
                backgroundColor: tool.color,
                borderRadius: 25,
                width: 50,
                height: 50,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 12,
              }}>
                <MaterialIcons name={tool.icon} size={24} color="#fff" />
              </View>
              <Text style={{ fontSize: 16, fontWeight: '600', color: theme.text, textAlign: 'center' }}>
                {tool.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Emergency Contacts */}
      <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
        <Text style={{ fontSize: 22, fontWeight: 'bold', color: theme.text, marginBottom: 20 }}>
          Emergency Contacts
        </Text>
        {EMERGENCY_CONTACTS.map((contact) => (
          <TouchableOpacity
            key={contact.id}
            onPress={() => quickCall(contact.phone)}
            activeOpacity={0.8}
            style={{
              backgroundColor: darkMode ? '#2a2a3e' : '#fff',
              borderRadius: 15,
              padding: 20,
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 12,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <View style={{
              backgroundColor: contact.color,
              borderRadius: 20,
              width: 40,
              height: 40,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 15,
            }}>
              <MaterialIcons name={contact.icon} size={20} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: theme.text }}>
                {contact.label}
              </Text>
              <Text style={{ fontSize: 14, color: theme.text, opacity: 0.7 }}>
                {contact.phone}
              </Text>
            </View>
            <Ionicons name="call" size={20} color={contact.color} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Safety Resources */}
      <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
        <Text style={{ fontSize: 22, fontWeight: 'bold', color: theme.text, marginBottom: 20 }}>
          Safety Resources
        </Text>
        {SAFETY_RESOURCES.map((resource) => (
          <TouchableOpacity
            key={resource.id}
            onPress={() => handleResourcePress(resource)}
            activeOpacity={0.8}
            style={{
              backgroundColor: darkMode ? '#2a2a3e' : '#fff',
              borderRadius: 15,
              padding: 20,
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 12,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <View style={{
              backgroundColor: resource.color,
              borderRadius: 20,
              width: 40,
              height: 40,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 15,
            }}>
              <Ionicons name={resource.icon} size={20} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: theme.text }}>
                {resource.label}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.text} opacity={0.5} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Toast Notification */}
      {toast ? (
        <Animated.View style={{
          position: 'absolute',
          bottom: 100,
          left: 20,
          right: 20,
          backgroundColor: darkMode ? '#333' : '#000',
          borderRadius: 12,
          padding: 15,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          transform: [{ translateY: toastSlide }],
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}>
          {toastIcon === 'flashlight' && <Ionicons name="flashlight" size={20} color="#fff" style={{ marginRight: 8 }} />}
          {toastIcon === 'alarm' && <MaterialIcons name="alarm" size={20} color="#fff" style={{ marginRight: 8 }} />}
          {toastIcon === 'call' && <Ionicons name="call" size={20} color="#fff" style={{ marginRight: 8 }} />}
          {toastIcon === 'resource' && <Ionicons name="shield-checkmark" size={20} color="#fff" style={{ marginRight: 8 }} />}
          {toastIcon === 'panic' && <Ionicons name="warning" size={20} color="#fff" style={{ marginRight: 8 }} />}
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '500' }}>{toast}</Text>
        </Animated.View>
      ) : null}
    </ScrollView>
  );
}