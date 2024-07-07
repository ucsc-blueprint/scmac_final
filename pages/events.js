import React,  { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SimpleLineIcons } from '@expo/vector-icons';
import NavBar from '../components/NavBar.js'
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useFocusEffect } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';


const EventItem = ({ item, nav }) => (
  <TouchableOpacity key={item.id} style={styles.itemContainer} onPress={()=>nav.navigate("IndividualEvent", {item: item})}>
    <View style={styles.eventInfo}>
      <Text style={styles.date}>{new Date(item.date * 1000).toLocaleString('en-US', {
        weekday: 'short', // 'Fri'
        month: 'short',   // 'May'
        day: 'numeric',   // '03',
        year: '2-digit',
        hour: '2-digit',  // '02' or '14'
        minute: '2-digit' // '30'
    })}</Text>
      {/* <Text style={styles.date}>{new Date(item.date).toDateString().split(' ').slice(1).join(' ')}</Text> */}
      <Text style={styles.eventName}>{item.title}</Text>
      <Text style={styles.location}>{item.location}</Text>
    </View>
	<SimpleLineIcons name="arrow-right" size={24} color="black" />
  </TouchableOpacity>

);

export default function Events({ navigation }) {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [filtercolor, setFiltercolor] = useState("#F1F1F2");
  const [filtercolor1, setFiltercolor1] = useState("#F1F1F2");
  const [filtercolor2, setFiltercolor2] = useState("#F1F1F2");
  const [filtercolor3, setFiltercolor3] = useState("#F1F1F2");

  const fetchData = async () => {
    try {
      const eventsData = await getDocs(collection(db, 'events'));
      const arr = eventsData.docs.map(doc => {
        const data = doc.data();
        const date = parseInt(data.date); // parse Int for correct sorting
        const endDate =  parseInt(data.endDate);

        // log if date or endDate is Nan
        if (isNaN(date) || isNaN(endDate)) {
          console.error(`Invalid date for event ${doc.id}: date=${data.date}, endDate=${data.endDate}`);
        }

      return {
        ...data,
        id: doc.id,
        date: date, // parse Int for correct sorting
        endDate: endDate
      };
      });
      arr.sort((a, b) => new Date(a.date * 1000) - new Date(b.date * 1000));
      //
      console.log('All events:', arr);
      setEvents(arr.filter(event => new Date() < new Date(event.endDate * 1000))); // only future events
      setFilteredEvents(arr.filter(event => new Date() < new Date(event.endDate * 1000))); // initially display all events
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // useEffect(() => {
  //   if (activeFilter === 'All') {
  //     setFilteredEvents(events);
  //   } else {
  //     setFilteredEvents(events.filter(event => event.label === activeFilter || (event.category && event.category.label === activeFilter)));
  //   }
  // }, [activeFilter, events]);

  //debug
  useEffect(() => {
    const filtered = activeFilter === 'All'
      ? events
      : events.filter(event => event.label === activeFilter || (event.category && event.category.label === activeFilter));
    console.log(`Filtered events for category ${activeFilter}:`, filtered);
    setFilteredEvents(filtered);
  }, [activeFilter, events]);

  const handleFilterPress = (category) => {
    setActiveFilter(category);
    setFiltercolor(category === "All" ? "#A16AA4" : "#F1F1F2");
    setFiltercolor1(category === "Ceramics" ? "#A16AA4" : "#F1F1F2");
    setFiltercolor2(category === "Shows" ? "#A16AA4" : "#F1F1F2");
    setFiltercolor3(category === "Art Gallery" ? "#A16AA4" : "#F1F1F2");
  };

  const renderItem = ({ item }) => (
    <EventItem key={item.id} item={item} nav={navigation} />
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Events</Text>
        <Feather name="inbox" size={24} color="white" onPress={() => { navigation.navigate("ArchivedEvents"); }} style={{ marginLeft: "25%" }} />
      </View>
      <View style={styles.filter}>
        <Ionicons name="filter-outline" size={30} color="black" />
        <TouchableOpacity style={{ backgroundColor: filtercolor, borderRadius: 10, fontSize: 15, padding: 10 }}
          onPress={() => handleFilterPress("All")}>
          <Text>All</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ backgroundColor: filtercolor1, borderRadius: 10, fontSize: 15, padding: 10 }}
          onPress={() => handleFilterPress("Ceramics")}>
          <Text>Ceramics</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ backgroundColor: filtercolor2, borderRadius: 10, fontSize: 15, padding: 10 }}
          onPress={() => handleFilterPress("Shows")}>
          <Text>Shows</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ backgroundColor: filtercolor3, borderRadius: 10, fontSize: 15, padding: 10 }}
          onPress={() => handleFilterPress("Art Gallery")}>
          <Text>Art Gallery</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={filteredEvents}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 10, marginTop: "2%", marginLeft: "2%" }}
      />
      <View style={{ position: "absolute", bottom: 0, width: "100%" }}>
        <NavBar navigation={navigation} />
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    backgroundColor: '#6A466C',
    textAlign: 'center',
    justifyContent: 'flex-end',
    padding: 80,
    paddingBottom: 10,

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
    paddingTop: 10,
    paddingLeft: 20,
    paddingRight: 20,
    marginHorizontal: 3,
    marginTop: 3,
  },
  filterButton: {
    borderRadius: 10,
    fontSize: 18,
    padding: 15,
  },
  header: {
    flexDirection: "row",
    backgroundColor: '#6A466C',
    textAlign: 'center',
    justifyContent: 'center',
    paddingTop: 70,
    paddingBottom: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: "33%"
  },
});
