import { StyleSheet } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useAuthStore } from '@/stores/authStore';

export default function TabOneScreen() {
  const { user } = useAuthStore();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hello, {user?.profile.name}</Text>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      <View style={styles.centerContent}>
        <Text style={styles.comingSoon}>Dashboard Coming Soon!</Text>
        <Text style={styles.subtitle}>
          We're working hard to bring you a new dashboard experience. Stay tuned!
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 32,
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
    alignSelf: 'center',
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  comingSoon: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 24,
    color: '#888',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
});
