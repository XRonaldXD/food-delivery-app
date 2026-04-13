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
  RefreshControl,
  TextInput,
  ScrollView,
} from 'react-native';
import { restaurantApi } from '../../api/client';
import { RestaurantSummary } from '../../types';

export default function RestaurantsScreen({ navigation }: { navigation: any }) {
  const [restaurants, setRestaurants] = useState<RestaurantSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null);
  const [cuisines, setCuisines] = useState<string[]>([]);

  const load = useCallback(async (searchText?: string, cuisine?: string | null) => {
    try {
      const params: { search?: string; cuisine?: string } = {};
      if (searchText) params.search = searchText;
      if (cuisine) params.cuisine = cuisine;
      const data = await restaurantApi.list(params);
      setRestaurants(data);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const loadCuisines = useCallback(async () => {
    try {
      const data = await restaurantApi.list();
      const unique = Array.from(new Set(data.map((r) => r.cuisine).filter(Boolean)));
      setCuisines(unique);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    load();
    loadCuisines();
  }, [load, loadCuisines]);

  useEffect(() => {
    const unsubscribe = navigation.getParent()?.addListener('tabPress', () => {
      if (navigation.isFocused()) {
        setRefreshing(true);
        load(search || undefined, selectedCuisine);
      }
    });
    return () => unsubscribe?.();
  }, [navigation, load, search, selectedCuisine]);

  const handleSearch = (text: string) => {
    setSearch(text);
    load(text || undefined, selectedCuisine);
  };

  const handleCuisineSelect = (cuisine: string | null) => {
    setSelectedCuisine(cuisine);
    load(search || undefined, cuisine);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <TextInput
        style={styles.searchInput}
        placeholder="🔍 Search restaurants…"
        placeholderTextColor="#999"
        value={search}
        onChangeText={handleSearch}
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterRow}
      >
        <TouchableOpacity
          style={[styles.filterChip, !selectedCuisine && styles.filterChipActive]}
          onPress={() => handleCuisineSelect(null)}
        >
          <Text style={[styles.filterChipText, !selectedCuisine && styles.filterChipTextActive]}>All</Text>
        </TouchableOpacity>
        {cuisines.map((c) => (
          <TouchableOpacity
            key={c}
            style={[styles.filterChip, selectedCuisine === c && styles.filterChipActive]}
            onPress={() => handleCuisineSelect(c)}
          >
            <Text style={[styles.filterChipText, selectedCuisine === c && styles.filterChipTextActive]}>{c}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <FlatList
        style={styles.list}
        data={restaurants}
        keyExtractor={(r) => r.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(search || undefined, selectedCuisine); }} />}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyText}>No restaurants found</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('Menu', { restaurant: item })}
            activeOpacity={0.85}
          >
            {item.imageUrl ? (
              <Image source={{ uri: item.imageUrl }} style={styles.image} />
            ) : (
              <View style={[styles.image, styles.placeholder]} />
            )}
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.cuisine}>{item.cuisine}</Text>
              <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#f9f9f9' },
  list: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyText: { fontSize: 15, color: '#888' },
  searchInput: {
    margin: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: '#333',
    backgroundColor: '#fff',
  },
  filterScroll: { maxHeight: 48 },
  filterRow: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    borderWidth: 1.5,
    borderColor: '#FF6B35',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: '#fff',
  },
  filterChipActive: { backgroundColor: '#FF6B35' },
  filterChipText: { color: '#FF6B35', fontSize: 13, fontWeight: '600' },
  filterChipTextActive: { color: '#fff' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  image: { width: '100%', height: 160 },
  placeholder: { backgroundColor: '#eee' },
  info: { padding: 12 },
  name: { fontSize: 18, fontWeight: 'bold', color: '#222', marginBottom: 2 },
  cuisine: { fontSize: 13, color: '#FF6B35', marginBottom: 4, fontWeight: '600' },
  desc: { fontSize: 13, color: '#666' },
});
