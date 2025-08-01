import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import type { DrawerContentComponentProps } from '@react-navigation/drawer';

import { useColorScheme } from '@/components/useColorScheme';
import Login from '../components/(auth)/login';
import { useAuthStore } from '@/stores/authStore';
import { Drawer } from 'expo-router/drawer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const queryClient = new QueryClient();
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  const { isLoading, isLoggedIn } = useAuthStore();

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  if (!isLoggedIn) {
    return <Login />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <RootLayoutNav />
    </QueryClientProvider>
  );
}

function CustomDrawerContent(props: DrawerContentComponentProps) {
  // Only show allowed drawer items - exclude view-pr from drawer menu
  const allowed = ['(tabs)', '(pr-stack)', '(quotation-stack)', '(purchase-order)', 'logout']; // Only show tabs and pr-stack in drawer
  const filteredProps = {
    ...props,
    state: {
      ...props.state,
      routeNames: props.state.routeNames.filter((name: string) => allowed.includes(name)),
      routes: props.state.routes.filter((route: { name: string }) => allowed.includes(route.name)),
    },
  };
  return (
    <DrawerContentScrollView {...filteredProps}>
      <DrawerItemList {...filteredProps} />
    </DrawerContentScrollView>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Drawer
          drawerContent={props => <CustomDrawerContent {...props} />}
          screenOptions={{
            headerShown: true,
            drawerType: 'front',
          }}
        >
          <Drawer.Screen
            name="(tabs)"
            options={{
              drawerLabel: 'Home',
              title: 'Home',
            }}
          />
          <Drawer.Screen
            name="(pr-stack)"
            options={{
              drawerLabel: 'Purchase Requests',
              title: 'Purchase Requests',
            }}
          />
          <Drawer.Screen
            name="(quotation-stack)"
            options={{
              drawerLabel: 'Quotations',
              title: 'Quotations',
            }}
          />
          <Drawer.Screen
            name="(purchase-order)"
            options={{
              drawerLabel: 'Purchase Orders',
              title: 'Purchase Orders',
            }}
          />
          <Drawer.Screen
            name="logout"
            options={{
              drawerLabel: 'Log Out',
              title: 'Log Out',
              headerShown: false,
            }}
          />
        </Drawer>
      </GestureHandlerRootView>
    </ThemeProvider>
  );
}