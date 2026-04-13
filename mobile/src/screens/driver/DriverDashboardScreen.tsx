import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { driverApi } from '../../api/client';
import { Order } from '../../types';

const COMMISSION = 0.1;

interface Earnings {
  todayEarnings: number;
  monthlyEarnings: number;
  totalEarnings: number;
  todayDeliveries: number;
  monthlyDeliveries: number;
  totalDeliveries: number;
  recentDeliveries: Order[];
}

export default function DriverDashboardScreen() {
  const [earnings, setEarnings] = useState<Earnings | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await driverApi.earnings();
      setEarnings(data);
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

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  const e = earnings!;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: 16 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
    >
      <Text style={styles.title}>My Earnings</Text>

      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: '#FF6B35' }]}>
          <Text style={styles.statAmount}>${e.todayEarnings.toFixed(2)}</Text>
          <Text style={styles.statLabel}>Today</Text>
          <Text style={styles.statSub}>{e.todayDeliveries} deliveries</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#8b5cf6' }]}>
          <Text style={styles.statAmount}>${e.monthlyEarnings.toFixed(2)}</Text>
          <Text style={styles.statLabel}>This Month</Text>
          <Text style={styles.statSub}>{e.monthlyDeliveries} deliveries</Text>
        </View>
      </View>

      <View style={styles.totalCard}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>💰 Total Earnings</Text>
          <Text style={styles.totalValue}>${e.totalEarnings.toFixed(2)}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>🚗 Total Deliveries</Text>
          <Text style={styles.totalValue}>{e.totalDeliveries}</Text>
        </View>
        <View style={styles.commissionNote}>
          <Text style={styles.commissionText}>💡 You earn 10% commission on each order total</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Recent Deliveries</Text>
      {e.recentDeliveries.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyIcon}>🚗</Text>
          <Text style={styles.emptyText}>No deliveries yet</Text>
          <Text style={styles.emptySubText}>Complete your first delivery to start earning!</Text>
        </View>
      ) : (
        e.recentDeliveries.map((order) => (
          <View key={order.id} style={styles.deliveryCard}>
            <View style={styles.deliveryTop}>
              <Text style={styles.deliveryId}>#{order.id.slice(-6).toUpperCase()}</Text>
              <Text style={styles.deliveryEarning}>
                +${(order.total * COMMISSION).toFixed(2)}
              </Text>
            </View>
            <Text style={styles.deliveryRest}>{order.restaurantName}</Text>
            <Text style={styles.deliveryAddr}>📍 {order.deliveryAddress}</Text>
            <Text style={styles.deliveryDate}>{new Date(order.updatedAt).toLocaleString()}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#222', marginBottom: 16 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  statCard: {
    flex: 1,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  statAmount: { fontSize: 26, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  statLabel: { fontSize: 13, color: '#fff', fontWeight: '600', marginBottom: 2 },
  statSub: { fontSize: 11, color: 'rgba(255,255,255,0.8)' },
  totalCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  totalLabel: { fontSize: 15, color: '#555' },
  totalValue: { fontSize: 15, fontWeight: '700', color: '#222' },
  commissionNote: {
    backgroundColor: '#FFF3EE',
    borderRadius: 8,
    padding: 10,
    marginTop: 4,
  },
  commissionText: { fontSize: 12, color: '#FF6B35', fontWeight: '500' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#444', marginBottom: 12 },
  emptyBox: { alignItems: 'center', paddingVertical: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 17, fontWeight: '700', color: '#444', marginBottom: 4 },
  emptySubText: { fontSize: 13, color: '#888', textAlign: 'center' },
  deliveryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  deliveryTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  deliveryId: { fontSize: 13, fontWeight: '700', color: '#222' },
  deliveryEarning: { fontSize: 14, fontWeight: '700', color: '#10b981' },
  deliveryRest: { fontSize: 14, color: '#555', marginBottom: 4 },
  deliveryAddr: { fontSize: 12, color: '#888', marginBottom: 4 },
  deliveryDate: { fontSize: 11, color: '#aaa' },
});
