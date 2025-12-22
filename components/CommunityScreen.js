import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { useNavigation, useTheme } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, ImageBackground, Linking, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { communityScreenStyles as styles } from '../styles/CommunityScreenStyles';

const backgroundImg = require('../assets/images/splash-icon.png');

const SAFETY_GROUPS = [
  { id: 1, name: 'Women Safety Network Delhi', members: 1250, type: 'Local Group', icon: '👥', color: '#E91E63' },
  { id: 2, name: 'Night Walkers Safety Club', members: 890, type: 'Walking Group', icon: '🚶‍♀️', color: '#9C27B0' },
  { id: 3, name: 'Campus Safety Alliance', members: 2100, type: 'Student Group', icon: '🎓', color: '#3F51B5' },
  { id: 4, name: 'Working Women Support', members: 1650, type: 'Professional', icon: '💼', color: '#FF9800' },
];

const SAFE_SPACES = [
  { id: 1, name: 'Central Police Station', type: 'Police', distance: '0.8 km', icon: '🚔', color: '#2196F3' },
  { id: 2, name: 'City Hospital Emergency', type: 'Hospital', distance: '1.2 km', icon: '🏥', color: '#4CAF50' },
  { id: 3, name: '24/7 Pharmacy Plus', type: 'Pharmacy', distance: '0.5 km', icon: '💊', color: '#FF5722' },
  { id: 4, name: 'Metro Station Security', type: 'Transport', distance: '0.3 km', icon: '🚇', color: '#607D8B' },
];

const COMMUNITY_ALERTS = [
  { id: 1, type: 'warning', title: 'Avoid Main Street after 9 PM', time: '2 hours ago', severity: 'medium' },
  { id: 2, type: 'info', title: 'New street lights installed on Park Avenue', time: '5 hours ago', severity: 'low' },
  { id: 3, type: 'urgent', title: 'Self-defense workshop this Saturday', time: '1 day ago', severity: 'high' },
];

