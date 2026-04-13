import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  ScrollView,
  Linking,
} from 'react-native';
import { orderApi, locationApi } from '../../api/client';
import { Order, OrderStatus } from '../../types';

const STATUS_COLOR: Record<string, string> = {
  accepted: '#3b82f6',
  picked_up: '#8b5cf6',
  delivered: '#10b981',
  cancelled: '#ef4444',
  placed: '#f59e0b',
};

const NEXT_STATUS: Record<string, { label: string; status: OrderStatus } | undefined> = {
  picked_up: { label: '✅ Mark Delivered', status: 'delivered' },
};

const LOCATION_SHARE_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

export default function DeliveryDetailScreen({ route, navigation }: { route: any; navigation: any }) {
  const { orderId } = route.params as { orderId: string };
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [sharingLocation, setSharingLocation] = useState(false);
  const [autoShareActive, setAutoShareActive] = useState(false);
  const locationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await orderApi.get(orderId);
      setOrder(data);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    load();
  }, [load]);

  const shareLocationOnce = useCallback(async (silent = false) => {
    try {
      // Mock coordinates (San Francisco) – replace with real GPS in production
      await locationApi.updateDriverLocation({ orderId, latitude: 37.7749, longitude: -122.4194 });
      if (!silent) {
        Alert.alert('Location Shared', 'Your location has been shared with the customer.');
      }
    } catch (e: any) {
      if (!silent) Alert.alert('Error', e.message);
    }
  }, [orderId]);

  // Auto-share location every 5 minutes when order is picked_up
  useEffect(() => {
    if (order?.status === 'picked_up') {
      setAutoShareActive(true);
      shareLocationOnce(true);
      locationIntervalRef.current = setInterval(() => shareLocationOnce(true), LOCATION_SHARE_INTERVAL_MS);
    } else {
      setAutoShareActive(false);
      if (locationIntervalRef.current) {
        clearInterval(locationIntervalRef.current);
        locationIntervalRef.current = null;
      }
    }
    return () => {
      if (locationIntervalRef.current) {
        clearInterval(locationIntervalRef.current);
        locationIntervalRef.current = null;
      }
    };
  }, [order?.status, shareLocationOnce]);

  const handleUpdateStatus = async (nextStatus: OrderStatus) => {
    setUpdating(true);
    try {
      const updated = await orderApi.updateStatus(orderId, nextStatus);
      setOrder(updated);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleShareLocation = async () => {
    setSharingLocation(true);
    try {
      await shareLocationOnce(false);
    } finally {
      setSharingLocation(false);
    }
  };

  const handleOpenMap = () => {
    if (!order) return;
    const encodedAddr = encodeURIComponent(order.deliveryAddress);
    Linking.openURL(`https://maps.google.com/?q=${encodedAddr}`);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }
  if (!order) return null;

  const next = NEXT_STATUS[order.status];

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <View style={styles.header}>
        <Text style={styles.restName}>{order.restaurantName}</Text>
        <View style={[styles.badge, { backgroundColor: STATUS_COLOR[order.status] ?? '#999' }]}>
          <Text style={styles.badgeText}>{order.status.replace('_', ' ')}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Delivery Address</Text>
      <Text style={styles.address}>📍 {order.deliveryAddress}</Text>

      {autoShareActive && (
        <View style={styles.autoShareBadge}>
          <Text style={styles.autoShareText}>📡 Auto-sharing location every 5 min</Text>
        </View>
      )}

      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.actionSmallBtn} onPress={handleOpenMap}>
          <Text style={styles.actionSmallBtnText}>📍 Open Map</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionSmallBtn, { backgroundColor: '#8b5cf6' }]}
          onPress={() => navigation.navigate('Chat', { orderId: order.id })}
        >
          <Text style={[styles.actionSmallBtnText, { color: '#fff' }]}>💬 Chat</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionSmallBtn, { backgroundColor: '#10b981' }]}
          onPress={handleShareLocation}
          disabled={sharingLocation}
        >
          <Text style={[styles.actionSmallBtnText, { color: '#fff' }]}>
            {sharingLocation ? '⏳' : '📡 Share Now'}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Items</Text>
      {order.items.map((item) => (
        <View key={item.menuItemId} style={styles.itemRow}>
          <Text style={styles.itemName}>{item.name} ×{item.quantity}</Text>
          <Text style={styles.itemPrice}>${(item.price * item.quantity).toFixed(2)}</Text>
        </View>
      ))}
      <View style={styles.divider} />
      <View style={styles.itemRow}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>${order.total.toFixed(2)}</Text>
      </View>

      <Text style={styles.meta}>Order #{order.id.slice(0, 8)}</Text>
      <Text style={styles.meta}>Placed: {new Date(order.createdAt).toLocaleString()}</Text>

      {next && (
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => handleUpdateStatus(next.status)}
          disabled={updating}
        >
          <Text style={styles.actionBtnText}>
            {updating ? 'Updating...' : next.label}
          </Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  restName: { fontSize: 20, fontWeight: 'bold', color: '#222', flex: 1, marginRight: 8 },
  badge: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 5 },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#444', marginBottom: 10, marginTop: 16 },
  address: { fontSize: 14, color: '#555', lineHeight: 20 },
  autoShareBadge: {
    backgroundColor: '#d1fae5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 10,
    marginBottom: 4,
  },
  autoShareText: { color: '#065f46', fontSize: 12, fontWeight: '600' },
  actionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  actionSmallBtn: {
    borderWidth: 1,
    borderColor: '#FF6B35',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  actionSmallBtnText: { color: '#FF6B35', fontSize: 13, fontWeight: '600' },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  itemName: { fontSize: 14, color: '#333' },
  itemPrice: { fontSize: 14, color: '#333', fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 8 },
  totalLabel: { fontSize: 15, fontWeight: '700', color: '#222' },
  totalValue: { fontSize: 15, fontWeight: '700', color: '#FF6B35' },
  meta: { fontSize: 12, color: '#aaa', marginTop: 8 },
  actionBtn: {
    marginTop: 28,
    backgroundColor: '#FF6B35',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  actionBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

