import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { auth } from '../firebaseConfig';
import { getCurrentUserData } from '../pages/api/users';
import { colors } from './ui';

export default function Navbar({ navigation }) {
  const [admin, setAdmin] = useState(false);
  const route = useRoute();
  const insets = useSafeAreaInsets();
  useEffect(() => {
    let active = true;
    if (auth.currentUser) getCurrentUserData().then(data => {
      if (active) setAdmin(data?.admin === true);
    }).catch(error => console.warn('Unable to load navigation role:', error));
    return () => { active = false; };
  }, []);
  const tabs = [
    { label: 'Events', icon: 'calendar', screen: admin ? 'AdminEvents' : 'Events', active: ['Events', 'AdminEvents', 'ViewEvents'] },
    { label: 'Updates', icon: 'bell', screen: 'Notifications', active: ['Notifications'] },
    ...(admin ? [{ label: 'Volunteers', icon: 'users', screen: 'Volunteers', active: ['Volunteers', 'AdminVolunteers'] }] : []),
    { label: 'Profile', icon: 'user', screen: 'Profile', active: ['Profile'] }
  ];
  return <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 12) }]}>{tabs.map(tab => {
    const selected = tab.active.includes(route.name);
    return <TouchableOpacity key={tab.label} accessibilityRole="button" accessibilityLabel={tab.label} accessibilityState={{ selected }} onPress={() => navigation.navigate(tab.screen)} style={styles.tab}>
      <View style={[styles.icon, selected && styles.selected]}><Feather name={tab.icon} size={21} color={selected ? colors.primary : colors.muted}/></View>
      <Text style={[styles.label, selected && { color: colors.primary, fontWeight: '700' }]}>{tab.label}</Text>
    </TouchableOpacity>;
  })}</View>;
}
const styles = StyleSheet.create({
  bar: { flexDirection: 'row', backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 10, justifyContent: 'space-around' },
  tab: { flex: 1, alignItems: 'center', gap: 4 }, icon: { paddingVertical: 6, paddingHorizontal: 20, borderRadius: 20 }, selected: { backgroundColor: colors.soft }, label: { fontSize: 10, fontWeight: '500', color: colors.muted }
});
