import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useTheme } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, ImageBackground, Pressable, ScrollView, Text, View } from 'react-native';
import { safetyTipsScreenStyles as styles } from '../styles/SafetyTipsScreenStyles';

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
    '💬 Never meet online strangers without telling someone trusted.',
    '🎯 Be cautious of fake profiles and catfishing attempts.',
    '📝 Review privacy settings on all social media platforms regularly.',
    '🚫 Don\'t click on suspicious pop-ups or advertisements.',
    '💰 Be wary of get-rich-quick schemes and online scams.',
    '🔍 Verify the authenticity of websites before entering personal data.'
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
    '🏃‍♀️ If you feel unsafe, go to a crowded, well-lit area.',
    '🚕 Use trusted ride-sharing apps and verify driver details.',
    '🏠 Install proper lighting around your home entrance.',
    '👥 Walk in groups when possible, especially at night.',
    '📱 Keep emergency numbers on speed dial.',
    '🎒 Don\'t carry large amounts of cash or display expensive items.',
    '🚪 Always lock doors and windows when leaving home.',
    '🔊 Carry a personal alarm or whistle for emergencies.'
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
    '⏰ Log out of accounts when using shared devices.',
    '🔄 Regularly backup important data to secure locations.',
    '📵 Use airplane mode in suspicious Wi-Fi environments.',
    '🛡️ Install reputable antivirus software on all devices.',
    '🔐 Use biometric locks (fingerprint/face) when available.',
    '📱 Enable automatic screen locks with short timeouts.'
  ],
  workplace: [
    '🏢 Report any harassment or inappropriate behavior immediately.',
    '👥 Build relationships with trusted colleagues.',
    '🚪 Know all emergency exits and safety procedures.',
    '📱 Keep your phone accessible during work hours.',
    '🚗 Park in well-lit, secure areas.',
    '⏰ Avoid working alone in the office after hours.',
    '📋 Document any concerning incidents or behaviors.',
    '🔒 Secure your workspace and personal belongings.',
    '👔 Maintain professional boundaries with colleagues.',
    '🆘 Know your company\'s safety and HR policies.',
    '🚶‍♀️ Use the buddy system when working late.',
    '📞 Have security or management contact numbers saved.',
    '💼 Keep personal and professional social media separate.',
    '🎯 Trust your instincts about uncomfortable situations.',
    '📝 Keep records of important work communications.'
  ],
  travel: [
    '✈️ Research your destination\'s safety conditions beforehand.',
    '📱 Share your itinerary with trusted family or friends.',
    '🏨 Stay in reputable accommodations with good reviews.',
    '💳 Use hotel safes for valuables and important documents.',
    '🗺️ Keep copies of important documents in separate locations.',
    '📞 Know local emergency numbers and embassy contacts.',
    '🚕 Use official transportation services and avoid unlicensed taxis.',
    '👥 Stay in groups when exploring unfamiliar areas.',
    '💰 Don\'t flash large amounts of cash or expensive jewelry.',
    '📱 Keep your phone charged and have portable chargers.',
    '🍽️ Be cautious about food and water safety in new locations.',
    '🏃‍♀️ Know the location of nearest hospitals and police stations.',
    '📸 Avoid posting real-time travel updates on social media.',
    '🎒 Keep important items in carry-on luggage when flying.',
    '🔒 Use hotel room locks and security features properly.'
  ],
  financial: [
    '💳 Monitor your bank accounts and credit reports regularly.',
    '🏧 Use ATMs in well-lit, secure locations.',
    '📱 Set up account alerts for all transactions.',
    '🔒 Never share your PIN or passwords with anyone.',
    '📞 Verify suspicious calls from banks or financial institutions.',
    '💰 Be cautious of investment scams and too-good-to-be-true offers.',
    '📧 Don\'t click links in suspicious financial emails.',
    '🛡️ Use secure payment methods for online purchases.',
    '📋 Keep important financial documents in a safe place.',
    '🚫 Never give financial information over unsolicited calls.',
    '💳 Report lost or stolen cards immediately.',
    '🔍 Review monthly statements carefully for unauthorized charges.',
    '📱 Use official banking apps, not third-party services.',
    '🏦 Shred documents containing sensitive financial information.',
    '💼 Consider identity theft protection services.'
  ],
  social: [
    '👥 Build a strong support network of trusted friends.',
    '🗣️ Communicate your boundaries clearly and firmly.',
    '🚫 Don\'t feel obligated to please everyone.',
    '📱 Trust your instincts about people and situations.',
    '🍷 Be cautious about alcohol consumption in social settings.',
    '👀 Watch your drink and never leave it unattended.',
    '🚗 Have a safe way to get home planned in advance.',
    '📞 Check in with friends during social outings.',
    '🏠 Meet new people in public places initially.',
    '💬 Practice saying "no" confidently and without explanation.',
    '👥 Introduce friends to new romantic interests.',
    '📱 Share your location when going on dates.',
    '🚨 Have a safety word or signal with close friends.',
    '🎯 Be aware of peer pressure and manipulation tactics.',
    '🤝 Support other women and speak up when you see concerning behavior.'
  ]
};

