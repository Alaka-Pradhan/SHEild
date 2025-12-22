import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    padding: 18,
    alignItems: 'center',
    paddingBottom: 40,
  },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    marginBottom: 18,
    shadowColor: '#7B3FA0',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#7B3FA0',
    marginBottom: 12,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileInput: {
    fontSize: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0D6EB',
    marginBottom: 6,
    color: '#333',
    paddingVertical: 2,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  contactText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  addContactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  addContactInput: {
    flex: 1,
    fontSize: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0D6EB',
    color: '#333',
    marginRight: 8,
    paddingVertical: 2,
  },
  addContactBtn: {
    padding: 2,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  settingLabel: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#B00020',
    borderRadius: 8,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
