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
  Image,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { orderApi, locationApi } from '../../api/client';
import { Order, DriverLocation } from '../../types';

const STATUS_COLOR: Record<string, string> = {
  placed: '#f59e0b',
  accepted: '#3b82f6',
  ready: '#f97316',
  picked_up: '#8b5cf6',
  delivered: '#10b981',
  cancelled: '#ef4444',
};

const STATUS_LABELS: Record<string, string> = {
  placed: '⏳ Placed',
  accepted: '🍳 Accepted by Restaurant',
  ready: '🎁 Ready for Pickup',
  picked_up: '🚗 On the Way',
  delivered: '🎉 Delivered',
  cancelled: '❌ Cancelled',
};

export default function OrderDetailScreen({ route, navigation }: { route: any; navigation: any }) {
  const { orderId } = route.params as { orderId: string };
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

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

  const handleCancel = async () => {
    if (!order) return;
    Alert.alert('Cancel Order', 'Are you sure?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes',
        style: 'destructive',
        onPress: async () => {
          try {
            const updated = await orderApi.updateStatus(orderId, 'cancelled');
            setOrder(updated);
          } catch (e: any) {
            Alert.alert('Error', e.message);
          }
        },
      },
    ]);
  };

  const handleViewDriverLocation = async () => {
    try {
      const loc = await locationApi.getOrderLocation(orderId);
      Alert.alert(
        '📍 Driver Location',
        `Latitude: ${loc.latitude.toFixed(5)}\nLongitude: ${loc.longitude.toFixed(5)}\nUpdated: ${new Date(loc.updatedAt).toLocaleTimeString()}`,
        [
          {
            text: 'Open in Maps',
            onPress: () => Linking.openURL(`https://maps.google.com/?q=${loc.latitude},${loc.longitude}`),
          },
          { text: 'OK', style: 'cancel' },
        ],
      );
    } catch {
      Alert.alert('Location Unavailable', 'Driver has not shared their location yet.');
    }
  };

  const handleOpenChat = () => {
    navigation.navigate('Chat', { orderId });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }
  if (!order) return null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <View style={styles.header}>
        <Text style={styles.restName}>{order.restaurantName}</Text>
        <View style={[styles.badge, { backgroundColor: STATUS_COLOR[order.status] ?? '#999' }]}>
          <Text style={styles.badgeText}>{STATUS_LABELS[order.status] ?? order.status}</Text>
        </View>
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

      <Text style={styles.sectionTitle}>Delivery Address</Text>
      <Text style={styles.address}>{order.deliveryAddress}</Text>

      <Text style={styles.meta}>Order #{order.id.slice(0, 8)}</Text>
      <Text style={styles.meta}>Placed: {new Date(order.createdAt).toLocaleString()}</Text>

      {order.status === 'picked_up' && (
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.locationBtn} onPress={handleViewDriverLocation}>
            <Text style={styles.locationBtnText}>📍 View Driver Location</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.chatBtn} onPress={handleOpenChat}>
            <Text style={styles.chatBtnText}>💬 Chat with Driver</Text>
          </TouchableOpacity>
        </View>
      )}

      {['placed', 'accepted'].includes(order.status) && (
        <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
          <Text style={styles.cancelBtnText}>Cancel Order</Text>
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
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#444', marginBottom: 10, marginTop: 16 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  itemName: { fontSize: 14, color: '#333' },
  itemPrice: { fontSize: 14, color: '#333', fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 8 },
  totalLabel: { fontSize: 15, fontWeight: '700', color: '#222' },
  totalValue: { fontSize: 15, fontWeight: '700', color: '#FF6B35' },
  address: { fontSize: 14, color: '#555', lineHeight: 20 },
  meta: { fontSize: 12, color: '#aaa', marginTop: 8 },
  actionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 20 },
  locationBtn: {
    flex: 1,
    backgroundColor: '#8b5cf6',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    marginBottom: 4,
  },
  openMapsBtnText: { color: '#8b5cf6', fontWeight: '600', fontSize: 13 },
  actionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12 },
  chatBtn: {
    flex: 1,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  chatBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  cancelBtn: {
    marginTop: 24,
    backgroundColor: '#ef4444',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  cancelBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
});
