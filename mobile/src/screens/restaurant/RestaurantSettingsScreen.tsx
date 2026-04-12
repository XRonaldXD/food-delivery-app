import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  Switch,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { restaurantApi } from '../../api/client';

export default function RestaurantSettingsScreen() {
  const [autoAccept, setAutoAccept] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await restaurantApi.getSettings();
      setAutoAccept(data.autoAccept);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleToggle = async (value: boolean) => {
    setSaving(true);
    try {
      const data = await restaurantApi.updateSettings({ autoAccept: value });
      setAutoAccept(data.autoAccept);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.textBlock}>
            <Text style={styles.settingTitle}>Auto-Accept Orders</Text>
            <Text style={styles.settingDesc}>
              When enabled, incoming orders are automatically accepted without manual review.
            </Text>
          </View>
          <Switch
            value={autoAccept}
            onValueChange={handleToggle}
            disabled={saving}
            trackColor={{ false: '#d1d5db', true: '#FF6B35' }}
            thumbColor="#fff"
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  textBlock: { flex: 1, marginRight: 16 },
  settingTitle: { fontSize: 16, fontWeight: '700', color: '#222', marginBottom: 4 },
  settingDesc: { fontSize: 13, color: '#666', lineHeight: 18 },
});
