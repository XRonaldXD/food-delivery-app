import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { restaurantApi } from '../../api/client';
import { MenuItem } from '../../types';

export default function RestaurantMenuItemEditScreen({ route, navigation }: { route: any; navigation: any }) {
  const existingItem: MenuItem | null = route.params?.item ?? null;
  const isEdit = !!existingItem;

  const [name, setName] = useState(existingItem?.name ?? '');
  const [description, setDescription] = useState(existingItem?.description ?? '');
  const [price, setPrice] = useState(existingItem?.price?.toString() ?? '');
  const [imageUrl, setImageUrl] = useState(existingItem?.imageUrl ?? '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name || !description || !price) {
      Alert.alert('Error', 'Name, description, and price are required');
      return;
    }
    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      Alert.alert('Error', 'Price must be a positive number');
      return;
    }
    setSaving(true);
    try {
      if (isEdit) {
        await restaurantApi.updateMenuItem(existingItem!.id, {
          name, description, price: priceNum, imageUrl: imageUrl || undefined,
        });
      } else {
        await restaurantApi.addMenuItem({
          name, description, price: priceNum, imageUrl: imageUrl || undefined,
        });
      }
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#fff' }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{isEdit ? 'Edit Menu Item' : 'New Menu Item'}</Text>

        <Text style={styles.label}>Name *</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Item name" placeholderTextColor="#999" />

        <Text style={styles.label}>Description *</Text>
        <TextInput
          style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
          value={description}
          onChangeText={setDescription}
          placeholder="Item description"
          placeholderTextColor="#999"
          multiline
        />

        <Text style={styles.label}>Price *</Text>
        <TextInput
          style={styles.input}
          value={price}
          onChangeText={setPrice}
          placeholder="0.00"
          placeholderTextColor="#999"
          keyboardType="decimal-pad"
        />

        <Text style={styles.label}>Image URL (optional)</Text>
        <TextInput
          style={styles.input}
          value={imageUrl}
          onChangeText={setImageUrl}
          placeholder="https://..."
          placeholderTextColor="#999"
          autoCapitalize="none"
        />

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>{isEdit ? 'Save Changes' : 'Add Item'}</Text>}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, paddingTop: 32 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#222', marginBottom: 24, textAlign: 'center' },
  label: { fontSize: 13, color: '#666', marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 14,
    fontSize: 15,
    color: '#333',
  },
  saveBtn: {
    backgroundColor: '#FF6B35',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
