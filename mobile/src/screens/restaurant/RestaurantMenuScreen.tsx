import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { restaurantApi } from '../../api/client';
import { MenuItem } from '../../types';

export default function RestaurantMenuScreen({ navigation }: { navigation: any }) {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await restaurantApi.getMenu();
      setItems(data);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => navigation.navigate('RestaurantMenuItemEdit', { item: null })} style={{ marginRight: 16 }}>
          <Text style={{ color: '#FF6B35', fontWeight: 'bold', fontSize: 28, lineHeight: 30 }}>+</Text>
        </TouchableOpacity>
      ),
    });
    load();
  }, [load, navigation]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', load);
    return unsubscribe;
  }, [navigation, load]);

  const handleDelete = (item: MenuItem) => {
    Alert.alert('Delete Item', `Delete "${item.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await restaurantApi.deleteMenuItem(item.id);
            setItems((prev) => prev.filter((i) => i.id !== item.id));
          } catch (e: any) {
            Alert.alert('Error', e.message);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.list}
      data={items}
      keyExtractor={(i) => i.id}
      contentContainerStyle={{ padding: 16 }}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={styles.cardRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardName}>{item.name}</Text>
              <Text style={styles.cardDesc}>{item.description}</Text>
              <Text style={styles.cardPrice}>${item.price.toFixed(2)}</Text>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => navigation.navigate('RestaurantMenuItemEdit', { item })}
              >
                <Text style={styles.editBtnText}>✏️ Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item)}>
                <Text style={styles.deleteBtnText}>🗑</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
      ListEmptyComponent={<Text style={styles.empty}>No menu items yet. Tap + to add one.</Text>}
    />
  );
}

const styles = StyleSheet.create({
  list: { backgroundColor: '#f9f9f9' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  cardRow: { flexDirection: 'row', alignItems: 'flex-start' },
  cardName: { fontSize: 15, fontWeight: '700', color: '#222' },
  cardDesc: { fontSize: 13, color: '#666', marginTop: 3 },
  cardPrice: { fontSize: 14, fontWeight: '700', color: '#FF6B35', marginTop: 6 },
  actions: { gap: 8, alignItems: 'flex-end' },
  editBtn: {
    borderWidth: 1,
    borderColor: '#FF6B35',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  editBtnText: { color: '#FF6B35', fontSize: 12, fontWeight: '600' },
  deleteBtn: { padding: 6 },
  deleteBtnText: { fontSize: 18 },
  empty: { textAlign: 'center', color: '#888', marginTop: 40 },
});
