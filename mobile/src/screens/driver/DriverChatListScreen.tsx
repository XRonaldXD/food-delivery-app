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

const STATUS_COLOR: Record<string, string> = {
  accepted: '#3b82f6',
  picked_up: '#8b5cf6',
  delivered: '#10b981',
  cancelled: '#ef4444',
};

export default function DriverChatListScreen({ navigation }: { navigation: any }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await orderApi.mine();
      // Show active and recent deliveries
      setOrders([...data].sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
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

  useEffect(() => {
    const unsubscribe = navigation.getParent()?.addListener('tabPress', () => {
      if (navigation.isFocused()) {
        setRefreshing(true);
        load();
      }
    });
    return () => unsubscribe?.();
  }, [navigation, load]);

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
        <Text style={styles.emptyIcon}>💬</Text>
        <Text style={styles.emptyText}>No deliveries to chat about</Text>
        <Text style={styles.emptyHint}>Accept orders to start chatting with customers</Text>
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
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('Chat', { orderId: item.id })}
          activeOpacity={0.85}
        >
          <View style={styles.cardTop}>
            <Text style={styles.restName}>{item.restaurantName}</Text>
            <View style={[styles.badge, { backgroundColor: STATUS_COLOR[item.status] ?? '#999' }]}>
              <Text style={styles.badgeText}>{item.status.replace('_', ' ')}</Text>
            </View>
          </View>
          <Text style={styles.address}>📍 {item.deliveryAddress}</Text>
          <Text style={styles.chatHint}>Tap to open chat →</Text>
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { backgroundColor: '#f9f9f9' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyIcon: { fontSize: 56, marginBottom: 12 },
  emptyText: { fontSize: 16, color: '#666', marginBottom: 8, textAlign: 'center' },
  emptyHint: { fontSize: 13, color: '#aaa', textAlign: 'center' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  restName: { fontSize: 16, fontWeight: 'bold', color: '#222', flex: 1, marginRight: 8 },
  badge: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
  address: { fontSize: 13, color: '#666', marginBottom: 6 },
  chatHint: { fontSize: 12, color: '#FF6B35', fontWeight: '600' },
});
