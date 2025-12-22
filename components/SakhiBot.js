import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  Keyboard,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';

// Base64 encoded bot avatar (simple purple circle with 'S')
const BOT_AVATAR = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4AkEEjIXFh8c1wAAA3hJRUdErkJggg==';

// Animation config
const ANIMATION_CONFIG = {
  duration: 200,
  useNativeDriver: true,
};

const { width, height } = Dimensions.get('window');
const ITEM_HEIGHT = 80;

const MESSAGES = {
  welcome: "Hello! I'm Sakhi, your safety assistant. How can I help you today?\n\nYou can ask me about:\n• Emergency contacts\n• Safety tips\n• Self-defense\n• Local helplines",
  emergency: "In case of emergency, please use the SOS button on the home screen. Would you like me to call emergency services for you?",
  safetyTips: [
    "Always share your live location with trusted contacts when going out.",
    "Keep emergency numbers saved in your phone and easily accessible.",
    "Trust your instincts - if a situation feels unsafe, remove yourself from it.",
    "Learn basic self-defense moves and practice them regularly.",
    "Be aware of your surroundings and avoid distractions like phones when walking alone."
  ],
  selfDefense: "Here are some basic self-defense tips:\n1. Be aware of your surroundings\n2. Keep your phone handy\n3. Use your voice - shout 'Fire!' to attract attention\n4. Target vulnerable areas: eyes, nose, throat, groin\n5. Carry a personal safety alarm",
  default: "I'm here to help with safety-related questions. You can ask about emergency contacts, safety tips, or self-defense advice."
};

const QUICK_REPLIES = {
  greeting: [
    'How to stay safe at night?',
    'What should I do in an emergency?',
    'Share my location',
    'Call emergency contact'
  ],
  emergency: [
    'Call emergency services',
    'Share my live location',
    'Contact trusted person',
    'Safety tips'
  ],
  general: [
    'Safety tips',
    'Emergency contacts',
    'Self-defense techniques',
    'Report an incident'
  ]
};

