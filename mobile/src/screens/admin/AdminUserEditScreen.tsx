import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { adminApi } from '../../api/client';
import { User, Role } from '../../types';

const ROLES: Role[] = ['customer', 'driver', 'restaurant', 'admin'];

export default function AdminUserEditScreen({ route, navigation }: { route: any; navigation: any }) {
  const existingUser: User | null = route.params?.user ?? null;
  const isEdit = !!existingUser;

  const [name, setName] = useState(existingUser?.name ?? '');
  const [email, setEmail] = useState(existingUser?.email ?? '');
  const [phone, setPhone] = useState(existingUser?.phone ?? '');
  const [role, setRole] = useState<Role>(existingUser?.role ?? 'customer');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!email) { Alert.alert('Error', 'Email is required'); return; }
    if (!isEdit && !password) { Alert.alert('Error', 'Password is required for new users'); return; }
    setSaving(true);
    try {
      if (isEdit) {
        await adminApi.updateUser(existingUser!.id, { name, email, phone, role, password: password || undefined });
      } else {
        await adminApi.createUser({ name, email, phone, role, password });
      }
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#fff' }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{isEdit ? 'Edit User' : 'New User'}</Text>

        <Text style={styles.label}>Name</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Full name" placeholderTextColor="#999" />

        <Text style={styles.label}>Email *</Text>
        <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Email" placeholderTextColor="#999" autoCapitalize="none" keyboardType="email-address" />

        <Text style={styles.label}>Phone</Text>
        <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="Phone" placeholderTextColor="#999" keyboardType="phone-pad" />

        <Text style={styles.label}>Password {isEdit ? '(leave blank to keep)' : '*'}</Text>
        <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="Password" placeholderTextColor="#999" secureTextEntry />

        <Text style={styles.label}>Role</Text>
        <View style={styles.roleGrid}>
          {ROLES.map((r) => (
            <TouchableOpacity
              key={r}
              style={[styles.roleBtn, role === r && styles.roleBtnActive]}
              onPress={() => setRole(r)}
            >
              <Text style={[styles.roleBtnText, role === r && styles.roleBtnTextActive]}>
                {r === 'customer' ? '🧑 Customer' : r === 'driver' ? '🚗 Driver' : r === 'restaurant' ? '🍽️ Restaurant' : '🛡️ Admin'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>{isEdit ? 'Save Changes' : 'Create User'}</Text>}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, paddingTop: 32 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#222', marginBottom: 24, textAlign: 'center' },
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
  roleGrid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 24 },
  roleBtn: {
    width: '48%',
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    marginRight: '2%',
    marginBottom: 10,
  },
  roleBtnActive: { borderColor: '#FF6B35', backgroundColor: '#FFF3EE' },
  roleBtnText: { fontSize: 13, color: '#666', fontWeight: '600' },
  roleBtnTextActive: { color: '#FF6B35' },
  saveBtn: {
    backgroundColor: '#FF6B35',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
