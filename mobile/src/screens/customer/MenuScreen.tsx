import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { restaurantApi } from '../../api/client';
import { Restaurant, MenuItem } from '../../types';
import { useCart } from '../../context/CartContext';

export default function MenuScreen({ route, navigation }: { route: any; navigation: any }) {
  const { restaurant: summary } = route.params as { restaurant: { id: string; name: string } };
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const { addItem, items: cartItems, total } = useCart();

  const load = useCallback(async () => {
    try {
      const data = await restaurantApi.menu(summary.id);
      setRestaurant(data);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  }, [summary.id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleAdd = (item: MenuItem) => {
    addItem(summary.id, summary.name, {
      menuItemId: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
    });
    Alert.alert('Added!', `${item.name} added to cart`, [
      { text: 'View Cart', onPress: () => navigation.navigate('Cart') },
      { text: 'Continue', style: 'cancel' },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  if (!restaurant) return null;

  return (
    <View style={styles.container}>
      <FlatList
        data={restaurant.menu}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ padding: 16, paddingBottom: cartItems.length ? 80 : 16 }}
        ListHeaderComponent={
          <View style={styles.header}>
            {restaurant.imageUrl && (
              <Image source={{ uri: restaurant.imageUrl }} style={styles.heroImage} />
            )}
            <Text style={styles.cuisine}>{restaurant.cuisine}</Text>
            <Text style={styles.desc}>{restaurant.description}</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            {item.imageUrl && (
              <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
            )}
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemDesc}>{item.description}</Text>
              <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
            </View>
            <TouchableOpacity style={styles.addBtn} onPress={() => handleAdd(item)}>
              <Text style={styles.addBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        )}
      />
      {cartItems.length > 0 && (
        <TouchableOpacity style={styles.cartBar} onPress={() => navigation.navigate('Cart')}>
          <Text style={styles.cartBarText}>
            View Cart ({cartItems.length} items) · ${total.toFixed(2)}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { marginBottom: 16 },
  heroImage: { width: '100%', height: 180, borderRadius: 12, marginBottom: 8 },
  cuisine: { fontSize: 14, color: '#FF6B35', fontWeight: '600', marginBottom: 4 },
  desc: { fontSize: 13, color: '#666', marginBottom: 8 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 12,
    flexDirection: 'row',
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  itemImage: { width: 80, height: 80 },
  itemInfo: { flex: 1, padding: 10 },
  itemName: { fontWeight: 'bold', fontSize: 14, color: '#222', marginBottom: 2 },
  itemDesc: { fontSize: 12, color: '#888', marginBottom: 4 },
  itemPrice: { fontSize: 14, fontWeight: '700', color: '#FF6B35' },
  addBtn: {
    backgroundColor: '#FF6B35',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginRight: 10,
  },
  addBtnText: { color: '#fff', fontSize: 24, lineHeight: 28 },
  cartBar: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: '#FF6B35',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  cartBarText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
});