const SakhiBot = ({ navigation }) => {
  const { colors } = useTheme();
  const [messages, setMessages] = useState([
    { id: '1', text: MESSAGES.welcome, sender: 'bot' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [quickReplies, setQuickReplies] = useState(QUICK_REPLIES.greeting);
  const [sound, setSound] = useState(null);
  const flatListRef = useRef(null);
  const inputRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(20)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  // Pulsing animation for typing indicator
  useEffect(() => {
    const pulse = Animated.loop(
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
    );
    
    if (isTyping) {
      pulse.start();
    } else {
      pulse.stop();
      pulseAnim.setValue(1);
    }
    
    return () => pulse.stop();
  }, [isTyping]);
  
  const loadSound = async () => {
    try {
      // No sound needed for now, but keeping the function for future use
      return null;
    } catch (error) {
      return null;
    }
  };

  useEffect(() => {
    loadSound();
    
    // Fade in animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(slideUpAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      })
    ]).start();
    
    return () => {
      if (sound) sound.unloadAsync();
    };
  }, []);

  const handleQuickReply = (reply) => {
    setInputText(reply);
    handleSend(reply);
  };

  const updateQuickReplies = (message) => {
    if (message.toLowerCase().includes('emergency')) {
      setQuickReplies(QUICK_REPLIES.emergency);
    } else if (message.toLowerCase().includes('hi') || message.toLowerCase().includes('hello')) {
      setQuickReplies(QUICK_REPLIES.greeting);
    } else {
      setQuickReplies(QUICK_REPLIES.general);
    }
  };

  const handleSend = (customMessage) => {
    const message = customMessage || inputText;
    if (!message.trim()) return;
    Keyboard.dismiss();

    // Add user message with animation
    const userMessage = {
      id: Date.now().toString(),
      text: message,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);
    updateQuickReplies(message);

    // Simulate bot typing and response
    setTimeout(() => {
      const botResponse = generateResponse(message.toLowerCase());
      setMessages(prev => [
        ...prev,
        { 
          id: (Date.now() + 1).toString(), 
          text: botResponse, 
          sender: 'bot',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setIsTyping(false);
    }, 1500);
  };

  const generateResponse = (message) => {
    if (message.includes('emergency') || message.includes('help')) {
      return MESSAGES.emergency;
    } else if (message.includes('safety tip') || message.includes('safe')) {
      return MESSAGES.safetyTips[
        Math.floor(Math.random() * MESSAGES.safetyTips.length)
      ];
    } else if (message.includes('self defense') || message.includes('defense')) {
      return MESSAGES.selfDefense;
    } else if (message.includes('hello') || message.includes('hi')) {
      return "Hello! How can I assist you with your safety today?";
    } else if (message.includes('thank')) {
      return "You're welcome! Stay safe and don't hesitate to ask if you need anything else.";
    } else {
      return MESSAGES.default;
    }
  };

  const handleActionPress = (action) => {
    switch(action) {
      case 'call':
        // Implement call action
        break;
      case 'location':
        // Implement location sharing
        break;
      case 'sos':
        navigation.navigate('SOS');
        break;
      default:
        break;
    }
  };

  const renderMessage = ({ item, index }) => {
    const isUser = item.sender === 'user';
    
    if (item.isAction) {
      return (
        <View style={styles.actionContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={() => handleActionPress('sos')}
          >
            <Ionicons name="alert-circle" size={20} color="#fff" style={styles.actionIcon} />
            <Text style={styles.actionText}>Activate SOS</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.primary }]}
            onPress={() => handleActionPress('location')}
          >
            <Ionicons name="location" size={20} color={colors.primary} style={styles.actionIcon} />
            <Text style={[styles.actionText, { color: colors.primary }]}>Share Location</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <Animated.View
        style={[
          styles.messageContainer,
          {
            alignSelf: isUser ? 'flex-end' : 'flex-start',
            opacity: fadeAnim,
            transform: [{ translateY: slideUpAnim }]
          }
        ]}
      >
        {!isUser && (
          <Image
            source={{ uri: BOT_AVATAR }}
            style={styles.avatar}
          />
        )}
        <View style={[
          styles.messageBubble,
          isUser 
            ? [styles.userBubble, { backgroundColor: colors.primary }] 
            : [styles.botBubble, { backgroundColor: colors.card }]
        ]}>
          <Text style={[
            styles.messageText,
            { color: isUser ? '#fff' : colors.text }
          ]}>
            {item.text}
          </Text>
          <Text style={[
            styles.timestamp,
            { color: isUser ? 'rgba(255,255,255,0.7)' : colors.text + '80' }
          ]}>
            {item.timestamp}
          </Text>
        </View>
      </Animated.View>
    );
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <LinearGradient
          colors={['#6c63ff', '#8a7dff']}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <SafeAreaView>
            <View style={styles.headerContent}>
              <TouchableOpacity 
                onPress={() => navigation.goBack()}
                style={styles.backButton}
                activeOpacity={0.7}
              >
                <Ionicons name="arrow-back" size={20} color="#fff" />
              </TouchableOpacity>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.headerTitle}>SakhiBot</Text>
                <View style={styles.statusContainer}>
                  <View style={[styles.statusDot, { backgroundColor: isTyping ? '#ff6b6b' : '#4CAF50' }]} />
                  <Text style={styles.headerSubtitle}>
                    {isTyping ? 'Typing...' : 'Online now'}
                  </Text>
                </View>
              </View>
              <View style={styles.headerIcons}>
                <TouchableOpacity style={[styles.iconButton, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                  <Feather name="phone" size={20} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.iconButton, { backgroundColor: 'rgba(255,255,255,0.2)', marginLeft: 8 }]}>
                  <Feather name="info" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>
        </LinearGradient>

        <View style={{ flex: 1, paddingBottom: 80 }}>
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messagesContainer}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
            showsVerticalScrollIndicator={false}
          />

          {/* Quick Replies */}
          {quickReplies.length > 0 && !isTyping && (
            <View style={styles.quickRepliesWrapper}>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.quickRepliesContainer}
              >
                {quickReplies.map((reply, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.quickReply}
                    onPress={() => handleQuickReply(reply)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.quickReplyText}>{reply}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

        </View>

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Type a message..."
              placeholderTextColor="#999"
              multiline
              maxLength={500}
              enablesReturnKeyAutomatically
              returnKeyType="send"
              onSubmitEditing={() => handleSend()}
            />
            {!inputText && (
              <TouchableOpacity 
                style={styles.emojiButton}
                onPress={() => {
                  // Will implement emoji picker in next step
                }}
              >
                <Ionicons name="happy-outline" size={24} color="#999" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={styles.sendButton}
            onPress={() => handleSend()}
            disabled={!inputText.trim()}
            activeOpacity={0.8}
          >
            <MaterialIcons 
              name={inputText.trim() ? "send" : "mic"} 
              size={24} 
              color="#fff"
            />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  headerGradient: {
    paddingTop: 50,
    paddingBottom: 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 50,
    borderBottomWidth: 0,
  },
  backButton: {
    marginRight: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  headerIcons: {
    flexDirection: 'row',
  },
  iconButton: {
    marginLeft: 16,
    padding: 4,
  },
  messagesContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  messageContainer: {
    flexDirection: 'row',
    marginVertical: 6,
    maxWidth: '85%',
    paddingHorizontal: 12,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    alignSelf: 'flex-end',
  },
  messageBubble: {
    padding: 14,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userBubble: {
    borderBottomRightRadius: 4,
    marginLeft: 'auto',
  },
  botBubble: {
    borderBottomLeftRadius: 4,
    marginRight: 'auto',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  timestamp: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'right',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingBottom: Platform.OS === 'ios' ? 34 : 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#eee',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  inputWrapper: {
    flex: 1,
    position: 'relative',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#f5f5f5',
    borderRadius: 25,
    paddingHorizontal: 18,
    paddingVertical: 12,
    paddingRight: 50,
    fontSize: 15,
    minHeight: 50,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    lineHeight: 20,
  },
  sendButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    backgroundColor: '#6c63ff',
    shadowColor: '#6c63ff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 2,
  },
  quickRepliesContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  quickReply: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    margin: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  quickReplyText: {
    fontSize: 14,
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    marginHorizontal: 8,
    minWidth: 140,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIcon: {
    marginRight: 8,
  },
  actionText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 14,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  emojiButton: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    padding: 8,
  },
});

export default SakhiBot;
