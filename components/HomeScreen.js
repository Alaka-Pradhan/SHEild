import { FontAwesome, Ionicons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useTheme } from '@react-navigation/native';
import { Audio } from 'expo-av';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import * as WebBrowser from 'expo-web-browser';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Dimensions, Image, ImageBackground, Linking, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { homeScreenStyles as baseStyles } from '../styles/HomeScreenStyles';

const styles = {
  ...baseStyles
};

const SAFETY_TIPS = {
  online: [
    '🔒 Use strong, unique passwords for all your accounts.',
    '🚫 Never share personal information with strangers online.',
    '📱 Be cautious of suspicious links and downloads.',
    '👥 Keep your social media profiles private.',
    '💳 Only shop on secure websites (look for HTTPS).',
    '📧 Be wary of phishing emails asking for personal info.',
    '🔐 Enable two-factor authentication on important accounts.',
    '📸 Think twice before sharing photos with location data.',
    '🚨 Report and block cyberbullies or harassers immediately.',
    '💬 Never meet online strangers without telling someone trusted.'
  ],
  physical: [
    '📍 Share your live location with trusted contacts.',
    '🔋 Always keep your phone charged in public places.',
    '🚶‍♀️ Trust your instincts and avoid unsafe areas.',
    '🆘 Use the SOS button in emergencies.',
    '🗺️ Let someone know your travel plans.',
    '📞 Always keep emergency contacts updated.',
    '🚗 Stay alert when walking alone, especially at night.',
    '🔑 Keep your keys ready when approaching your car or home.',
    '👀 Be aware of your surroundings at all times.',
    '🏃‍♀️ If you feel unsafe, go to a crowded, well-lit area.'
  ],
  digital: [
    '📱 Regularly update your apps and operating system.',
    '🔍 Review app permissions and limit unnecessary access.',
    '☁️ Use secure cloud storage with encryption.',
    '📱 Set up remote wipe for your devices.',
    '🔒 Use a VPN on public Wi-Fi networks.',
    '📊 Regularly check your digital footprint.',
    '🗑️ Securely delete sensitive files when disposing devices.',
    '📧 Use encrypted messaging apps for sensitive conversations.',
    '🔐 Store important documents in password-protected files.',
    '⏰ Log out of accounts when using shared devices.'
  ]
};

const CURRENT_TIPS = [...SAFETY_TIPS.online, ...SAFETY_TIPS.physical, ...SAFETY_TIPS.digital];

const CHECKLIST_ITEMS = [
  { key: 'charged', label: 'Phone charged' },
  { key: 'location', label: 'Location sharing ON' },
  { key: 'contacts', label: 'Emergency contacts set' },
  { key: 'sos', label: 'SOS tested' },
  { key: 'notified', label: 'Trusted contacts notified' },
  { key: 'toolkit', label: 'Safety toolkit ready' },
];

const backgroundImg = require('../assets/images/splash-icon.png');

