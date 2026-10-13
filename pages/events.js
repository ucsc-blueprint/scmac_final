import { PageHeader, HeaderAction, EventCard, EventFilters, EmptyState, colors } from '../components/ui';
import React,  { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SimpleLineIcons } from '@expo/vector-icons';
import NavBar from '../components/NavBar.js'
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useFocusEffect } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';


export default function Events({navigation}) {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [filtercolor, setFiltercolor] = useState("#F1F1F2");
  const [filtercolor1, setFiltercolor1] = useState("#F1F1F2");
  const [filtercolor2, setFiltercolor2] = useState("#F1F1F2");
  const [filtercolor3, setFiltercolor3] = useState("#F1F1F2");

  useFocusEffect(useCallback( () => {
    async function fetchData() {
      const arr = [];
      const eventsData = await getDocs(collection(db, 'events'));
      eventsData.forEach(doc => {
        var temp = doc.data();
        temp.id = doc.id
        if (new Date() < new Date(temp.endDate*1000)) arr.push(temp);
      })
      arr.sort((a, b) => new Date(a.date*1000) - new Date(b.date*1000));
      setEvents(arr);
      setFilteredEvents(arr);
    }
    fetchData();
  }, []))

  let i = 0;

  useEffect(() => {
    const filtered = activeFilter === 'All'
      ? events
      : events.filter(event => event.label === activeFilter || (event.category && (event.category.label === activeFilter || (activeFilter === "Shows" && event.category.label === "Show"))));
    // console.log(`Filtered events for category ${activeFilter}:`, filtered);
    setFilteredEvents(filtered);
  }, [activeFilter, events]);

  const handleFilterPress = (category) => {
    setActiveFilter(category);
    setFiltercolor(category === "All" ? "#A16AA4" : "#F1F1F2");
    setFiltercolor1(category === "Ceramics" ? "#A16AA4" : "#F1F1F2");
    setFiltercolor2(category === "Shows" ? "#A16AA4" : "#F1F1F2");
    setFiltercolor3(category === "Special Events" ? "#A16AA4" : "#F1F1F2");
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <PageHeader title="Make room for art." subtitle="Find your next opportunity to create and connect." actions={<><HeaderAction icon="archive" label="Archived events" onPress={() => navigation.navigate("ArchivedEvents")}/></>}/>
      <EventFilters active={activeFilter} onChange={handleFilterPress}/>
      <FlatList data={filteredEvents} keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: 20, flexGrow: 1 }}
        ListEmptyComponent={<EmptyState title="A little inspiration is on its way" description="Upcoming opportunities will appear here. Try another category or check back soon."/>}
        renderItem={({ item }) => <EventCard item={item} onPress={() => navigation.navigate("IndividualEvent", { item })}/>}/>
      <NavBar navigation={navigation}/>
    </View>
  );
}
