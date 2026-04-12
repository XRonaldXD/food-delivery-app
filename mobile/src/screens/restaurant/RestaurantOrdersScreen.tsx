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
import { Order, OrderStatus } from '../../types';

const STATUS_COLORS: Record<OrderStatus, string> = {
  placed: '#f59e0b',
  accepted: '#3b82f6',
  ready: '#f97316',
  picked_up: '#8b5cf6',
  delivered: '#10b981',
  cancelled: '#ef4444',
};

export default function RestaurantOrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await orderApi.mine();
      setOrders(data.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
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

  const handleUpdateStatus = async (order: Order, status: OrderStatus) => {
    try {
      const updated = await orderApi.updateStatus(order.id, status);
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
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
        <Text style={styles.emptyIcon}>🍽️</Text>
        <Text style={styles.emptyText}>No orders yet</Text>
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
          <View style={styles.cardHeader}>
            <Text style={styles.orderId}>Order #{item.id.slice(-6).toUpperCase()}</Text>
            <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[item.status] }]}>
              <Text style={styles.statusText}>{item.status.replace('_', ' ')}</Text>
            </View>
          </View>
          <Text style={styles.address}>📍 {item.deliveryAddress}</Text>
          <Text style={styles.items}>
            {item.items.map((i) => `${i.name} ×${i.quantity}`).join(', ')}
          </Text>
          <Text style={styles.total}>Total: ${item.total.toFixed(2)}</Text>
          {item.status === 'placed' && (
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.actionBtn, styles.acceptBtn]}
                onPress={() => handleUpdateStatus(item, 'accepted')}
              >
                <Text style={styles.actionBtnText}>✅ Accept</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, styles.cancelBtn]}
                onPress={() => handleUpdateStatus(item, 'cancelled')}
              >
                <Text style={styles.actionBtnText}>❌ Cancel</Text>
              </TouchableOpacity>
            </View>
          )}
          {item.status === 'accepted' && (
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.actionBtn, styles.readyBtn]}
                onPress={() => handleUpdateStatus(item, 'ready')}
              >
                <Text style={styles.actionBtnText}>🍳 Mark Ready for Pickup</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, styles.cancelBtn]}
                onPress={() => handleUpdateStatus(item, 'cancelled')}
              >
                <Text style={styles.actionBtnText}>❌ Cancel</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { backgroundColor: '#f9f9f9' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyIcon: { fontSize: 56, marginBottom: 12 },
  emptyText: { fontSize: 16, color: '#666' },
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
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  orderId: { fontSize: 15, fontWeight: 'bold', color: '#222' },
  statusBadge: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3 },
  statusText: { color: '#fff', fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  address: { fontSize: 13, color: '#666', marginBottom: 4 },
  items: { fontSize: 13, color: '#888', marginBottom: 6 },
  total: { fontSize: 15, fontWeight: '700', color: '#FF6B35', marginBottom: 10 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  actionBtn: { flex: 1, borderRadius: 8, paddingVertical: 10, alignItems: 'center', minWidth: 80 },
  acceptBtn: { backgroundColor: '#10b981' },
  readyBtn: { backgroundColor: '#f97316' },
  cancelBtn: { backgroundColor: '#ef4444', marginRight: 0 },
  actionBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
});