export default function CommunityScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const [currentLocation, setCurrentLocation] = useState(null);
  const [reportText, setReportText] = useState('');
  const [showReportForm, setShowReportForm] = useState(false);
  const [showToast, setShowToast] = useState('');
  const [showEmergencyContacts, setShowEmergencyContacts] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const headerFade = useRef(new Animated.Value(0)).current;
  const contentFade = useRef(new Animated.Value(0)).current;
  const reportFormAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animations
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
    
    Animated.stagger(200, [
      Animated.timing(headerFade, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(contentFade, { toValue: 1, duration: 600, useNativeDriver: true }),
    ]).start();

    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setCurrentLocation(location.coords);
      }
    } catch (error) {
      // Error getting location
    }
  };

  const showToastMessage = (msg) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowToast(msg);
    setTimeout(() => setShowToast(''), 2500);
  };

  const handleJoinGroup = (group) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    showToastMessage(`Joining ${group.name}...`);
  };

  const handleCallSafeSpace = (space) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    showToastMessage(`Calling ${space.name}...`);
    // In a real app, you would make the actual call
    // Linking.openURL(`tel:${space.phone}`);
  };

  const toggleReportForm = () => {
    setShowReportForm(!showReportForm);
    Animated.timing(reportFormAnim, {
      toValue: showReportForm ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const submitReport = () => {
    if (reportText.trim()) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      showToastMessage('Safety report submitted successfully!');
      setReportText('');
      toggleReportForm();
    } else {
      showToastMessage('Please enter a report description');
    }
  };

  const EMERGENCY_CONTACTS = [
    { 
      id: 1, 
      name: 'Women Helpline', 
      number: '1091', 
      description: '24/7 helpline for women in distress',
      icon: 'female',
      color: '#E91E63'
    },
    { 
      id: 2, 
      name: 'Police', 
      number: '100', 
      description: 'Emergency police assistance',
      icon: 'police-badge',
      color: '#3F51B5'
    },
    { 
      id: 3, 
      name: 'Ambulance', 
      number: '102', 
      description: 'Medical emergency services',
      icon: 'ambulance',
      color: '#F44336'
    },
    { 
      id: 4, 
      name: 'Disaster Management', 
      number: '108', 
      description: 'Emergency response services',
      icon: 'alert-circle',
      color: '#FF9800'
    },
    { 
      id: 5, 
      name: 'Domestic Violence', 
      number: '181', 
      description: 'Women in distress helpline',
      icon: 'home',
      color: '#9C27B0'
    },
    { 
      id: 6, 
      name: 'Child Helpline', 
      number: '1098', 
      description: '24/7 helpline for children',
      icon: 'child-care',
      color: '#00BCD4'
    },
  ];

  const handleEmergencyCall = (number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Linking.openURL(`tel:${number}`);
  };

  const getAlertColor = (severity) => {
    switch (severity) {
      case 'high': return '#F44336';
      case 'medium': return '#FF9800';
      case 'low': return '#4CAF50';
      default: return colors.primary;
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'warning': return 'warning';
      case 'urgent': return 'alert-circle';
      case 'info': return 'information-circle';
      default: return 'notifications';
    }
  };

  return (
    <ImageBackground source={backgroundImg} style={styles.bgImage} resizeMode="cover">
      <View style={styles.overlay} pointerEvents="none" />
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { backgroundColor: 'transparent', minHeight: Dimensions.get('window').height },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {showToast ? (
          <Animated.View style={[styles.toast, { backgroundColor: colors.primary }]}>
            <Text style={styles.toastText}>{showToast}</Text>
          </Animated.View>
        ) : null}

        {/* Header Section */}
        <Animated.View style={[styles.headerSection, { opacity: headerFade }]}>
          <View style={[styles.headerCard, { backgroundColor: colors.card }]}>
            <FontAwesome name="users" size={48} color={colors.primary} style={{ marginBottom: 8 }} />
            <Text style={[styles.headerTitle, { color: colors.primary }]}>Community Safety Hub</Text>
            <Text style={[styles.headerSubtitle, { color: colors.text }]}>
              Connect, protect, and support your local community
            </Text>
          </View>
        </Animated.View>

        {/* Content Section */}
        <Animated.View style={[styles.contentSection, { opacity: contentFade }]}>
          
          {/* Quick Actions */}
          <View style={[styles.sectionCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>Quick Actions</Text>
            <View style={styles.quickActionsRow}>
              <Pressable
                style={[styles.quickActionButton, { backgroundColor: '#E91E63' }]}
                onPress={() => navigation.navigate('SafetyTips', { category: 'community' })}
                android_ripple={{ color: '#fff' }}
              >
                <Ionicons name="bulb" size={24} color="#fff" />
                <Text style={styles.quickActionText}>Safety Tips</Text>
              </Pressable>
              
              <Pressable
                style={[styles.quickActionButton, { backgroundColor: '#4CAF50' }]}
                onPress={toggleReportForm}
                android_ripple={{ color: '#fff' }}
              >
                <Ionicons name="flag" size={24} color="#fff" />
                <Text style={styles.quickActionText}>Report Issue</Text>
              </Pressable>
              
              <Pressable
                style={[styles.quickActionButton, { backgroundColor: '#FF9800' }]}
                onPress={() => setShowEmergencyContacts(true)}
                android_ripple={{ color: '#fff' }}
              >
                <Ionicons name="call" size={24} color="#fff" />
                <Text style={styles.quickActionText}>Emergency</Text>
              </Pressable>
            </View>
          </View>

          {/* Report Form */}
          {showReportForm && (
            <Animated.View style={[
              styles.reportForm, 
              { backgroundColor: colors.card, opacity: reportFormAnim }
            ]}>
              <Text style={[styles.sectionTitle, { color: colors.primary }]}>Report Safety Issue</Text>
              <TextInput
                style={[styles.reportInput, { 
                  borderColor: colors.border, 
                  color: colors.text,
                  backgroundColor: colors.background 
                }]}
                placeholder="Describe the safety concern..."
                placeholderTextColor={colors.text + '80'}
                value={reportText}
                onChangeText={setReportText}
                multiline
                numberOfLines={4}
              />
              <View style={styles.reportButtons}>
                <Pressable
                  style={[styles.reportButton, { backgroundColor: colors.primary }]}
                  onPress={submitReport}
                >
                  <Text style={styles.reportButtonText}>Submit Report</Text>
                </Pressable>
                <Pressable
                  style={[styles.reportButton, { backgroundColor: '#666' }]}
                  onPress={toggleReportForm}
                >
                  <Text style={styles.reportButtonText}>Cancel</Text>
                </Pressable>
              </View>
            </Animated.View>
          )}

          {/* Community Alerts */}
          <View style={[styles.sectionCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>Community Alerts</Text>
            {COMMUNITY_ALERTS.map((alert) => (
              <View key={alert.id} style={[styles.alertItem, { borderLeftColor: getAlertColor(alert.severity) }]}>
                <View style={styles.alertHeader}>
                  <Ionicons 
                    name={getAlertIcon(alert.type)} 
                    size={20} 
                    color={getAlertColor(alert.severity)} 
                  />
                  <Text style={[styles.alertTime, { color: colors.text }]}>{alert.time}</Text>
                </View>
                <Text style={[styles.alertTitle, { color: colors.text }]}>{alert.title}</Text>
              </View>
            ))}
          </View>

          {/* Safety Groups */}
          <View style={[styles.sectionCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>Local Safety Groups</Text>
            {SAFETY_GROUPS.map((group) => (
              <Pressable
                key={group.id}
                style={[styles.groupItem, { backgroundColor: colors.background }]}
                onPress={() => handleJoinGroup(group)}
                android_ripple={{ color: group.color + '30' }}
              >
                <View style={[styles.groupIcon, { backgroundColor: group.color }]}>
                  <Text style={styles.groupIconText}>{group.icon}</Text>
                </View>
                <View style={styles.groupInfo}>
                  <Text style={[styles.groupName, { color: colors.text }]}>{group.name}</Text>
                  <Text style={[styles.groupDetails, { color: colors.text }]}>
                    {group.type} • {group.members} members
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.text} />
              </Pressable>
            ))}
          </View>

          {/* Nearby Safe Spaces */}
          <View style={[styles.sectionCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>Nearby Safe Spaces</Text>
            {SAFE_SPACES.map((space) => (
              <Pressable
                key={space.id}
                style={[styles.spaceItem, { backgroundColor: colors.background }]}
                onPress={() => handleCallSafeSpace(space)}
                android_ripple={{ color: space.color + '30' }}
              >
                <View style={[styles.spaceIcon, { backgroundColor: space.color }]}>
                  <Text style={styles.spaceIconText}>{space.icon}</Text>
                </View>
                <View style={styles.spaceInfo}>
                  <Text style={[styles.spaceName, { color: colors.text }]}>{space.name}</Text>
                  <Text style={[styles.spaceDetails, { color: colors.text }]}>
                    {space.type} • {space.distance} away
                  </Text>
                </View>
                <View style={styles.spaceActions}>
                  <Ionicons name="call" size={20} color={space.color} />
                  <Ionicons name="navigate" size={20} color={space.color} style={{ marginLeft: 8 }} />
                </View>
              </Pressable>
            ))}
          </View>

          {/* Buddy System */}
          <View style={[styles.sectionCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>Safety Buddy System</Text>
            <View style={styles.buddySystem}>
              <View style={styles.buddyInfo}>
                <Ionicons name="people" size={32} color={colors.primary} />
                <Text style={[styles.buddyTitle, { color: colors.text }]}>Find a Safety Buddy</Text>
                <Text style={[styles.buddyDescription, { color: colors.text }]}>
                  Connect with other women in your area for walking, traveling, or emergency support
                </Text>
              </View>
              <Pressable
                style={[styles.buddyButton, { backgroundColor: colors.primary }]}
                onPress={() => showToastMessage('Buddy matching feature coming soon!')}
              >
                <Text style={styles.buddyButtonText}>Find Buddy</Text>
              </Pressable>
            </View>
          </View>

          {/* Community Stats */}
          <View style={[styles.sectionCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>Community Impact</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: '#4CAF50' }]}>5,890</Text>
                <Text style={[styles.statLabel, { color: colors.text }]}>Active Members</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: '#2196F3' }]}>1,234</Text>
                <Text style={[styles.statLabel, { color: colors.text }]}>Safety Reports</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: '#FF9800' }]}>89</Text>
                <Text style={[styles.statLabel, { color: colors.text }]}>Safe Spaces</Text>
              </View>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Emergency Contacts Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showEmergencyContacts}
        onRequestClose={() => setShowEmergencyContacts(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.primary }]}>
                Emergency Contacts
              </Text>
              <Pressable 
                onPress={() => setShowEmergencyContacts(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </Pressable>
            </View>
            
            <ScrollView style={styles.contactsList}>
              {EMERGENCY_CONTACTS.map((contact) => (
                <View 
                  key={contact.id} 
                  style={[styles.contactCard, { borderLeftColor: contact.color }]}
                >
                  <View style={styles.contactInfo}>
                    <View style={[styles.contactIcon, { backgroundColor: `${contact.color}20` }]}>
                      <Ionicons name={contact.icon} size={24} color={contact.color} />
                    </View>
                    <View style={styles.contactDetails}>
                      <Text style={[styles.contactName, { color: colors.text }]}>
                        {contact.name}
                      </Text>
                      <Text style={[styles.contactNumber, { color: colors.text }]}>
                        {contact.number}
                      </Text>
                      <Text style={[styles.contactDesc, { color: colors.text }]}>
                        {contact.description}
                      </Text>
                    </View>
                  </View>
                  <Pressable
                    onPress={() => handleEmergencyCall(contact.number)}
                    style={[styles.callButton, { backgroundColor: contact.color }]}
                    android_ripple={{ color: 'rgba(255,255,255,0.3)' }}
                  >
                    <Ionicons name="call" size={20} color="#fff" />
                  </Pressable>
                </View>
              ))}
            </ScrollView>
            
            <View style={styles.modalFooter}>
              <Text style={[styles.emergencyNote, { color: colors.text }]}>
                In case of emergency, tap any contact to call immediately
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
}



