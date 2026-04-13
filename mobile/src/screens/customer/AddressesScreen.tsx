import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
} from 'react-native';
import { addressApi } from '../../api/client';
import { Address } from '../../types';

export default function AddressesScreen() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<Address | null>(null);
  const [label, setLabel] = useState('');
  const [address, setAddress] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await addressApi.list();
      setAddresses(data);
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

  const openAdd = () => {
    setEditing(null);
    setLabel('');
    setAddress('');
    setModalVisible(true);
  };

  const openEdit = (item: Address) => {
    setEditing(item);
    setLabel(item.label);
    setAddress(item.address);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!address.trim()) {
      Alert.alert('Error', 'Address is required');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        const updated = await addressApi.update(editing.id, { label: label.trim() || 'Home', address: address.trim() });
        setAddresses((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      } else {
        const created = await addressApi.add({ label: label.trim() || 'Home', address: address.trim() });
        setAddresses((prev) => [created, ...prev]);
      }
      setModalVisible(false);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (item: Address) => {
    Alert.alert('Delete Address', `Delete "${item.label}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await addressApi.remove(item.id);
            setAddresses((prev) => prev.filter((a) => a.id !== item.id));
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
    <View style={styles.container}>
      <FlatList
        data={addresses}
        keyExtractor={(a) => a.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📍</Text>
            <Text style={styles.emptyText}>No saved addresses yet</Text>
            <Text style={styles.emptySubText}>Tap + to add your first address</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardContent}>
              <Text style={styles.cardLabel}>{item.label}</Text>
              <Text style={styles.cardAddress}>{item.address}</Text>
            </View>
            <View style={styles.cardActions}>
              <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(item)}>
                <Text style={styles.editBtnText}>✏️</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item)}>
                <Text style={styles.deleteBtnText}>🗑️</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <TouchableOpacity style={styles.fab} onPress={openAdd}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>{editing ? 'Edit Address' : 'Add Address'}</Text>
            <Text style={styles.modalLabel}>Label</Text>
            <TextInput
              style={styles.modalInput}
              value={label}
              onChangeText={setLabel}
              placeholder="e.g. Home, Work, Office"
              placeholderTextColor="#999"
            />
            <Text style={styles.modalLabel}>Address</Text>
            <TextInput
              style={[styles.modalInput, styles.modalInputMulti]}
              value={address}
              onChangeText={setAddress}
              placeholder="Enter full delivery address"
              placeholderTextColor="#999"
              multiline
              numberOfLines={3}
            />
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveBtnText}>{editing ? 'Save Changes' : 'Add Address'}</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 56, marginBottom: 12 },
  emptyText: { fontSize: 17, fontWeight: '700', color: '#444', marginBottom: 6 },
  emptySubText: { fontSize: 14, color: '#888' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  cardContent: { flex: 1 },
  cardLabel: { fontSize: 15, fontWeight: '700', color: '#222', marginBottom: 4 },
  cardAddress: { fontSize: 13, color: '#666', lineHeight: 18 },
  cardActions: { flexDirection: 'row', gap: 8, marginLeft: 10 },
  editBtn: { padding: 8 },
  editBtnText: { fontSize: 18 },
  deleteBtn: { padding: 8 },
  deleteBtnText: { fontSize: 18 },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 32,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#FF6B35',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  fabText: { color: '#fff', fontSize: 30, lineHeight: 34, fontWeight: '300' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#222', marginBottom: 20, textAlign: 'center' },
  modalLabel: { fontSize: 13, color: '#666', marginBottom: 4 },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 14,
    fontSize: 15,
    color: '#333',
  },
  modalInputMulti: { height: 80, textAlignVertical: 'top' },
  saveBtn: {
    backgroundColor: '#FF6B35',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  cancelBtn: { alignItems: 'center', padding: 8 },
  cancelBtnText: { color: '#999', fontSize: 14 },
});
