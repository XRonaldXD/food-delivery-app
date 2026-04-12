import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { orderApi } from '../../api/client';
import { Order } from '../../types';

export default function AvailableOrdersScreen({ navigation }: { navigation: any }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await orderApi.available();
      setOrders(data);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleAccept = async (order: Order) => {
    try {
      const updated = await orderApi.accept(order.id);
      Alert.alert('Order Accepted!', `You accepted order from ${order.restaurantName}`, [
        {
          text: 'View My Orders',
          onPress: () => navigation.navigate('DeliveriesTab', { screen: 'MyDeliveries' }),
        },
        { text: 'OK', style: 'cancel' },
      ]);
      setOrders((prev) => prev.filter((o) => o.id !== updated.id));
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyIcon}>🕐</Text>
        <Text style={styles.emptyText}>No available orders right now</Text>
        <TouchableOpacity
          style={styles.refreshBtn}
          onPress={() => { setLoading(true); load(); }}
        >
          <Text style={styles.refreshBtnText}>Refresh</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.list}
      data={orders}
      keyExtractor={(o) => o.id}
      contentContainerStyle={{ padding: 16 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => { setRefreshing(true); load(); }}
        />
      }
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.restName}>{item.restaurantName}</Text>
          <Text style={styles.address}>📍 {item.deliveryAddress}</Text>
          <Text style={styles.items}>
            {item.items.map((i) => `${i.name} ×${i.quantity}`).join(', ')}
          </Text>
          <View style={styles.footer}>
            <Text style={styles.total}>${item.total.toFixed(2)}</Text>
            <TouchableOpacity style={styles.acceptBtn} onPress={() => handleAccept(item)}>
              <Text style={styles.acceptBtnText}>Accept Pickup</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { backgroundColor: '#f9f9f9' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyIcon: { fontSize: 56, marginBottom: 12 },
  emptyText: { fontSize: 16, color: '#666', marginBottom: 16 },
  refreshBtn: {
    backgroundColor: '#FF6B35',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  refreshBtnText: { color: '#fff', fontWeight: 'bold' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  restName: { fontSize: 17, fontWeight: 'bold', color: '#222', marginBottom: 4 },
  address: { fontSize: 13, color: '#666', marginBottom: 6 },
  items: { fontSize: 13, color: '#888', marginBottom: 10 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  total: { fontSize: 16, fontWeight: '700', color: '#FF6B35' },
  acceptBtn: {
    backgroundColor: '#10b981',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  acceptBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
});
