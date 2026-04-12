import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { adminApi } from '../../api/client';
import { User } from '../../types';

export default function AdminUsersScreen({ navigation }: { navigation: any }) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = useCallback(async (q?: string) => {
    try {
      const data = await adminApi.users(q);
      setUsers(data);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => navigation.navigate('AdminUserEdit', { user: null })} style={{ marginRight: 16 }}>
          <Text style={{ color: '#FF6B35', fontWeight: 'bold', fontSize: 28, lineHeight: 30 }}>+</Text>
        </TouchableOpacity>
      ),
    });
    load();
  }, [load, navigation]);

  const handleSearch = (text: string) => {
    setSearch(text);
    load(text || undefined);
  };

  const handleDelete = (user: User) => {
    Alert.alert('Delete User', `Delete ${user.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await adminApi.deleteUser(user.id);
            setUsers((prev) => prev.filter((u) => u.id !== user.id));
          } catch (e: any) {
            Alert.alert('Error', e.message);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.search}
        placeholder="Search by name or email…"
        placeholderTextColor="#999"
        value={search}
        onChangeText={handleSearch}
      />
      <FlatList
        data={users}
        keyExtractor={(u) => u.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('AdminUserEdit', { user: item })}
            activeOpacity={0.85}
          >
            <View style={styles.cardRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardName}>{item.name}</Text>
                <Text style={styles.cardEmail}>{item.email}</Text>
                {item.phone ? <Text style={styles.cardPhone}>{item.phone}</Text> : null}
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.role}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item)}>
              <Text style={styles.deleteBtnText}>🗑 Delete</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No users found</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  search: {
    margin: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#333',
    backgroundColor: '#fff',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  cardName: { fontSize: 15, fontWeight: '700', color: '#222' },
  cardEmail: { fontSize: 13, color: '#666', marginTop: 2 },
  cardPhone: { fontSize: 13, color: '#888', marginTop: 1 },
  badge: {
    backgroundColor: '#FFF3EE',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: { color: '#FF6B35', fontSize: 12, fontWeight: '600' },
  deleteBtn: { marginTop: 10, alignSelf: 'flex-end' },
  deleteBtnText: { color: '#ef4444', fontSize: 13, fontWeight: '600' },
  empty: { textAlign: 'center', color: '#888', marginTop: 40 },
});