export default function HomeScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const [userName, setUserName] = useState('');
  const [locationSharing, setLocationSharing] = useState(true);
  const [inDangerZone, setInDangerZone] = useState(false);
  const [mapRegion, setMapRegion] = useState({
    latitude: 20.5937,  // Default to India's center
    longitude: 78.9629,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [recentActivity, setRecentActivity] = useState([
    { id: '1', type: 'sos', message: 'SOS triggered at 10:32 AM' },
    { id: '2', type: 'alert', message: 'Entered safe zone at 9:15 AM' },
  ]);
  const [tipIndex, setTipIndex] = useState(0);
  const [currentTipCategory, setCurrentTipCategory] = useState('online');
  const [showTipCategories, setShowTipCategories] = useState(false);
  const [currentAddress, setCurrentAddress] = useState('');
  const [currentCoords, setCurrentCoords] = useState(null);
  const [checklist, setChecklist] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [showToast, setShowToast] = useState('');
  const [tipFadeAnim] = useState(new Animated.Value(1));
  const [alarmSound, setAlarmSound] = useState(null);
  const [isAlarmPlaying, setIsAlarmPlaying] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState(85);
  const [timeOfDay, setTimeOfDay] = useState('morning');
  const [safetyScore, setSafetyScore] = useState(0);
  const [streakDays, setStreakDays] = useState(7);
  const [isLocationPulse, setIsLocationPulse] = useState(false);
  const [quickActionsExpanded, setQuickActionsExpanded] = useState(false);
  
  
  // Handle map ready event

  // Ref to track if we've shown the danger zone alert
  const dangerZoneEntered = useRef(false);

  // Open map in device's default map application
  const openMap = async () => {
    if (!currentCoords) return;
    
    const { latitude, longitude } = currentCoords;
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    
    try {
      await WebBrowser.openBrowserAsync(url);
    } catch (error) {
      // Error opening map
    }
  };

  // Render map preview
  const renderMap = () => {
    if (!currentCoords) return null;
    
    const { latitude, longitude } = currentCoords;
    const region = {
      latitude,
      longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01 * (Dimensions.get('window').width / Dimensions.get('window').height),
    };
    
    return (
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          initialRegion={region}
          showsUserLocation={true}
          showsMyLocationButton={true}
          showsCompass={true}
          zoomEnabled={true}
          scrollEnabled={true}
          rotateEnabled={true}
        >
          <Marker
            coordinate={{
              latitude: latitude,
              longitude: longitude,
            }}
            title="Your Location"
            description="You are here"
          />
        </MapView>
        <Pressable 
          onPress={openMap} 
          style={styles.mapButton}
        >
          <Text style={[styles.coordinatesText, { color: colors.text }]}>
            {latitude?.toFixed(6)}, {longitude?.toFixed(6)}
          </Text>
          <Text style={[styles.mapButtonText, { color: colors.primary }]}>
            Open in Google Maps
          </Text>
        </Pressable>
      </View>
    );
  };

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const sosPulse = useRef(new Animated.Value(1)).current;
  const dangerAnim = useRef(new Animated.Value(1)).current;
  const welcomeFade = useRef(new Animated.Value(0)).current;
  const quickFade = useRef(new Animated.Value(0)).current;
  const statusFade = useRef(new Animated.Value(0)).current;
  const activityFade = useRef(new Animated.Value(0)).current;
  const checklistFade = useRef(new Animated.Value(0)).current;

  const buttonScale = useRef(new Animated.Value(1)).current;
  const cardScale = useRef(new Animated.Value(1)).current;
  const tipScale = useRef(new Animated.Value(1)).current;
  const panicScale = useRef(new Animated.Value(1)).current;
  const panicPulse = useRef(new Animated.Value(1)).current;
  const batteryAnim = useRef(new Animated.Value(0)).current;
  const scoreAnim = useRef(new Animated.Value(0)).current;
  const streakAnim = useRef(new Animated.Value(0)).current;
  const locationPulseAnim = useRef(new Animated.Value(1)).current;
  const quickActionsAnim = useRef(new Animated.Value(0)).current;
  const floatingButtonAnim = useRef(new Animated.Value(0)).current;

  // Request location permissions and get current location
  const requestLocationPermission = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return;
      }
      
      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      });
      
      setCurrentCoords(location.coords);
      
      // Update map region to current location
      setMapRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
      
      // Get address from coordinates
      let address = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      
      if (address.length > 0) {
        const { street, name, city, region, country } = address[0];
        const addressStr = [street, name, city, region, country].filter(Boolean).join(', ');
        setCurrentAddress(addressStr || 'Location available');
      }
    } catch (error) {
      // Error getting location
    }
  };

  useEffect(() => {
    // Request location permission when component mounts
    requestLocationPermission();
    
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
    Animated.stagger(200, [
      Animated.timing(welcomeFade, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(quickFade, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(statusFade, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(activityFade, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(checklistFade, { toValue: 1, duration: 600, useNativeDriver: true }),
    ]).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(sosPulse, { toValue: 1.1, duration: 600, useNativeDriver: true }),
        Animated.timing(sosPulse, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    ).start();
    
    // Initialize interactive animations
    initializeInteractiveElements();
  }, []);

  useEffect(() => {
    if (inDangerZone) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(dangerAnim, { toValue: 1.2, duration: 400, useNativeDriver: true }),
          Animated.timing(dangerAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        ])
      ).start();
    } else {
      dangerAnim.setValue(1);
    }
  }, [inDangerZone]);

  useEffect(() => {
    const loadUser = async () => {
      const profile = await AsyncStorage.getItem('userProfile');
      if (profile) {
        try {
          const parsed = JSON.parse(profile);
          setUserName(parsed.name || '');
        } catch {}
      }
    };
    loadUser();
    
    // Load alarm sound
    loadAlarmSound();
    
    // Set up dynamic content
    updateTimeOfDay();
    calculateSafetyScore();
    
    // Update battery level periodically
    const batteryInterval = setInterval(() => {
      setBatteryLevel(prev => Math.max(20, prev + (Math.random() > 0.5 ? 1 : -1)));
    }, 30000);
    
    return () => clearInterval(batteryInterval);
  }, []);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (alarmSound) {
        alarmSound.unloadAsync().catch(() => {});
      }
    };
  }, [alarmSound]);

  const loadAlarmSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('../assets/sounds/alarm.mp3')
      );
      await sound.setIsLoopingAsync(true);
      setAlarmSound(sound);
    } catch (error) {
      // Error loading alarm sound
    }
  };

  const initializeInteractiveElements = () => {
    // Animate battery level
    Animated.timing(batteryAnim, {
      toValue: batteryLevel,
      duration: 1000,
      useNativeDriver: false,
    }).start();
    
    // Animate safety score
    Animated.timing(scoreAnim, {
      toValue: safetyScore,
      duration: 1500,
      useNativeDriver: false,
    }).start();
    
    // Animate streak counter
    Animated.timing(streakAnim, {
      toValue: streakDays,
      duration: 1200,
      useNativeDriver: false,
    }).start();
    
    // Floating button animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatingButtonAnim, { toValue: 10, duration: 2000, useNativeDriver: true }),
        Animated.timing(floatingButtonAnim, { toValue: -10, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  };

  const updateTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) setTimeOfDay('morning');
    else if (hour < 17) setTimeOfDay('afternoon');
    else setTimeOfDay('evening');
  };

  const calculateSafetyScore = () => {
    let score = 0;
    if (locationSharing) score += 25;
    if (Object.keys(checklist).filter(key => checklist[key]).length >= 3) score += 25;
    if (batteryLevel > 50) score += 25;
    score += Math.min(25, streakDays * 3);
    setSafetyScore(score);
  };

  const triggerLocationPulse = () => {
    setIsLocationPulse(true);
    Animated.sequence([
      Animated.timing(locationPulseAnim, { toValue: 1.3, duration: 200, useNativeDriver: true }),
      Animated.timing(locationPulseAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start(() => setIsLocationPulse(false));
  };

  const toggleQuickActions = () => {
    const toValue = quickActionsExpanded ? 0 : 1;
    setQuickActionsExpanded(!quickActionsExpanded);
    Animated.spring(quickActionsAnim, {
      toValue,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const getGreeting = () => {
    const greetings = {
      morning: '🌅 Good Morning',
      afternoon: '☀️ Good Afternoon', 
      evening: '🌙 Good Evening'
    };
    return greetings[timeOfDay];
  };

  const getSafetyScoreColor = () => {
    if (safetyScore >= 80) return '#4BB543';
    if (safetyScore >= 60) return '#FFA500';
    return '#FF6B6B';
  };

  const getBatteryColor = () => {
    if (batteryLevel > 50) return '#4BB543';
    if (batteryLevel > 20) return '#FFA500';
    return '#FF6B6B';
  };

  useEffect(() => {
    const getCurrentLocation = async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          const errorMsg = 'Permission to access location was denied';
          setShowToast(errorMsg);
          return;
        }

        let location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High
        });
        
        const coords = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };
        
        setCurrentCoords(coords);
        setMapRegion(coords);

        // Reverse geocode to get address
        let address = await Location.reverseGeocodeAsync({
          latitude: coords.latitude,
          longitude: coords.longitude,
        });

        if (address && address[0]) {
          const { street, city, region, country } = address[0];
          const addressString = `${street || ''}${street && (city || region) ? ', ' : ''}${city || ''}${(street || city) && region ? ', ' : ''}${region || ''}${(street || city || region) && country ? ', ' : ''}${country || ''}`;
          setCurrentAddress(addressString);
        }
      } catch (error) {
        setShowToast('Error getting location');
      }
    };
    getCurrentLocation();
    calculateSafetyScore();
  }, [locationSharing, checklist, batteryLevel]);

  const animateButtonPress = (callback) => {
    Animated.sequence([
      Animated.timing(buttonScale, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(buttonScale, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    callback();
  };

  const animateCardPress = (callback) => {
    Animated.sequence([
      Animated.timing(cardScale, { toValue: 0.98, duration: 100, useNativeDriver: true }),
      Animated.timing(cardScale, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    callback();
  };

  const handleSOS = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setRecentActivity([
      { id: Date.now().toString(), type: 'sos', message: 'SOS triggered!' },
      ...recentActivity,
    ]);
    setShowToast('SOS sent!');
    setTimeout(() => setShowToast(''), 2000);
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
        Animated.timing(panicPulse, { toValue: 1.2, duration: 300, useNativeDriver: true }),
        Animated.timing(panicPulse, { toValue: 1, duration: 300, useNativeDriver: true }),
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

    setShowToast('🚨 PANIC MODE ACTIVATED!');
    setTimeout(() => setShowToast(''), 3000);
    
    Alert.alert(
      '🚨 PANIC MODE',
      'Emergency actions activated:\n\n• Loud alarm triggered\n• Location shared with emergency contacts\n• Emergency call to 112 initiated\n• Evidence recording started',
      [
        { text: 'Call 112', onPress: () => Linking.openURL('tel:112') },
        { text: 'Share Location', onPress: () => copyAddress() },{ text: 'Stop Alarm', onPress: async () => {
            panicPulse.stopAnimation();
            panicPulse.setValue(1);
            // Stop the alarm sound
            if (alarmSound && isAlarmPlaying) {
              try {
                await alarmSound.stopAsync();
                await alarmSound.setPositionAsync(0);
                setIsAlarmPlaying(false);
                setShowToast('Alarm stopped');
                setTimeout(() => setShowToast(''), 2000);
              } catch (error) {
                setShowToast('Error stopping alarm');
                setTimeout(() => setShowToast(''), 2000);
              }
            } else {
              setShowToast('No alarm playing');
              setTimeout(() => setShowToast(''), 2000);
            }
        }},
        { text: 'OK', style: 'cancel' }
      ]
    );
  };

  const toggleLocation = async () => {
    animateCardPress(() => {
      setLocationSharing((prev) => !prev);
      setShowToast(locationSharing ? 'Location sharing OFF' : 'Location sharing ON');
      setTimeout(() => setShowToast(''), 2000);
    });
  };

  const handleDeleteActivity = (id) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setRecentActivity(recentActivity.filter((item) => item.id !== id));
    setShowToast('Activity deleted');
    setTimeout(() => setShowToast(''), 1500);
  };

  const toggleChecklist = async (key) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
    const isChecked = !checklist[key];
    setShowToast(isChecked ? '✓ Completed' : '○ Unchecked');
    setTimeout(() => setShowToast(''), 1000);
  };

  const showToastMessage = (msg) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowToast(msg);
    setTimeout(() => setShowToast(''), 2000);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTimeout(() => setRefreshing(false), 1000);
    setShowToast('Refreshed!');
    setTimeout(() => setShowToast(''), 1000);
  };

  const nextTip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const currentCategoryTips = SAFETY_TIPS[currentTipCategory];
    Animated.sequence([
      Animated.timing(tipFadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(tipFadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start(() => setTipIndex((prev) => (prev + 1) % currentCategoryTips.length));
  };

  const switchTipCategory = (category) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCurrentTipCategory(category);
    setTipIndex(0);
    setShowTipCategories(false);
    showToastMessage(`Switched to ${category} safety tips`);
  };

  const getCategoryIcon = (category) => {
    const icons = {
      online: '🌐',
      physical: '🚶‍♀️',
      digital: '📱'
    };
    return icons[category] || '💡';
  };

  const getCategoryName = (category) => {
    const names = {
      online: 'Online Safety',
      physical: 'Physical Safety',
      digital: 'Digital Privacy'
    };
    return names[category] || 'Safety Tips';
  };

  const copyAddress = async () => {
    if (currentAddress) {
      await Clipboard.setStringAsync(currentAddress);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setShowToast('Address copied!');
      setTimeout(() => setShowToast(''), 1500);
    }
  };

  // Create animated values for each checkbox item
  const checkboxAnims = useRef(
    CHECKLIST_ITEMS.reduce((acc, item) => {
      acc[item.key] = new Animated.Value(0);
      return acc;
    }, {})
  ).current;

  // Update checkbox animations when checklist changes
  useEffect(() => {
    CHECKLIST_ITEMS.forEach(item => {
      const isChecked = !!checklist[item.key];
      Animated.spring(checkboxAnims[item.key], {
        toValue: isChecked ? 1 : 0,
        useNativeDriver: true,
        friction: 8,
        tension: 40,
      }).start();
    });
  }, [checklist]);



  return (
    <ImageBackground source={backgroundImg} style={styles.bgImage} resizeMode="cover">
      <View style={styles.overlay} pointerEvents="none" />
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { 
            backgroundColor: 'transparent', 
            minHeight: Dimensions.get('window').height 
          }
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {showToast ? (
          <Animated.View style={styles.toast}>
            <Text style={styles.toastText}>{showToast}</Text>
          </Animated.View>
        ) : null}
        <Animated.View style={[styles.welcomeSection, { opacity: welcomeFade }]}> 
          <Image source={require('../assets/images/icon.png')} style={styles.logo} resizeMode="contain" />
          <Text style={[styles.welcomeText, { color: colors.primary }]}>{getGreeting()}{userName ? `, ${userName}` : ''}!</Text>
        </Animated.View>
        
        {/* Interactive Stats Row */}
        <Animated.View style={{ opacity: welcomeFade }}>
          <View style={styles.statsRow}>
            <Pressable style={[styles.statCard, { backgroundColor: getSafetyScoreColor() }]} onPress={() => showToastMessage(`Safety Score: ${safetyScore}/100`)}>
              <Text style={styles.statNumber}>{safetyScore}</Text>
              <Text style={styles.statLabel}>Safety Score</Text>
            </Pressable>
            <Pressable style={[styles.statCard, { backgroundColor: getBatteryColor() }]} onPress={() => showToastMessage(`Battery: ${batteryLevel}%`)}>
              <Text style={styles.statNumber}>{batteryLevel}%</Text>
              <Text style={styles.statLabel}>Battery</Text>
            </Pressable>
            <Pressable style={[styles.statCard, { backgroundColor: '#7B3FA0' }]} onPress={() => showToastMessage(`${streakDays} days safety streak!`)}>
              <Text style={styles.statNumber}>{streakDays}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </Pressable>
          </View>
        </Animated.View>
        
        {/* Safety Tips Section */}
        <Animated.View style={{ opacity: tipFadeAnim }}>
          <View style={[styles.activityCard, { backgroundColor: colors.card }]}>
            {/* Tip Category Header */}
            <Pressable 
              style={[styles.tipCategoryHeader, { backgroundColor: colors.primary }]}
              onPress={() => setShowTipCategories(!showTipCategories)}
              android_ripple={{ color: '#fff' }}
            >
              <Text style={styles.tipCategoryText}>
                {getCategoryIcon(currentTipCategory)} {getCategoryName(currentTipCategory)}
              </Text>
              <Ionicons 
                name={showTipCategories ? 'chevron-up' : 'chevron-down'} 
                size={20} 
                color="#fff" 
              />
            </Pressable>
            
            {/* Category Selection */}
            {showTipCategories && (
              <View style={styles.tipCategoriesContainer}>
                {Object.keys(SAFETY_TIPS).map((category) => (
                  <Pressable
                    key={category}
                    style={[
                      styles.tipCategoryItem,
                      currentTipCategory === category && { backgroundColor: colors.primary + '20' }
                    ]}
                    onPress={() => switchTipCategory(category)}
                    android_ripple={{ color: colors.primary }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={[styles.tipCategoryItemText, { color: colors.text }]}>
                        {getCategoryIcon(category)} {getCategoryName(category)}
                      </Text>
                      <Text style={[styles.tipCategoryCount, { color: colors.text }]}>
                        {SAFETY_TIPS[category].length} tips
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            )}
            
            {/* Current Tip Display */}
            <Pressable onPress={nextTip}>
              <Animated.View style={[styles.tipBox, { backgroundColor: colors.card, borderColor: colors.primary, opacity: tipFadeAnim, transform: [{ scale: tipScale }] }]}> 
                <Text style={[styles.tipText, { color: colors.primary }]}>
                  {SAFETY_TIPS[currentTipCategory][tipIndex]}
                </Text>
                <View style={styles.tipFooter}>
                  <Text style={[styles.tipSubtext, { color: colors.primary }]}>Tap for next tip</Text>
                  <Text style={[styles.tipCounter, { color: colors.primary }]}>
                    {tipIndex + 1}/{SAFETY_TIPS[currentTipCategory].length}
                  </Text>
                </View>
              </Animated.View>
            </Pressable>
          </View>
        </Animated.View>
        {/* Enhanced Panic Button */}
        <Animated.View style={{ opacity: quickFade }}>
          <Animated.View style={{ transform: [{ scale: panicScale }] }}>
            <Pressable
              style={styles.panicButton}
              onPress={() => animateButtonPress(handlePanicButton)}
              android_ripple={{ color: '#fff' }}
            >
              <Animated.View style={{ transform: [{ scale: panicPulse }] }}>
                <Ionicons name="warning" size={36} color="#fff" />
              </Animated.View>
              <View>
                <Text style={styles.panicButtonText}>🚨 PANIC BUTTON</Text>
                <Text style={styles.panicSubText}>Tap for emergency actions</Text>
              </View>
            </Pressable>
          </Animated.View>
        </Animated.View>
        <Animated.View style={{ opacity: statusFade }}>
          <Animated.View style={[styles.statusCard, { backgroundColor: colors.card }]}> 
            <Pressable style={styles.statusRow} onPress={toggleLocation}>
              <Animated.View style={{ transform: [{ scale: isLocationPulse ? locationPulseAnim : 1 }] }}>
                <Ionicons name={locationSharing ? 'location' : 'location-off'} size={22} color={locationSharing ? '#7B3FA0' : '#ccc'} style={{ marginRight: 8 }} />
              </Animated.View>
              <Text style={[styles.statusText, { color: colors.text }]}>{locationSharing ? 'Location sharing ON' : 'Location sharing OFF'}</Text>
              <View style={[styles.statusIndicator, { backgroundColor: locationSharing ? '#4BB543' : '#ccc' }]} />
            </Pressable>
            <Animated.View style={[styles.statusRow, { transform: [{ scale: dangerAnim }] }]}> 
              <Ionicons name={inDangerZone ? 'warning' : 'shield-checkmark'} size={22} color={inDangerZone ? '#B00020' : '#4BB543'} style={{ marginRight: 8 }} />
              <Text style={[styles.statusText, { color: colors.text }]}>{inDangerZone ? 'You are in a danger zone!' : 'You are in a safe area.'}</Text>
            </Animated.View>
            {currentAddress ? (
              <Pressable onPress={copyAddress} style={styles.addressContainer}>
                <View style={styles.addressRow}>
                  <Ionicons name="location-outline" size={16} color={colors.primary} />
                  <Text style={[styles.addressText, { color: colors.text }]}>{currentAddress}</Text>
                  <Ionicons name="copy-outline" size={16} color={colors.primary} />
                </View>
                <Text style={[styles.addressHint, { color: colors.text }]}>Tap to copy address</Text>
              </Pressable>
            ) : null}
            {currentCoords && renderMap()}
          </Animated.View>
        </Animated.View>
        
        {/* Quick Actions Card Block */}
        <Animated.View style={{ opacity: quickFade }}>
          <View style={[styles.activityCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.activityTitle, { color: colors.primary }]}>Quick Actions</Text>
            <View style={styles.quickActionsGrid}>
              <Pressable
                style={[styles.quickActionGridItem, { backgroundColor: '#FF6B6B' }]}
                onPress={() => animateButtonPress(handleSOS)}
                android_ripple={{ color: '#fff' }}
              >
                <Animated.View style={{ transform: [{ scale: sosPulse }] }}>
                  <Ionicons name="alert" size={28} color="#fff" />
                </Animated.View>
                <Text style={styles.quickActionGridText}>SOS Alert</Text>
              </Pressable>
              
              <Pressable 
                style={[styles.quickActionGridItem, { backgroundColor: '#4ECDC4' }]} 
                onPress={() => animateButtonPress(() => navigation.navigate('Toolkit'))}
                android_ripple={{ color: '#fff' }}
              >
                <MaterialIcons name="build" size={28} color="#fff" />
                <Text style={styles.quickActionGridText}>Toolkit</Text>
              </Pressable>
              
              <Pressable 
                style={[styles.quickActionGridItem, { backgroundColor: '#45B7D1' }]} 
                onPress={() => animateButtonPress(() => showToastMessage('Chatbot coming soon!'))}
                android_ripple={{ color: '#fff' }}
              >
                <Ionicons name="chatbubbles" size={28} color="#fff" />
                <Text style={styles.quickActionGridText}>Assistant</Text>
              </Pressable>
              
              <Pressable 
                style={[styles.quickActionGridItem, { backgroundColor: '#96CEB4' }]} 
                onPress={() => animateButtonPress(() => navigation.navigate('Community'))}
                android_ripple={{ color: '#fff' }}
              >
                <FontAwesome name="users" size={28} color="#fff" />
                <Text style={styles.quickActionGridText}>Community</Text>
              </Pressable>
              
              <Pressable 
                style={[styles.quickActionGridItemLong, { backgroundColor: '#9C27B0' }]} 
                onPress={() => animateButtonPress(() => navigation.navigate('Toolkit', { screen: 'SafetyTips' }))}
                android_ripple={{ color: '#fff' }}
              >
                <Ionicons name="bulb" size={28} color="#fff" />
                <Text style={styles.quickActionGridText}>Safety Tips</Text>
              </Pressable>
            </View>
          </View>
        </Animated.View>
        
        <Animated.View style={{ opacity: activityFade }}>
          <View style={[styles.activityCard, { backgroundColor: colors.card }]}> 
            <Text style={[styles.activityTitle, { color: colors.primary }]}>Recent Activity</Text>
            <View>
              {recentActivity.map(item => (
                <Pressable
                  key={item.id}
                  style={styles.activityRow}
                  onLongPress={() => handleDeleteActivity(item.id)}
                  onPress={() => showToastMessage(item.message)}
                  android_ripple={{ color: colors.primary }}
                >
                  {item.type === 'sos' ? (
                    <Ionicons name="alert-circle" size={20} color="#B00020" style={{ marginRight: 8 }} />
                  ) : (
                    <Ionicons name="checkmark-circle" size={20} color="#4BB543" style={{ marginRight: 8 }} />
                  )}
                  <Text style={[styles.activityText, { color: colors.text }]}>{item.message}</Text>
                  <Text style={{ color: '#B00020', marginLeft: 8, fontSize: 12 }}>[Long-press to delete]</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </Animated.View>
        <Animated.View style={{ opacity: checklistFade }}>
          <View style={[styles.activityCard, { backgroundColor: colors.card }]}> 
            <Text style={[styles.activityTitle, { color: colors.primary }]}>Personal Safety Checklist</Text>
            {CHECKLIST_ITEMS.map((item, idx) => {
              return (
                <View key={item.key}>
                  <Pressable
                    style={styles.activityRow}
                    onPress={() => { toggleChecklist(item.key); }}
                    android_ripple={{ color: colors.primary }}
                  >
                    <Animated.View style={{ 
                      transform: [{ 
                        scale: checkboxAnims[item.key].interpolate({
                          inputRange: [0, 1],
                          outputRange: [1, 1.2]
                        })
                      }] 
                    }}>
                      <Ionicons
                        name={checklist[item.key] ? 'checkbox' : 'square-outline'}
                        size={24}
                        color={checklist[item.key] ? '#7B3FA0' : '#ccc'}
                        style={{ marginRight: 8 }}
                      />
                    </Animated.View>
                    <Text style={[styles.activityText, { color: colors.text }]}>{item.label}</Text>
                  </Pressable>
                  {idx < CHECKLIST_ITEMS.length - 1 && <View style={styles.divider} />}
                </View>
              );
            })}
          </View>
        </Animated.View>
      </ScrollView>
      
      {/* Floating Emergency Button */}
      <Animated.View style={[
        styles.floatingButton,
        {
          transform: [
            { translateY: floatingButtonAnim }
          ]
        }
      ]}>
        <Pressable
          style={styles.floatingButtonInner}
          onPress={() => animateButtonPress(() => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            Alert.alert(
              '🆘 Quick Emergency',
              'Choose your emergency action:',
              [
                { text: 'Call 112', onPress: () => Linking.openURL('tel:112') },
                { text: 'Send SOS', onPress: handleSOS },
                { text: 'Panic Mode', onPress: handlePanicButton },
                { text: 'Cancel', style: 'cancel' }
              ]
            );
          })}
          android_ripple={{ color: '#fff' }}
        >
          <Ionicons name="call" size={28} color="#fff" />
        </Pressable>
      </Animated.View>
      
    </ImageBackground>
  );
}

