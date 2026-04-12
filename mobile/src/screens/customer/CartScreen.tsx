import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
} from 'react-native';
import { useCart } from '../../context/CartContext';
import { orderApi } from '../../api/client';

export default function CartScreen({ navigation }: { navigation: any }) {
  const { restaurantId, restaurantName, items, removeItem, clearCart, total } = useCart();
  const [address, setAddress] = useState('');
  const [placing, setPlacing] = useState(false);

  const handlePlaceOrder = async () => {
    if (!address.trim()) {
      Alert.alert('Error', 'Please enter a delivery address');
      return;
    }
    if (!restaurantId || items.length === 0) {
      Alert.alert('Error', 'Cart is empty');
      return;
    }
    setPlacing(true);
    try {
      const order = await orderApi.create({
        restaurantId,
        items: items.map((i) => ({ menuItemId: i.menuItemId, quantity: i.quantity })),
        deliveryAddress: address.trim(),
      });
      clearCart();
      Alert.alert('Order Placed!', `Your order #${order.id.slice(0, 8)} has been placed.`, [
        { text: 'View Orders', onPress: () => navigation.navigate('Orders') },
      ]);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setPlacing(false);
    }
  };

  if (items.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyIcon}>🛒</Text>
        <Text style={styles.emptyText}>Your cart is empty</Text>
        <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('Restaurants')}>
          <Text style={styles.btnText}>Browse Restaurants</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(i) => i.menuItemId}
        contentContainerStyle={{ padding: 16, paddingBottom: 200 }}
        ListHeaderComponent={
          <Text style={styles.restName}>{restaurantName}</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={styles.rowInfo}>
              <Text style={styles.rowName}>{item.name}</Text>
              <Text style={styles.rowPrice}>${(item.price * item.quantity).toFixed(2)}</Text>
            </View>
            <Text style={styles.qty}>×{item.quantity}</Text>
            <TouchableOpacity onPress={() => removeItem(item.menuItemId)} style={styles.removeBtn}>
              <Text style={styles.removeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>
        )}
        ListFooterComponent={
          <View>
            <View style={styles.divider} />
            <Text style={styles.totalText}>Total: ${total.toFixed(2)}</Text>
            <TextInput
              style={styles.input}
              placeholder="Delivery address"
              placeholderTextColor="#999"
              value={address}
              onChangeText={setAddress}
              multiline
            />
            <TouchableOpacity
              style={styles.btn}
              onPress={handlePlaceOrder}
              disabled={placing}
            >
              <Text style={styles.btnText}>{placing ? 'Placing...' : 'Place Order'}</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyText: { fontSize: 18, color: '#666', marginBottom: 24 },
  restName: { fontSize: 20, fontWeight: 'bold', color: '#222', marginBottom: 16 },
  row: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowInfo: { flex: 1 },
  rowName: { fontSize: 14, fontWeight: '600', color: '#333' },
  rowPrice: { fontSize: 13, color: '#FF6B35', marginTop: 2 },
  qty: { fontSize: 16, color: '#666', marginHorizontal: 8 },
  removeBtn: { padding: 4 },
  removeBtnText: { color: '#e05', fontSize: 14 },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 16 },
  totalText: { fontSize: 18, fontWeight: 'bold', color: '#222', marginBottom: 16 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#333',
    marginBottom: 16,
    minHeight: 60,
  },
  btn: {
    backgroundColor: '#FF6B35',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
