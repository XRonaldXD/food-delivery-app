import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
  SectionList,
  TouchableOpacity,
} from 'react-native';
import { adminApi } from '../../api/client';
import { User, Order } from '../../types';

interface RevenueData {
  totalRevenue: number;
  perRestaurant: Array<{ restaurantId: string; restaurantName: string; revenue: number; orderCount: number }>;
  ordersByStatus: Record<string, number>;
  totalOrders: number;
}

export default function AdminDashboardScreen({ navigation }: { navigation: any }) {
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [revenue, setRevenue] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [u, o, r] = await Promise.all([adminApi.users(), adminApi.orders(), adminApi.revenue()]);
      setUsers(u);
      setOrders(o.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
      setRevenue(r);
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

  const roleCounts = users.reduce<Record<string, number>>((acc, u) => {
    acc[u.role] = (acc[u.role] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <SectionList
      style={styles.list}
      contentContainerStyle={{ padding: 16 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => { setRefreshing(true); load(); }}
        />
      }
      sections={[
        { title: 'Overview', data: ['stats'] },
        { title: 'Revenue', data: ['revenue'] },
        { title: `Users (${users.length})`, data: ['users_header'] },
        { title: `Orders (${orders.length})`, data: orders.map((o) => ({ type: 'order', item: o })) as any[] },
      ]}
      keyExtractor={(item, index) => (typeof item === 'string' ? item : item.item?.id ?? String(index))}
      renderSectionHeader={({ section: { title } }) => (
        <Text style={styles.sectionHeader}>{title}</Text>
      )}
      renderItem={({ item }) => {
        if (item === 'stats') {
          return (
            <View style={styles.statsGrid}>
              {Object.entries(roleCounts).map(([role, count]) => (
                <View key={role} style={styles.statCard}>
                  <Text style={styles.statCount}>{count}</Text>
                  <Text style={styles.statLabel}>{role}s</Text>
                </View>
              ))}
              <View style={styles.statCard}>
                <Text style={styles.statCount}>{orders.length}</Text>
                <Text style={styles.statLabel}>orders</Text>
              </View>
            </View>
          );
        }
        if (item === 'revenue') {
          return (
            <View>
              <View style={styles.revenueCard}>
                <Text style={styles.revenueLabel}>Total Revenue</Text>
                <Text style={styles.revenueAmount}>${(revenue?.totalRevenue ?? 0).toFixed(2)}</Text>
              </View>
              {(revenue?.perRestaurant ?? []).map((r) => (
                <View key={r.restaurantId} style={styles.revenueRow}>
                  <Text style={styles.revenueRestName}>{r.restaurantName}</Text>
                  <Text style={styles.revenueRestAmount}>${r.revenue.toFixed(2)} ({r.orderCount} orders)</Text>
                </View>
              ))}
            </View>
          );
        }
        if (item === 'users_header') {
          return (
            <TouchableOpacity style={styles.manageBtn} onPress={() => navigation.navigate('AdminUsers')}>
              <Text style={styles.manageBtnText}>👥 Manage Users</Text>
            </TouchableOpacity>
          );
        }
        if (item.type === 'order') {
          const o = item.item as Order;
          return (
            <View style={styles.card}>
              <View style={styles.row}>
                <Text style={styles.cardTitle}>#{o.id.slice(-6).toUpperCase()}</Text>
                <Text style={styles.statusText}>{o.status.replace('_', ' ')}</Text>
              </View>
              <Text style={styles.cardSub}>{o.restaurantName} → {o.deliveryAddress}</Text>
              <Text style={styles.cardSub}>${o.total.toFixed(2)}</Text>
            </View>
          );
        }
        return null;
      }}
    />
  );
}

const styles = StyleSheet.create({
  list: { backgroundColor: '#f9f9f9' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  sectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    backgroundColor: '#f9f9f9',
    paddingVertical: 8,
  },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    minWidth: 80,
    marginRight: 10,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  statCount: { fontSize: 24, fontWeight: 'bold', color: '#FF6B35' },
  statLabel: { fontSize: 12, color: '#666', textTransform: 'capitalize' },
  revenueCard: {
    backgroundColor: '#FF6B35',
    borderRadius: 10,
    padding: 16,
    marginBottom: 10,
    alignItems: 'center',
  },
  revenueLabel: { color: '#fff', fontSize: 13, opacity: 0.9 },
  revenueAmount: { color: '#fff', fontSize: 28, fontWeight: 'bold', marginTop: 4 },
  revenueRow: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  revenueRestName: { fontSize: 14, fontWeight: '600', color: '#222' },
  revenueRestAmount: { fontSize: 13, color: '#666' },
  manageBtn: {
    backgroundColor: '#FF6B35',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  manageBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#222' },
  cardSub: { fontSize: 13, color: '#666', marginTop: 2 },
  statusText: { fontSize: 13, color: '#888', textTransform: 'capitalize' },
});

