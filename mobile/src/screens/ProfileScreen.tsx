import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function ProfileScreen() {
  const { user, logout, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: logout },
    ]);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const body: Parameters<typeof updateProfile>[0] = {};
      if (name !== user?.name) body.name = name;
      if (phone !== (user?.phone ?? '')) body.phone = phone;
      if (email !== user?.email) body.email = email;
      if (newPassword) {
        body.currentPassword = currentPassword;
        body.newPassword = newPassword;
      }
      await updateProfile(body);
      setCurrentPassword('');
      setNewPassword('');
      setEditing(false);
      Alert.alert('Success', 'Profile updated');
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setName(user?.name ?? '');
    setPhone(user?.phone ?? '');
    setEmail(user?.email ?? '');
    setCurrentPassword('');
    setNewPassword('');
    setEditing(false);
  };

  if (editing) {
    return (
      <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#fff' }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.editContainer}>
          <Text style={styles.editTitle}>Edit Profile</Text>
          <Text style={styles.label}>Name</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Name" placeholderTextColor="#999" />
          <Text style={styles.label}>Phone</Text>
          <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="Phone" placeholderTextColor="#999" keyboardType="phone-pad" />
          <Text style={styles.label}>Email</Text>
          <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Email" placeholderTextColor="#999" autoCapitalize="none" keyboardType="email-address" />
          <Text style={[styles.label, { marginTop: 16 }]}>Change Password</Text>
          <TextInput style={styles.input} value={currentPassword} onChangeText={setCurrentPassword} placeholder="Current password" placeholderTextColor="#999" secureTextEntry />
          <TextInput style={styles.input} value={newPassword} onChangeText={setNewPassword} placeholder="New password" placeholderTextColor="#999" secureTextEntry />
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
            {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save Changes</Text>}
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.avatarCircle}>
        <Text style={styles.avatarText}>
          {user?.name?.charAt(0).toUpperCase() ?? '?'}
        </Text>
      </View>
      <Text style={styles.name}>{user?.name}</Text>
      <Text style={styles.email}>{user?.email}</Text>
      {user?.phone ? <Text style={styles.phone}>{user.phone}</Text> : null}
      <View style={styles.roleBadge}>
        <Text style={styles.roleText}>
          {user?.role === 'driver' ? '🚗 Driver'
            : user?.role === 'restaurant' ? '🍽️ Restaurant'
            : user?.role === 'admin' ? '🛡️ Admin'
            : '🧑 Customer'}
        </Text>
      </View>

      <TouchableOpacity style={styles.editBtn} onPress={() => setEditing(true)}>
        <Text style={styles.editBtnText}>✏️ Edit Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutBtnText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingTop: 60,
    padding: 24,
  },
  editContainer: { padding: 24, paddingTop: 40 },
  editTitle: { fontSize: 22, fontWeight: 'bold', color: '#222', marginBottom: 24, textAlign: 'center' },
  label: { fontSize: 13, color: '#666', marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 14,
    fontSize: 15,
    color: '#333',
  },
  saveBtn: {
    backgroundColor: '#FF6B35',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  cancelBtn: { alignItems: 'center', padding: 10 },
  cancelBtnText: { color: '#999', fontSize: 14 },
  avatarCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: { fontSize: 36, color: '#fff', fontWeight: 'bold' },
  name: { fontSize: 22, fontWeight: 'bold', color: '#222', marginBottom: 6 },
  email: { fontSize: 14, color: '#888', marginBottom: 4 },
  phone: { fontSize: 14, color: '#888', marginBottom: 12 },
  roleBadge: {
    backgroundColor: '#FFF3EE',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginBottom: 28,
    marginTop: 8,
  },
  roleText: { color: '#FF6B35', fontWeight: '600', fontSize: 14 },
  editBtn: {
    borderWidth: 2,
    borderColor: '#FF6B35',
    borderRadius: 8,
    paddingHorizontal: 40,
    paddingVertical: 12,
    marginBottom: 16,
  },
  editBtnText: { color: '#FF6B35', fontWeight: 'bold', fontSize: 15 },
  logoutBtn: {
    borderWidth: 2,
    borderColor: '#ef4444',
    borderRadius: 8,
    paddingHorizontal: 40,
    paddingVertical: 12,
  },
  logoutBtnText: { color: '#ef4444', fontWeight: 'bold', fontSize: 15 },
});
