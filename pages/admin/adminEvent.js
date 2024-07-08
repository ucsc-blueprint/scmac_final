import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SimpleLineIcons, Feather, AntDesign, Ionicons } from '@expo/vector-icons';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useFocusEffect } from '@react-navigation/native';
import NavBar from '../../components/NavBar.js';

const EventItem = ({ item, nav }) => (
  <TouchableOpacity key={item.id} style={styles.itemContainer} onPress={() => nav.navigate("AdminIndividualEvent", { item: item })}>
    <View style={styles.eventInfo}>
      <Text style={styles.date}>{new Date(item.date * 1000).toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })}</Text>
      <Text style={styles.eventName}>{item.title}</Text>
      <Text style={styles.location}>{item.location}</Text>
    </View>
    <SimpleLineIcons name="arrow-right" size={24} color="black" />
  </TouchableOpacity>
);

export default function AdminEvents({ navigation }) {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [filtercolor, setFiltercolor] = useState("#F1F1F2");
  const [filtercolor1, setFiltercolor1] = useState("#F1F1F2");
  const [filtercolor2, setFiltercolor2] = useState("#F1F1F2");
  const [filtercolor3, setFiltercolor3] = useState("#F1F1F2");

  useFocusEffect(useCallback(() => {
    async function fetchData() {
      const arr = [];
      const eventsData = await getDocs(collection(db, 'events'));
      eventsData.forEach(doc => {
        var temp = doc.data();
        temp.id = doc.id;
        if (new Date() < new Date(temp.endDate * 1000)) {arr.push(temp)}
      });
      arr.sort((a, b) => new Date(a.date*1000) - new Date(b.date*1000));
      setEvents(arr);
      setFilteredEvents(arr);
    }
    fetchData();
  }, []));

  useEffect(() => {
    const filtered = activeFilter === 'All'
      ? events
      : events.filter(event => event.label === activeFilter || (event.category && event.category.label === activeFilter));
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
    <View style={styles.container}>
      <View style={styles.header}>
        <Feather name="inbox" size={24} color="white" onPress={() => { navigation.navigate("ArchivedEvents"); }} style={styles.iconLeft} />
        <Text style={styles.headerText}>Events</Text>
        <AntDesign onPress={() => { navigation.navigate("CreateEvent"); }} name="plus" size={24} color="white" style={styles.iconRight} />
      </View>
      <View style={styles.filter}>
      <Ionicons name="filter-outline" size={30} color="black"/>
      <TouchableOpacity style={{backgroundColor:filtercolor,
    borderRadius: 10,
    fontSize:15,
    padding:10,}} onPress={() => handleFilterPress("All")}>
        <Text>All</Text>
      </TouchableOpacity>

      <TouchableOpacity style={{backgroundColor:filtercolor1,
    borderRadius: 10,
    fontSize:15,
    padding:10,}} onPress={() => handleFilterPress("Ceramics")}>
        <Text>Ceramics</Text>
      </TouchableOpacity>

      <TouchableOpacity style={{backgroundColor:filtercolor2,
    borderRadius: 10,
    fontSize:15,
    padding:10,}} onPress={() => handleFilterPress("Shows")}>
        <Text>Shows</Text>
      </TouchableOpacity>

      <TouchableOpacity style={{backgroundColor:filtercolor3,
    borderRadius: 10,
    fontSize:15,
    padding:10,}} onPress={() => handleFilterPress("Special Events")}>
        <Text>Special Events</Text>
      </TouchableOpacity>
      </View>
      <FlatList
        data={filteredEvents}
        renderItem={({ item }) => <EventItem key={item.id} item={item} nav={navigation} />}
        keyExtractor={item => item.id}
      />
      <NavBar navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  header: {
    backgroundColor: '#6A466C',
    paddingTop: 80,
    paddingBottom: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  iconLeft: {
    position: 'absolute',
    left: 16,
    top: 80,
  },
  iconRight: {
    position: 'absolute',
    right: 16,
    top: 80,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
  },
  date: {
    fontSize: 16,
    color: '#000000',
  },
  eventName: {
    fontSize: 21,
    fontWeight: 'bold',
    color: '#000000',
  },
  location: {
    fontSize: 21,
    color: '#000000',
  },
  filter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  filterButton: {
    borderRadius: 10,
    fontSize: 15,
    padding: 10,
    marginHorizontal: 5,
  },
});
