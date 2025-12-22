import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import * as Contacts from 'expo-contacts';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import CommunityScreen from '../components/CommunityScreen';
import HomeScreen from '../components/HomeScreen';
import RegistrationScreen from '../components/RegistrationScreen';
import SafetyTipsScreen from '../components/SafetyTipsScreen';
import SettingsScreen from '../components/SettingsScreen';
import ToolkitScreen from '../components/ToolkitScreen';
import SOSScreen from '../components/SOSScreen';
import SakhiBot from '../components/SakhiBot';

// SOSScreen component is now imported from components directory
function ChatbotScreen() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
    </View>
  );
}
function ToolkitScreenInner() {
  return <ToolkitScreen />;
}

const Tab = createBottomTabNavigator();
const HomeStack = createStackNavigator();
const SOSStack = createStackNavigator();
const ChatbotStack = createStackNavigator();
const ToolkitStack = createStackNavigator();
const SettingsStack = createStackNavigator();

function HomeStackScreen({ navigation }) {
  return (
    <HomeStack.Navigator screenOptions={stackScreenOptions}>
      <HomeStack.Screen name="HomeMain" options={{ title: 'SHEild' }}>
        {() => <HomeScreen navigation={navigation} />}
      </HomeStack.Screen>
      <HomeStack.Screen name="Community" component={CommunityScreen} options={{ title: 'Community Safety Hub' }} />
    </HomeStack.Navigator>
  );
}
function SOSStackScreen() {
  return (
    <SOSStack.Navigator screenOptions={stackScreenOptions}>
      <SOSStack.Screen 
        name="SOSMain" 
        component={SOSScreen} 
        options={{ 
          title: 'Emergency SOS',
          headerShown: false 
        }} 
      />
    </SOSStack.Navigator>
  );
}
function ChatbotStackScreen() {
  return (
    <ChatbotStack.Navigator screenOptions={stackScreenOptions}>
      <ChatbotStack.Screen 
        name="ChatbotMain" 
        component={SakhiBot} 
        options={{ 
          title: 'SakhiBot',
          headerShown: false
        }} 
      />
    </ChatbotStack.Navigator>
  );
}
function ToolkitStackScreen() {
  return (
    <ToolkitStack.Navigator screenOptions={stackScreenOptions}>
      <ToolkitStack.Screen name="ToolkitMain" component={ToolkitScreenInner} options={{ headerShown: false }} />
      <ToolkitStack.Screen name="SafetyTips" component={SafetyTipsScreen} options={{ title: 'Safety Tips' }} />
      <ToolkitStack.Screen name="Community" component={CommunityScreen} options={{ title: 'Community Safety Hub' }} />
    </ToolkitStack.Navigator>
  );
}
function SettingsStackScreen({ onLogout }) {
  return (
    <SettingsStack.Navigator screenOptions={stackScreenOptions}>
      <SettingsStack.Screen name="SettingsMain" options={{ title: 'Settings' }}>
        {() => <SettingsScreen onLogout={onLogout} />}
      </SettingsStack.Screen>
    </SettingsStack.Navigator>
  );
}

const stackScreenOptions = {
  headerStyle: { backgroundColor: '#7B3FA0' },
  headerTintColor: '#fff',
  headerTitleAlign: 'center',
};

export default function MainNavigator() {
  const [isRegistered, setIsRegistered] = useState(null);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [navigatorKey, setNavigatorKey] = useState(0);

  useEffect(() => {
    const checkRegistration = async () => {
      const userProfile = await AsyncStorage.getItem('userProfile');
      setIsRegistered(!!userProfile);
    };
    checkRegistration();
  }, []);

  const handleRegistered = () => {
    setIsRegistered(true);
    setPermissionsGranted(false);
    setShowPermissionModal(true);
  };

  const requestPermissions = async () => {
    setRequesting(true);
    try {
      await Location.requestForegroundPermissionsAsync();
      await Contacts.requestPermissionsAsync();
      setPermissionsGranted(true);
      setShowPermissionModal(false);
    } catch (e) {
      setShowPermissionModal(false);
    } finally {
      setRequesting(false);
    }
  };

  if (isRegistered === null) {
    return <ActivityIndicator size="large" style={{ flex: 1, justifyContent: 'center' }} />;
  }

  if (!isRegistered) {
    return <RegistrationScreen onRegister={handleRegistered} />;
  }

  if (showPermissionModal && !permissionsGranted) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F3F9' }}>
        <Modal
          visible={showPermissionModal}
          transparent
          animationType="fade"
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Ionicons name="shield-checkmark" size={48} color="#7B3FA0" style={{ marginBottom: 12 }} />
              <Text style={styles.modalTitle}>Permissions Required</Text>
              <Text style={styles.modalText}>
                SHEild needs access to your location, contacts, and Bluetooth to provide real-time safety features, emergency alerts, and device connectivity.
              </Text>
              <View style={{ marginVertical: 12 }}>
                <View style={styles.permissionRow}><Ionicons name="location" size={22} color="#7B3FA0" /><Text style={styles.permissionLabel}>Location Access</Text></View>
                <View style={styles.permissionRow}><Ionicons name="people" size={22} color="#7B3FA0" /><Text style={styles.permissionLabel}>Contacts Access</Text></View>
                <View style={styles.permissionRow}><Ionicons name="bluetooth" size={22} color="#7B3FA0" /><Text style={styles.permissionLabel}>Bluetooth Access</Text></View>
              </View>
              <TouchableOpacity style={styles.modalButton} onPress={requestPermissions} disabled={requesting}>
                <Text style={styles.modalButtonText}>{requesting ? 'Requesting...' : 'Allow & Continue'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  return (
    <Tab.Navigator
      key={navigatorKey}
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Home') iconName = 'home';
          else if (route.name === 'SOS') iconName = 'alert-circle';
          else if (route.name === 'Chatbot') iconName = 'chatbubble-ellipses';
          else if (route.name === 'Toolkit') iconName = 'construct';
          else if (route.name === 'Settings') iconName = 'settings';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeStackScreen} />
      <Tab.Screen name="SOS" component={SOSStackScreen} />
      <Tab.Screen name="Chatbot" component={ChatbotStackScreen} />
      <Tab.Screen name="Toolkit" component={ToolkitStackScreen} />
      <Tab.Screen name="Settings">
        {() => <SettingsStackScreen onLogout={async () => {
          await AsyncStorage.clear();
          setIsRegistered(false);
          setNavigatorKey((k) => k + 1);
        }} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 28,
    alignItems: 'center',
    width: 320,
    shadowColor: '#7B3FA0',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#7B3FA0',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 15,
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  permissionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  permissionLabel: {
    marginLeft: 8,
    fontSize: 16,
    color: '#7B3FA0',
  },
  modalButton: {
    backgroundColor: '#7B3FA0',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 32,
    marginTop: 10,
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
