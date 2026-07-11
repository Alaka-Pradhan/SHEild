import { FontAwesome, Ionicons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useContext, useEffect, useState } from 'react';
import { Alert, SafeAreaView, ScrollView, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ThemeContext } from '../contexts/ThemeContext';
import { styles } from '../styles/SettingsScreenStyles';

export default function SettingsScreen({ onLogout }) {
  const [profile, setProfile] = useState({ name: '', email: '', phone: '' });
  const [editing, setEditing] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [newContact, setNewContact] = useState('');
  const [locationSharing, setLocationSharing] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const { darkMode, setDarkMode: setAppDarkMode } = useContext(ThemeContext);

  useEffect(() => {
    const loadData = async () => {
      const userProfile = await AsyncStorage.getItem('userProfile');
      if (userProfile) setProfile(JSON.parse(userProfile));
      const savedContacts = await AsyncStorage.getItem('emergencyContacts');
      if (savedContacts) setContacts(JSON.parse(savedContacts));
      const loc = await AsyncStorage.getItem('locationSharing');
      if (loc !== null) setLocationSharing(loc === 'true');
      const notif = await AsyncStorage.getItem('notifications');
      if (notif !== null) setNotifications(notif === 'true');
      const theme = await AsyncStorage.getItem('darkMode');
      if (theme !== null) {
        setAppDarkMode(theme === 'true');
      }
    };
    loadData();
  }, []);

  const saveProfile = async () => {
    await AsyncStorage.setItem('userProfile', JSON.stringify(profile));
    setEditing(false);
    Alert.alert('Profile updated!');
  };

  const addContact = async () => {
    if (!newContact) return;
    const updated = [...contacts, newContact];
    setContacts(updated);
    setNewContact('');
    await AsyncStorage.setItem('emergencyContacts', JSON.stringify(updated));
  };

  const removeContact = async (index) => {
    const updated = contacts.filter((_, i) => i !== index);
    setContacts(updated);
    await AsyncStorage.setItem('emergencyContacts', JSON.stringify(updated));
  };

  const toggleLocationSharing = async () => {
    setLocationSharing((prev) => {
      AsyncStorage.setItem('locationSharing', (!prev).toString());
      return !prev;
    });
  };

  const toggleNotifications = async () => {
    setNotifications((prev) => {
      AsyncStorage.setItem('notifications', (!prev).toString());
      return !prev;
    });
  };

  const toggleDarkMode = async () => {
    const newValue = !darkMode;
    setAppDarkMode(newValue);
    await AsyncStorage.setItem('darkMode', newValue.toString());
  };

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log Out', style: 'destructive', onPress: onLogout },
      ]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: darkMode ? '#222' : '#F8F3F9' }}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Profile</Text>
          <View style={styles.profileRow}>
            <Ionicons name="person-circle" size={48} color="#7B3FA0" style={{ marginRight: 12 }} />
            <View style={{ flex: 1 }}>
              <TextInput
                style={styles.profileInput}
                value={profile.name}
                onChangeText={(t) => setProfile({ ...profile, name: t })}
                editable={editing}
                placeholder="Name"
                placeholderTextColor="#aaa"
              />
              <TextInput
                style={styles.profileInput}
                value={profile.email}
                onChangeText={(t) => setProfile({ ...profile, email: t })}
                editable={editing}
                placeholder="Email"
                placeholderTextColor="#aaa"
              />
              <TextInput
                style={styles.profileInput}
                value={profile.phone}
                onChangeText={(t) => setProfile({ ...profile, phone: t })}
                editable={editing}
                placeholder="Phone"
                placeholderTextColor="#aaa"
              />
            </View>
            <TouchableOpacity onPress={() => (editing ? saveProfile() : setEditing(true))}>
              <Ionicons name={editing ? 'checkmark' : 'create-outline'} size={28} color="#7B3FA0" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Emergency Contacts</Text>
          {contacts.length === 0 ? (
            <Text style={{ color: '#aaa', marginBottom: 8 }}>No contacts added.</Text>
          ) : (
            contacts.map((contact, index) => (
              <View key={index} style={styles.contactRow}>
                <FontAwesome name="user" size={20} color="#7B3FA0" style={{ marginRight: 8 }} />
                <Text style={styles.contactText}>{contact}</Text>
                <TouchableOpacity onPress={() => removeContact(index)}>
                  <Ionicons name="trash" size={20} color="#B00020" />
                </TouchableOpacity>
              </View>
            ))
          )}
          <View style={styles.addContactRow}>
            <TextInput
              style={styles.addContactInput}
              value={newContact}
              onChangeText={setNewContact}
              placeholder="Add phone or email"
              placeholderTextColor="#aaa"
            />
            <TouchableOpacity style={styles.addContactBtn} onPress={addContact}>
              <Ionicons name="add-circle" size={28} color="#7B3FA0" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Privacy & Notifications</Text>
          <View style={styles.settingRow}>
            <MaterialIcons name="location-on" size={22} color="#7B3FA0" style={{ marginRight: 8 }} />
            <Text style={styles.settingLabel}>Location Sharing</Text>
            <Switch value={locationSharing} onValueChange={toggleLocationSharing} thumbColor={locationSharing ? '#7B3FA0' : '#ccc'} />
          </View>
          <View style={styles.settingRow}>
            <Ionicons name="notifications" size={22} color="#7B3FA0" style={{ marginRight: 8 }} />
            <Text style={styles.settingLabel}>Notifications</Text>
            <Switch value={notifications} onValueChange={toggleNotifications} thumbColor={notifications ? '#7B3FA0' : '#ccc'} />
          </View>
        </View>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>App Settings</Text>
          <View style={styles.settingRow}>
            <Ionicons name="moon" size={22} color="#7B3FA0" style={{ marginRight: 8 }} />
            <Text style={styles.settingLabel}>Dark Mode</Text>
            <Switch value={darkMode} onValueChange={toggleDarkMode} thumbColor={darkMode ? '#7B3FA0' : '#ccc'} />
          </View>
        </View>
        <View style={styles.card}>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={22} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.logoutText}>Logout / Reset App</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}