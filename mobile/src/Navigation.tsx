import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, ActivityIndicator, View } from 'react-native';

import { useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Auth screens
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';

// Shared
import ProfileScreen from './screens/ProfileScreen';
import ChatScreen from './screens/ChatScreen';

// Customer screens
import RestaurantsScreen from './screens/customer/RestaurantsScreen';
import MenuScreen from './screens/customer/MenuScreen';
import CartScreen from './screens/customer/CartScreen';
import OrdersScreen from './screens/customer/OrdersScreen';
import OrderDetailScreen from './screens/customer/OrderDetailScreen';
import AddressesScreen from './screens/customer/AddressesScreen';

// Driver screens
import AvailableOrdersScreen from './screens/driver/AvailableOrdersScreen';
import MyDeliveriesScreen from './screens/driver/MyDeliveriesScreen';
import DeliveryDetailScreen from './screens/driver/DeliveryDetailScreen';
import DriverChatListScreen from './screens/driver/DriverChatListScreen';
import DriverDashboardScreen from './screens/driver/DriverDashboardScreen';

// Restaurant screens
import RestaurantOrdersScreen from './screens/restaurant/RestaurantOrdersScreen';
import RestaurantSettingsScreen from './screens/restaurant/RestaurantSettingsScreen';
import RestaurantMenuScreen from './screens/restaurant/RestaurantMenuScreen';
import RestaurantMenuItemEditScreen from './screens/restaurant/RestaurantMenuItemEditScreen';
import RestaurantDashboardScreen from './screens/restaurant/RestaurantDashboardScreen';

// Admin screens
import AdminDashboardScreen from './screens/admin/AdminDashboardScreen';
import AdminUsersScreen from './screens/admin/AdminUsersScreen';
import AdminUserEditScreen from './screens/admin/AdminUserEditScreen';
import AdminChatScreen from './screens/admin/AdminChatScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

function CustomerRestaurantsStack() {
  return (
    <Stack.Navigator
      screenOptions={{ headerTintColor: '#FF6B35', headerTitleStyle: { color: '#222' } }}
    >
      <Stack.Screen name="Restaurants" component={RestaurantsScreen} options={{ title: 'Restaurants' }} />
      <Stack.Screen
        name="Menu"
        component={MenuScreen}
        options={({ route }: any) => ({ title: route.params?.restaurant?.name ?? 'Menu' })}
      />
      <Stack.Screen name="Cart" component={CartScreen} options={{ title: 'Your Cart' }} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} options={{ title: 'Order Details' }} />
      <Stack.Screen name="Chat" component={ChatScreen} options={{ title: 'Order Chat' }} />
    </Stack.Navigator>
  );
}

function CustomerOrdersStack() {
  return (
    <Stack.Navigator
      screenOptions={{ headerTintColor: '#FF6B35', headerTitleStyle: { color: '#222' } }}
    >
      <Stack.Screen name="Orders" component={OrdersScreen} options={{ title: 'My Orders' }} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} options={{ title: 'Order Details' }} />
      <Stack.Screen name="Chat" component={ChatScreen} options={{ title: 'Order Chat' }} />
    </Stack.Navigator>
  );
}

function CustomerTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#FF6B35',
        tabBarInactiveTintColor: '#999',
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="RestaurantsTab"
        component={CustomerRestaurantsStack}
        options={{ title: 'Restaurants', tabBarLabel: 'Restaurants', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🍽️</Text> }}
      />
      <Tab.Screen
        name="OrdersTab"
        component={CustomerOrdersStack}
        options={{ title: 'Orders', tabBarLabel: 'Orders', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>📋</Text> }}
      />
      <Tab.Screen
        name="AddressesTab"
        component={AddressesScreen}
        options={{ title: 'Addresses', tabBarLabel: 'Addresses', headerShown: true, tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>📍</Text> }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{ title: 'Profile', tabBarLabel: 'Profile', headerShown: true, tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>👤</Text> }}
      />
    </Tab.Navigator>
  );
}

function DriverAvailableStack() {
  return (
    <Stack.Navigator
      screenOptions={{ headerTintColor: '#FF6B35', headerTitleStyle: { color: '#222' } }}
    >
      <Stack.Screen name="AvailableOrders" component={AvailableOrdersScreen} options={{ title: 'Available Orders' }} />
    </Stack.Navigator>
  );
}

function DriverDeliveriesStack() {
  return (
    <Stack.Navigator
      screenOptions={{ headerTintColor: '#FF6B35', headerTitleStyle: { color: '#222' } }}
    >
      <Stack.Screen name="MyDeliveries" component={MyDeliveriesScreen} options={{ title: 'My Deliveries' }} />
      <Stack.Screen name="DeliveryDetail" component={DeliveryDetailScreen} options={{ title: 'Delivery Details' }} />
      <Stack.Screen name="Chat" component={ChatScreen} options={{ title: 'Order Chat' }} />
    </Stack.Navigator>
  );
}

function DriverChatStack() {
  return (
    <Stack.Navigator
      screenOptions={{ headerTintColor: '#FF6B35', headerTitleStyle: { color: '#222' } }}
    >
      <Stack.Screen name="DriverChatList" component={DriverChatListScreen} options={{ title: 'Chats' }} />
      <Stack.Screen name="Chat" component={ChatScreen} options={{ title: 'Order Chat' }} />
    </Stack.Navigator>
  );
}

function DriverTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#FF6B35',
        tabBarInactiveTintColor: '#999',
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="AvailableTab"
        component={DriverAvailableStack}
        options={{ title: 'Available', tabBarLabel: 'Available', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🔍</Text> }}
      />
      <Tab.Screen
        name="DeliveriesTab"
        component={DriverDeliveriesStack}
        options={{ title: 'Deliveries', tabBarLabel: 'My Deliveries', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🚗</Text> }}
      />
      <Tab.Screen
        name="DashboardTab"
        component={DriverDashboardScreen}
        options={{ title: 'Earnings', tabBarLabel: 'Earnings', headerShown: true, tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>💰</Text> }}
      />
      <Tab.Screen
        name="ChatTab"
        component={DriverChatStack}
        options={{ title: 'Chat', tabBarLabel: 'Chat', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>💬</Text> }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{ title: 'Profile', tabBarLabel: 'Profile', headerShown: true, tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>👤</Text> }}
      />
    </Tab.Navigator>
  );
}

function RestaurantOrdersStack() {
  return (
    <Stack.Navigator
      screenOptions={{ headerTintColor: '#FF6B35', headerTitleStyle: { color: '#222' } }}
    >
      <Stack.Screen name="RestaurantOrders" component={RestaurantOrdersScreen} options={{ title: 'Orders' }} />
      <Stack.Screen name="Chat" component={ChatScreen} options={{ title: 'Order Chat' }} />
    </Stack.Navigator>
  );
}

function RestaurantMenuStack() {
  return (
    <Stack.Navigator
      screenOptions={{ headerTintColor: '#FF6B35', headerTitleStyle: { color: '#222' } }}
    >
      <Stack.Screen name="RestaurantMenu" component={RestaurantMenuScreen} options={{ title: 'My Menu' }} />
      <Stack.Screen name="RestaurantMenuItemEdit" component={RestaurantMenuItemEditScreen} options={{ title: 'Menu Item' }} />
    </Stack.Navigator>
  );
}

function RestaurantTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#FF6B35',
        tabBarInactiveTintColor: '#999',
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="OrdersTab"
        component={RestaurantOrdersStack}
        options={{ title: 'Orders', tabBarLabel: 'Orders', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>📋</Text> }}
      />
      <Tab.Screen
        name="MenuTab"
        component={RestaurantMenuStack}
        options={{ title: 'Menu', tabBarLabel: 'Menu', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🍔</Text> }}
      />
      <Tab.Screen
        name="DashboardTab"
        component={RestaurantDashboardScreen}
        options={{ title: 'Dashboard', tabBarLabel: 'Dashboard', headerShown: true, tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>📊</Text> }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={RestaurantSettingsScreen}
        options={{ title: 'Settings', tabBarLabel: 'Settings', headerShown: true, tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>⚙️</Text> }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{ title: 'Profile', tabBarLabel: 'Profile', headerShown: true, tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>👤</Text> }}
      />
    </Tab.Navigator>
  );
}

function AdminStack() {
  return (
    <Stack.Navigator
      screenOptions={{ headerTintColor: '#FF6B35', headerTitleStyle: { color: '#222' } }}
    >
      <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} options={{ title: 'Admin Dashboard' }} />
      <Stack.Screen name="AdminUsers" component={AdminUsersScreen} options={{ title: 'Manage Users' }} />
      <Stack.Screen name="AdminUserEdit" component={AdminUserEditScreen} options={{ title: 'User' }} />
      <Stack.Screen name="AdminChatMessage" component={ChatScreen} options={{ title: 'Order Chat' }} />
    </Stack.Navigator>
  );
}

function AdminChatStack() {
  return (
    <Stack.Navigator
      screenOptions={{ headerTintColor: '#FF6B35', headerTitleStyle: { color: '#222' } }}
    >
      <Stack.Screen name="AdminChatList" component={AdminChatScreen} options={{ title: 'Chat' }} />
      <Stack.Screen name="AdminChatMessage" component={ChatScreen} options={{ title: 'Order Chat' }} />
    </Stack.Navigator>
  );
}

function AdminTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#FF6B35',
        tabBarInactiveTintColor: '#999',
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="DashboardTab"
        component={AdminStack}
        options={{ title: 'Dashboard', tabBarLabel: 'Dashboard', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🛡️</Text> }}
      />
      <Tab.Screen
        name="AdminChatTab"
        component={AdminChatStack}
        options={{ title: 'Chat', tabBarLabel: 'Chat', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>💬</Text> }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{ title: 'Profile', tabBarLabel: 'Profile', headerShown: true, tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>👤</Text> }}
      />
    </Tab.Navigator>
  );
}


export default function Navigation() {
  const { user, token, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <CartProvider>
        {!token ? (
          <AuthStack />
        ) : user?.role === 'driver' ? (
          <DriverTabs />
        ) : user?.role === 'restaurant' ? (
          <RestaurantTabs />
        ) : user?.role === 'admin' ? (
          <AdminTabs />
        ) : (
          <CustomerTabs />
        )}
      </CartProvider>
    </NavigationContainer>
  );
}

