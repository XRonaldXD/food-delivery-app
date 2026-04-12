import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TextInput,
  RefreshControl,
} from 'react-native';
import { adminApi } from '../../api/client';
import { User, Order } from '../../types';

export default function AdminChatScreen({ navigation }: { navigation: any }) {
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const loadData = useCallback(async (q?: string) => {
    try {
      const [usersData, ordersData] = await Promise.all([
        adminApi.users(q),
        adminApi.orders(),
      ]);
      setUsers(usersData);
      setOrders(ordersData);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const unsubscribe = navigation.getParent()?.addListener('tabPress', () => {
      if (navigation.isFocused()) {
        setSelectedUser(null);
        setSearch('');
        setRefreshing(true);
        loadData();
      }
    });
    return () => unsubscribe?.();
  }, [navigation, loadData]);

  const handleSearch = (text: string) => {
    setSearch(text);
    setSelectedUser(null);
    loadData(text || undefined);
  };

  const getOrdersForUser = (user: User): Order[] => {
    if (user.role === 'customer') {
      return orders.filter((o) => o.customerId === user.id);
    }
    if (user.role === 'driver') {
      return orders.filter((o) => o.driverId === user.id);
    }
    if (user.role === 'restaurant' && user.restaurantId) {
      return orders.filter((o) => o.restaurantId === user.restaurantId);
    }
    return [];
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  if (selectedUser) {
    const userOrders = getOrdersForUser(selectedUser);
    return (
      <View style={styles.container}>
        <View style={styles.userHeader}>
          <TouchableOpacity style={styles.backBtn} onPress={() => setSelectedUser(null)}>
            <Text style={styles.backBtnText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.userHeaderName}>{selectedUser.name}</Text>
          <Text style={styles.userHeaderRole}>{selectedUser.role}</Text>
        </View>
        {userOrders.length === 0 ? (
          <View style={styles.center}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyText}>No orders found for this user</Text>
          </View>
        ) : (
          <FlatList
            data={userOrders}
            keyExtractor={(o) => o.id}
            contentContainerStyle={{ padding: 16 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.orderCard}
                onPress={() => navigation.navigate('AdminChatMessage', { orderId: item.id })}
                activeOpacity={0.85}
              >
                <View style={styles.orderCardTop}>
                  <Text style={styles.orderId}>#{item.id.slice(-6).toUpperCase()}</Text>
                  <Text style={styles.orderStatus}>{item.status.replace('_', ' ')}</Text>
                </View>
                <Text style={styles.orderRestaurant}>{item.restaurantName}</Text>
                <Text style={styles.orderAddress}>📍 {item.deliveryAddress}</Text>
                <Text style={styles.chatHint}>Tap to open chat →</Text>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.search}
        placeholder="Search users by name or email…"
        placeholderTextColor="#999"
        value={search}
        onChangeText={handleSearch}
      />
      <FlatList
        data={users}
        keyExtractor={(u) => u.id}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); loadData(search || undefined); }}
          />
        }
        ListEmptyComponent={<Text style={styles.emptyText}>No users found</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.userCard}
            onPress={() => setSelectedUser(item)}
            activeOpacity={0.85}
          >
            <View style={styles.userCardRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.userName}>{item.name}</Text>
                <Text style={styles.userEmail}>{item.email}</Text>
              </View>
              <View style={styles.roleBadge}>
                <Text style={styles.roleBadgeText}>{item.role}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
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
  userCard: {
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
  userCardRow: { flexDirection: 'row', alignItems: 'center' },
  userName: { fontSize: 15, fontWeight: '700', color: '#222' },
  userEmail: { fontSize: 13, color: '#666', marginTop: 2 },
  roleBadge: {
    backgroundColor: '#FFF3EE',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  roleBadgeText: { color: '#FF6B35', fontSize: 12, fontWeight: '600' },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 15, color: '#888', textAlign: 'center' },
  userHeader: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backBtn: { marginBottom: 8 },
  backBtnText: { color: '#FF6B35', fontWeight: '600', fontSize: 15 },
  userHeaderName: { fontSize: 18, fontWeight: 'bold', color: '#222' },
  userHeaderRole: { fontSize: 13, color: '#888', marginTop: 2, textTransform: 'capitalize' },
  orderCard: {
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
  orderCardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  orderId: { fontSize: 14, fontWeight: '700', color: '#222' },
  orderStatus: { fontSize: 13, color: '#888', textTransform: 'capitalize' },
  orderRestaurant: { fontSize: 14, color: '#555', marginBottom: 4 },
  orderAddress: { fontSize: 13, color: '#888', marginBottom: 6 },
  chatHint: { fontSize: 12, color: '#FF6B35', fontWeight: '600' },
});
