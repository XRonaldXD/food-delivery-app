import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  TextInput,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { restaurantApi } from '../../api/client';
import { Order } from '../../types';

interface RevenueData {
  totalRevenue: number;
  monthlyRevenue: number;
  totalOrders: number;
  orders: Order[];
}

export default function RestaurantDashboardScreen() {
  const [data, setData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const load = useCallback(async (start?: string, end?: string) => {
    try {
      const result = await restaurantApi.revenue(start || undefined, end || undefined);
      setData(result);
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

  const handleFilter = () => {
    setLoading(true);
    load(startDate || undefined, endDate || undefined);
  };

  const handleClear = () => {
    setStartDate('');
    setEndDate('');
    setLoading(true);
    load();
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: 16 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(startDate || undefined, endDate || undefined); }} />}
    >
      <Text style={styles.sectionTitle}>Summary</Text>
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statAmount}>${(data?.monthlyRevenue ?? 0).toFixed(2)}</Text>
          <Text style={styles.statLabel}>This Month</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statAmount}>${(data?.totalRevenue ?? 0).toFixed(2)}</Text>
          <Text style={styles.statLabel}>All Time</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statAmount}>{data?.totalOrders ?? 0}</Text>
          <Text style={styles.statLabel}>Orders</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Date Range Filter</Text>
      <View style={styles.filterRow}>
        <TextInput
          style={[styles.input, { flex: 1, marginRight: 8 }]}
          value={startDate}
          onChangeText={setStartDate}
          placeholder="Start YYYY-MM-DD"
          placeholderTextColor="#999"
        />
        <TextInput
          style={[styles.input, { flex: 1 }]}
          value={endDate}
          onChangeText={setEndDate}
          placeholder="End YYYY-MM-DD"
          placeholderTextColor="#999"
        />
      </View>
      <View style={styles.filterBtns}>
        <TouchableOpacity style={styles.filterBtn} onPress={handleFilter}>
          <Text style={styles.filterBtnText}>Apply Filter</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.clearBtn} onPress={handleClear}>
          <Text style={styles.clearBtnText}>Clear</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Delivered Orders {(startDate || endDate) ? '(filtered)' : ''}</Text>
      {(data?.orders ?? []).length === 0 ? (
        <Text style={styles.empty}>No delivered orders in this period</Text>
      ) : (
        (data?.orders ?? []).map((o) => (
          <View key={o.id} style={styles.orderCard}>
            <View style={styles.orderRow}>
              <Text style={styles.orderId}>#{o.id.slice(-6).toUpperCase()}</Text>
              <Text style={styles.orderTotal}>${o.total.toFixed(2)}</Text>
            </View>
            <Text style={styles.orderDate}>{new Date(o.createdAt).toLocaleDateString()}</Text>
            <Text style={styles.orderAddr}>📍 {o.deliveryAddress}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 12, marginTop: 8 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statCard: {
    flex: 1,
    backgroundColor: '#FF6B35',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
  },
  statAmount: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  statLabel: { fontSize: 11, color: '#fff', opacity: 0.85, marginTop: 4 },
  filterRow: { flexDirection: 'row', marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: '#333',
    backgroundColor: '#fff',
  },
  filterBtns: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  filterBtn: {
    flex: 1,
    backgroundColor: '#FF6B35',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  filterBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  clearBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  clearBtnText: { color: '#666', fontSize: 14 },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  orderRow: { flexDirection: 'row', justifyContent: 'space-between' },
  orderId: { fontSize: 14, fontWeight: '700', color: '#222' },
  orderTotal: { fontSize: 14, fontWeight: '700', color: '#FF6B35' },
  orderDate: { fontSize: 12, color: '#888', marginTop: 2 },
  orderAddr: { fontSize: 12, color: '#666', marginTop: 2 },
  empty: { textAlign: 'center', color: '#888', marginTop: 20 },
});
