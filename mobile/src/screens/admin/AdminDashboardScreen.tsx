import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
  SectionList,
} from 'react-native';
import { adminApi } from '../../api/client';
import { User, Order } from '../../types';

export default function AdminDashboardScreen() {
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [u, o] = await Promise.all([adminApi.users(), adminApi.orders()]);
      setUsers(u);
      setOrders(o.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
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
        { title: `Users (${users.length})`, data: users.map((u) => ({ type: 'user', item: u })) as any[] },
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
        if (item.type === 'user') {
          const u = item.item as User;
          return (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{u.name}</Text>
              <Text style={styles.cardSub}>{u.email}</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{u.role}</Text>
              </View>
            </View>
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
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFF3EE',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginTop: 6,
  },
  badgeText: { color: '#FF6B35', fontSize: 12, fontWeight: '600' },
  statusText: { fontSize: 13, color: '#888', textTransform: 'capitalize' },
});
