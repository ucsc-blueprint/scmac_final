import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const colors = { background: '#F7F5F2', surface: '#FFFFFF', ink: '#292333', muted: '#817789', primary: '#6A466C', soft: '#EEE6EF', border: '#E8E1E8', green: '#59654A' };
export const card = { backgroundColor: colors.surface, borderRadius: 20, borderWidth: 1, borderColor: colors.border, shadowColor: '#37263C', shadowOpacity: 0.04, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 2 };
export const field = { minHeight: 52, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 14, fontSize: 16, color: colors.ink };
export const button = { minHeight: 54, backgroundColor: colors.primary, borderRadius: 14, alignItems: 'center', justifyContent: 'center' };

export function PageHeader({ title, subtitle, eyebrow = 'MOUNTAIN ART CENTER', actions }) {
  const insets = useSafeAreaInsets();
  return <View style={[ui.header, { paddingTop: Math.max(insets.top, 20) + 18 }]}>
    <View style={ui.headerTop}><Text style={ui.eyebrow}>{eyebrow}</Text><View style={ui.actions}>{actions}</View></View>
    <Text style={ui.title}>{title}</Text>
    {subtitle ? <Text style={ui.subtitle}>{subtitle}</Text> : null}
  </View>;
}
export function HeaderAction({ icon, label, onPress }) {
  return <TouchableOpacity accessibilityLabel={label} onPress={onPress} style={ui.action}><Feather name={icon} size={20} color={colors.primary}/></TouchableOpacity>;
}
export function EventCard({ item, onPress }) {
  const date = new Date(Number(item.date) * 1000);
  const category = typeof item.category === 'object' ? item.category?.label : item.category;
  return <TouchableOpacity activeOpacity={0.75} style={ui.card} onPress={onPress}>
    <View style={ui.dateBlock}><Text style={ui.month}>{date.toLocaleString('en-US', { month: 'short' }).toUpperCase()}</Text><Text style={ui.day}>{date.getDate()}</Text><Text style={ui.weekday}>{date.toLocaleString('en-US', { weekday: 'short' })}</Text></View>
    <View style={ui.eventBody}><Text style={ui.category}>{category || 'Community'}</Text><Text style={ui.eventTitle}>{item.title}</Text><View style={ui.meta}><Feather name="clock" size={12} color={colors.muted}/><Text style={ui.metaText}>{date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</Text></View><View style={ui.meta}><Feather name="map-pin" size={12} color={colors.muted}/><Text numberOfLines={2} style={ui.metaText}>{item.location}</Text></View></View>
    <Feather name="chevron-right" size={18} color={colors.primary}/>
  </TouchableOpacity>;
}
export function EventFilters({ active, onChange }) {
  return <View style={ui.filters}>{['All', 'Ceramics', 'Shows', 'Special Events'].map(label => <TouchableOpacity key={label} accessibilityRole="button" accessibilityState={{ selected: active === label }} onPress={() => onChange(label)} style={[ui.pill, active === label && ui.activePill]}><Text style={[ui.pillText, active === label && ui.activePillText]}>{label}</Text></TouchableOpacity>)}</View>;
}
export function EmptyState({ icon = 'calendar', title, description }) {
  return <View style={ui.empty}><View style={ui.emptyIcon}><Feather name={icon} size={28} color={colors.primary}/></View><Text style={ui.emptyTitle}>{title}</Text><Text style={ui.emptyDescription}>{description}</Text></View>;
}
const ui = StyleSheet.create({
  header: { paddingHorizontal: 24, paddingBottom: 24, backgroundColor: colors.background },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  eyebrow: { color: colors.green, fontSize: 10, letterSpacing: 2, fontWeight: '700' },
  actions: { flexDirection: 'row', gap: 8 }, action: { backgroundColor: colors.surface, borderRadius: 14, borderWidth: 1, borderColor: colors.border, padding: 11 },
  title: { fontSize: 34, fontWeight: '700', letterSpacing: -1, color: colors.ink },
  subtitle: { fontSize: 15, lineHeight: 22, color: colors.muted, marginTop: 8 },
  card: { ...card, flexDirection: 'row', alignItems: 'center', padding: 16, marginHorizontal: 20, marginBottom: 14, gap: 14 },
  dateBlock: { backgroundColor: colors.soft, borderRadius: 14, alignItems: 'center', justifyContent: 'center', width: 60, paddingVertical: 13 },
  month: { fontSize: 10, fontWeight: '700', letterSpacing: 1, color: colors.primary }, day: { fontSize: 27, fontWeight: '700', color: colors.primary, marginVertical: 2 }, weekday: { fontSize: 11, color: colors.primary },
  eventBody: { flex: 1 }, category: { fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, fontWeight: '700', color: colors.green, marginBottom: 7 }, eventTitle: { fontSize: 18, lineHeight: 24, fontWeight: '600', color: colors.ink, marginBottom: 8 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 3 }, metaText: { flex: 1, color: colors.muted, fontSize: 12, lineHeight: 17 },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, paddingHorizontal: 20, paddingBottom: 22 }, pill: { paddingHorizontal: 13, paddingVertical: 10, borderRadius: 22, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }, activePill: { backgroundColor: colors.primary, borderColor: colors.primary }, pillText: { color: colors.muted, fontSize: 12, fontWeight: '600' }, activePillText: { color: '#FFFFFF' },
  empty: { alignItems: 'center', paddingHorizontal: 32, paddingVertical: 50 }, emptyIcon: { backgroundColor: colors.soft, borderRadius: 24, padding: 22, marginBottom: 20 }, emptyTitle: { color: colors.ink, fontSize: 20, fontWeight: '600', marginBottom: 10 }, emptyDescription: { color: colors.muted, textAlign: 'center', fontSize: 15, lineHeight: 23 }
});