const backgroundImg = require('../assets/images/splash-icon.png');

export default function SafetyTipsScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const [currentTipCategory, setCurrentTipCategory] = useState('online');
  const [tipIndex, setTipIndex] = useState(0);
  const [showTipCategories, setShowTipCategories] = useState(false);
  const [showToast, setShowToast] = useState('');

  const tipFadeAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const headerFade = useRef(new Animated.Value(0)).current;
  const contentFade = useRef(new Animated.Value(0)).current;

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
  }, []);

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
      digital: '📱',
      workplace: '🏢',
      travel: '✈️',
      financial: '💳',
      social: '👥'
    };
    return icons[category] || '💡';
  };

  const getCategoryName = (category) => {
    const names = {
      online: 'Online Safety',
      physical: 'Physical Safety',
      digital: 'Digital Privacy',
      workplace: 'Workplace Safety',
      travel: 'Travel Safety',
      financial: 'Financial Security',
      social: 'Social Safety'
    };
    return names[category] || 'Safety Tips';
  };

  const showToastMessage = (msg) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowToast(msg);
    setTimeout(() => setShowToast(''), 2000);
  };

  const getCategoryColor = (category) => {
    const colors = {
      online: '#4285F4',
      physical: '#34A853',
      digital: '#EA4335',
      workplace: '#FF9800',
      travel: '#9C27B0',
      financial: '#00BCD4',
      social: '#E91E63'
    };
    return colors[category] || '#7B3FA0';
  };

  const getCategoryDescription = (category) => {
    const descriptions = {
      online: 'Stay safe while browsing, shopping, and socializing online',
      physical: 'Protect yourself in real-world situations and environments',
      digital: 'Secure your devices, data, and digital identity',
      workplace: 'Navigate workplace safety and professional boundaries',
      travel: 'Stay secure while traveling and exploring new places',
      financial: 'Protect your money and financial information',
      social: 'Build healthy relationships and social boundaries'
    };
    return descriptions[category] || 'Essential safety tips for your protection';
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
            <Ionicons name="shield-checkmark" size={48} color={colors.primary} style={{ marginBottom: 8 }} />
            <Text style={[styles.headerTitle, { color: colors.primary }]}>Safety Tips</Text>
            <Text style={[styles.headerSubtitle, { color: colors.text }]}>
              Comprehensive safety guidance for your protection
            </Text>
          </View>
        </Animated.View>

        {/* Content Section */}
        <Animated.View style={[styles.contentSection, { opacity: contentFade }]}>
          {/* Category Selection */}
          <View style={[styles.categorySection, { backgroundColor: colors.card }]}>
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>Choose Category</Text>
            <View style={styles.categoryGrid}>
              {Object.keys(SAFETY_TIPS).map((category) => (
                <Pressable
                  key={category}
                  style={[
                    category === 'social' ? styles.categoryCardLong : styles.categoryCard,
                    { 
                      backgroundColor: currentTipCategory === category 
                        ? getCategoryColor(category) 
                        : colors.background,
                      borderColor: getCategoryColor(category)
                    }
                  ]}
                  onPress={() => switchTipCategory(category)}
                  android_ripple={{ color: getCategoryColor(category) + '30' }}
                >
                  <Text style={[
                    styles.categoryIcon,
                    { color: currentTipCategory === category ? '#fff' : getCategoryColor(category) }
                  ]}>
                    {getCategoryIcon(category)}
                  </Text>
                  <Text style={[
                    styles.categoryName,
                    { color: currentTipCategory === category ? '#fff' : colors.text }
                  ]}>
                    {getCategoryName(category)}
                  </Text>
                  <Text style={[
                    styles.categoryCount,
                    { color: currentTipCategory === category ? '#fff' : colors.text }
                  ]}>
                    {SAFETY_TIPS[category].length} tips
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Current Category Info */}
          <View style={[styles.currentCategoryCard, { backgroundColor: colors.card }]}>
            <View style={styles.currentCategoryHeader}>
              <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(currentTipCategory) }]}>
                <Text style={styles.categoryBadgeText}>
                  {getCategoryIcon(currentTipCategory)} {getCategoryName(currentTipCategory)}
                </Text>
              </View>
              <Text style={[styles.tipProgress, { color: colors.text }]}>
                {tipIndex + 1} of {SAFETY_TIPS[currentTipCategory].length}
              </Text>
            </View>
            <Text style={[styles.categoryDescription, { color: colors.text }]}>
              {getCategoryDescription(currentTipCategory)}
            </Text>
          </View>

          {/* Current Tip Display */}
          <Pressable onPress={nextTip}>
            <Animated.View style={[
              styles.tipCard, 
              { 
                backgroundColor: colors.card,
                borderLeftColor: getCategoryColor(currentTipCategory),
                opacity: tipFadeAnim 
              }
            ]}>
              <View style={styles.tipHeader}>
                <Ionicons name="bulb" size={24} color={getCategoryColor(currentTipCategory)} />
                <Text style={[styles.tipLabel, { color: colors.text }]}>Safety Tip</Text>
              </View>
              <Text style={[styles.tipText, { color: colors.text }]}>
                {SAFETY_TIPS[currentTipCategory][tipIndex]}
              </Text>
              <View style={styles.tipFooter}>
                <Text style={[styles.tipInstruction, { color: colors.text }]}>
                  Tap for next tip
                </Text>
                <View style={styles.tipIndicators}>
                  {SAFETY_TIPS[currentTipCategory].map((_, index) => (
                    <View
                      key={index}
                      style={[
                        styles.tipIndicator,
                        {
                          backgroundColor: index === tipIndex 
                            ? getCategoryColor(currentTipCategory)
                            : colors.text + '30'
                        }
                      ]}
                    />
                  ))}
                </View>
              </View>
            </Animated.View>
          </Pressable>

          {/* Quick Stats */}
          <View style={[styles.statsCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.statsTitle, { color: colors.primary }]}>Your Safety Knowledge</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: getCategoryColor('online') }]}>
                  {SAFETY_TIPS.online.length}
                </Text>
                <Text style={[styles.statLabel, { color: colors.text }]}>Online Tips</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: getCategoryColor('physical') }]}>
                  {SAFETY_TIPS.physical.length}
                </Text>
                <Text style={[styles.statLabel, { color: colors.text }]}>Physical Tips</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: getCategoryColor('digital') }]}>
                  {SAFETY_TIPS.digital.length}
                </Text>
                <Text style={[styles.statLabel, { color: colors.text }]}>Digital Tips</Text>
              </View>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </ImageBackground>
  );
}



