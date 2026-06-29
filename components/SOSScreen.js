import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import { Audio } from 'expo-av';
import * as Contacts from 'expo-contacts';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import * as SMS from 'expo-sms';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Dimensions,
    Linking,
    Pressable,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    Vibration,
    View
} from 'react-native';
const { width, height } = Dimensions.get('window');
const SHAKE_THRESHOLD = 15;
const EMERGENCY_MESSAGE = "EMERGENCY! I need help! My location: ";

const SOSScreen = () => {
  const { colors } = useTheme();
  const [isActive, setIsActive] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [flashlightOn, setFlashlightOn] = useState(false);
  const [location, setLocation] = useState(null);
  const [lastShake, setLastShake] = useState(0);
  const [sound, setSound] = useState();
  const [shakeSubscription, setShakeSubscription] = useState(null);
  
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const countdownRef = useRef(null);
  const lastUpdate = useRef(0);
  const lastX = useRef(0);
  const lastY = useRef(0);
  const lastZ = useRef(0);

  // Load resources and set up listeners
  useEffect(() => {
    loadEmergencyContacts();
    getLocation();
    loadSound();
    
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
      if (sound) sound.unloadAsync();
    };
  }, []);
  
  // Clean up sound on unmount
  useEffect(() => {
    return sound
      ? () => sound.unloadAsync()
      : undefined;
  }, [sound]);
  
  const loadSound = async () => {
    const { sound } = await Audio.Sound.createAsync(
      require('../assets/sounds/alarm.mp3')
    );
    setSound(sound);
  };
  
  const playSound = async () => {
    if (sound) {
      await sound.setIsLoopingAsync(true);
      await sound.playAsync();
    }
  };
  
  const stopSound = async () => {
    if (sound) {
      await sound.stopAsync();
    }
  };
  
  // Shake detection has been disabled
  
  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      
      const location = await Location.getCurrentPositionAsync({});
      setLocation(location.coords);
    } catch (error) {
      // Error getting location
    }
  };

  const loadEmergencyContacts = async () => {
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status === 'granted') {
        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.PhoneNumbers],
        });
        // Filter contacts with phone numbers
        const emergency = data.filter(contact => 
          contact.phoneNumbers && contact.phoneNumbers.length > 0
        ).slice(0, 3); // Limit to 3 contacts
        setEmergencyContacts(emergency);
      }
    } catch (error) {
      // Error loading contacts
    }
  };

  const startPulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const handleSOSPress = () => {
    if (!isActive) {
      setIsActive(true);
      startPulse();
      Vibration.vibrate(100);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      
      // Start countdown
      let counter = 5;
      setCountdown(counter);
      
      countdownRef.current = setInterval(() => {
        counter--;
        setCountdown(counter);
        
        if (counter <= 0) {
          clearInterval(countdownRef.current);
          triggerEmergency();
        }
      }, 1000);
    }
  };

  const triggerEmergency = async () => {
    try {
      // Play alarm sound
      await playSound();
      
      // Vibrate in a pattern
      Vibration.vibrate([0, 1000, 500, 1000], true);
      
      // Get current location if not available
      if (!location) {
        await getLocation();
      }
      
      let message = EMERGENCY_MESSAGE;
      
      if (location) {
        message += `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
      } else {
        message += "Unknown location";
      }
      
      // Get phone numbers from emergency contacts
      const phoneNumbers = emergencyContacts.flatMap(contact => 
        contact.phoneNumbers.map(phone => phone.number.replace(/[^\d+]/g, ''))
      );

      // Add default emergency numbers if no contacts
      if (phoneNumbers.length === 0) {
        phoneNumbers.push('100', '112');
      }

      // Send SMS
      const isAvailable = await SMS.isAvailableAsync();
      if (isAvailable && phoneNumbers.length > 0) {
        const { result } = await SMS.sendSMSAsync(phoneNumbers, message);
      } else {
        // Fallback to sharing if SMS not available
        await Share.share({
          message: message,
          title: 'Emergency Alert',
        });
      }
      
      // Schedule notification
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Emergency Alert Sent!",
          body: "Help is on the way. Stay calm and find a safe place if possible.",
          data: { data: 'emergency_triggered' },
        },
        trigger: null,
      });
      
    } catch (error) {
      Alert.alert('Error', 'Failed to send emergency message: ' + error.message);
    }
  };

  const cancelEmergency = async () => {
    clearInterval(countdownRef.current);
    setIsActive(false);
    setCountdown(5);
    pulseAnim.setValue(1);
    Vibration.cancel();
    await stopSound();
    
    // Schedule cancellation notification
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Emergency Cancelled",
        body: "The emergency alert has been cancelled.",
        data: { data: 'emergency_cancelled' },
      },
      trigger: null,
    });
  };
  
  const toggleFlashlight = async () => {
    try {
      if (flashlightOn) {
        // Just toggle the state without changing system brightness
        setFlashlightOn(false);
      } else {
        // Inform user that flashlight isn't available
        Alert.alert(
          'Flashlight Not Available',
          'The flashlight feature requires additional permissions. Please use your device\'s flashlight instead.',
          [{ text: 'OK' }]
        );
        setFlashlightOn(false);
      }
    } catch (error) {
      setFlashlightOn(false);
    }
  };
  
  const callEmergency = async (number) => {
    const url = `tel:${number}`;
    const supported = await Linking.canOpenURL(url);
    
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert('Error', 'Phone calls are not supported on this device');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Status Bar */}
        <View style={styles.statusBar}>
          <View style={styles.statusItem}>
            <Ionicons 
              name="location" 
              size={20} 
              color={location ? '#4CAF50' : '#F44336'} 
            />
            <Text style={[styles.statusText, { color: colors.text }]}>
              {location ? 'Location Active' : 'Location Offline'}
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.flashlightButton}
            onPress={toggleFlashlight}
          >
            <Ionicons 
              name={flashlightOn ? 'flash' : 'flash-off'} 
              size={20} 
              color={colors.text} 
            />
          </TouchableOpacity>
        </View>
        
        {/* Main SOS Button */}
        <View style={styles.sosContainer}>
          <Pressable
            onPress={handleSOSPress}
            onLongPress={cancelEmergency}
          >
            {({ pressed }) => (
              <Animated.View 
                style={[
                  styles.sosButton,
                  {
                    transform: [
                      { scale: isActive ? pulseAnim : pressed ? 0.95 : 1 },
                    ],
                    backgroundColor: isActive ? '#ff3b30' : '#ff3b30',
                    shadowColor: isActive ? '#ff3b30' : '#000',
                  },
                ]}
              >
                <Text style={styles.sosText}>
                  {isActive ? countdown : 'SOS'}
                </Text>
                {isActive && (
                  <Text style={styles.sosSubtext}>Emergency in progress</Text>
                )}
              </Animated.View>
            )}
          </Pressable>
          
          <Text style={[styles.instruction, { color: colors.text }]}>
            {isActive 
              ? 'Press and hold to cancel' 
              : 'Press to activate emergency'}
          </Text>
        </View>
        
        {/* Emergency Contacts */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Emergency Contacts
          </Text>
          {emergencyContacts.length > 0 ? (
            emergencyContacts.map((contact, index) => (
              <TouchableOpacity 
                key={index}
                style={[styles.contactCard, { backgroundColor: colors.card }]}
                onPress={() => contact.phoneNumbers?.[0]?.number && callEmergency(contact.phoneNumbers[0].number)}
              >
                <View style={styles.contactInfo}>
                  <Text style={[styles.contactName, { color: colors.text }]}>
                    {contact.name}
                  </Text>
                  <Text style={styles.contactNumber}>
                    {contact.phoneNumbers?.[0]?.number || 'No number'}
                  </Text>
                </View>
                <Ionicons name="call" size={24} color="#4CAF50" />
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.noContacts}>
              <Ionicons name="warning" size={24} color="#FFC107" />
              <Text style={[styles.noContactsText, { color: colors.text }]}>
                No emergency contacts found. Add some in your phone&apos;s contacts.
              </Text>
            </View>
          )}
          
          <TouchableOpacity 
            style={[styles.quickAction, { backgroundColor: colors.card }]}
            onPress={() => callEmergency('100')}
          >
            <View style={styles.quickActionIcon}>
              <MaterialIcons name="local-police" size={24} color="#2196F3" />
            </View>
            <Text style={[styles.quickActionText, { color: colors.text }]}>
              Call Police (100)
            </Text>
            <Ionicons name="chevron-forward" size={20} color={colors.text} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.quickAction, { backgroundColor: colors.card }]}
            onPress={() => callEmergency('112')}
          >
            <View style={styles.quickActionIcon}>
              <MaterialCommunityIcons name="ambulance" size={24} color="#F44336" />
            </View>
            <Text style={[styles.quickActionText, { color: colors.text }]}>
              Medical Emergency (112)
            </Text>
            <Ionicons name="chevron-forward" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
        
        {/* Emergency Instructions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Emergency Instructions
          </Text>
          <View style={[styles.tipCard, { backgroundColor: colors.card }]}>
            <View style={styles.tipIcon}>
              <Ionicons name="alert-circle" size={20} color="#FF5722" />
            </View>
            <Text style={[styles.tipText, { color: colors.text }]}>
              If you&apos;re in danger, press the SOS button or shake your phone to alert your emergency contacts with your location.
            </Text>
          </View>
          
          <View style={[styles.tipCard, { backgroundColor: colors.card }]}>
            <View style={styles.tipIcon}>
              <Ionicons name="information-circle" size={20} color="#2196F3" />
            </View>
            <Text style={[styles.tipText, { color: colors.text }]}>
              Make sure your phone&apos;s location is enabled for accurate tracking.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  flashlightButton: {
    padding: 8,
    borderRadius: 20,
  },
  sosContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  sosButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  sosText: {
    color: 'white',
    fontSize: 48,
    fontWeight: 'bold',
  },
  sosSubtext: {
    color: 'white',
    fontSize: 12,
    marginTop: 8,
    opacity: 0.9,
  },
  instruction: {
    marginTop: 20,
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  contactInfo: {
    flex: 1,
    marginRight: 12,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  contactNumber: {
    fontSize: 14,
    color: '#666',
  },
  noContacts: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#FFF8E1',
    marginBottom: 16,
  },
  noContactsText: {
    marginLeft: 12,
    fontSize: 14,
    flex: 1,
  },
  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  quickActionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  tipCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tipIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
});

export default SOSScreen;
