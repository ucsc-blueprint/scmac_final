import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { SimpleLineIcons } from '@expo/vector-icons';
import { AntDesign } from '@expo/vector-icons';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useFocusEffect } from '@react-navigation/native';
import NavBar from '../components/NavBar.js';

const EventCard = ({ item, navigation }) => {
  // Format date for display
  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <View style={styles.card}>
      <Text style={styles.eventTitle}>{item.title}</Text>
      
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Start:</Text>
        <Text style={styles.infoValue}>{formatDate(item.date)}</Text>
      </View>
      
      {item.endDate && item.endDate !== "null" && (
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>End:</Text>
          <Text style={styles.infoValue}>{formatDate(item.endDate)}</Text>
        </View>
      )}
      
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Location:</Text>
        <Text style={styles.infoValue}>{item.location}</Text>
      </View>
      
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Category:</Text>
        <Text style={styles.infoValue}>{item.category || "Not specified"}</Text>
      </View>
      
      <View style={styles.descriptionContainer}>
        <Text style={styles.descriptionLabel}>Description:</Text>
        <Text style={styles.descriptionText}>{item.description}</Text>
      </View>
      
      <TouchableOpacity 
        style={styles.viewButton}
        onPress={() => navigation.navigate("IndividualEvent", {item: item})}
      >
        <Text style={styles.viewButtonText}>View Details</Text>
      </TouchableOpacity>
    </View>
  );
};

export default function ViewEvents({ navigation }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch events when the screen gains focus
  useFocusEffect(
    useCallback(() => {
      async function fetchEvents() {
        setLoading(true);
        try {
          const eventsData = await getDocs(collection(db, 'events'));
          const eventsArray = [];
          
          eventsData.forEach(doc => {
            const data = doc.data();
            eventsArray.push({
              id: doc.id,
              ...data
            });
          });
          
          // Sort events by date (newest first)
          eventsArray.sort((a, b) => new Date(b.date*1000) - new Date(a.date*1000));
          setEvents(eventsArray);
        } catch (error) {
          console.error("Error fetching events:", error);
        } finally {
          setLoading(false);
        }
      }
      
      fetchEvents();
    }, [])
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <AntDesign name="leftcircleo" size={30} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerText}>View All Events</Text>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading events...</Text>
        </View>
      ) : events.length === 0 ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>No events available</Text>
        </View>
      ) : (
        <FlatList
          data={events}
          renderItem={({ item }) => <EventCard item={item} navigation={navigation} />}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.eventsList}
        />
      )}
      
      <View style={styles.navBarContainer}>
        <NavBar navigation={navigation}/>
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6A466C',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
  },
  eventsList: {
    padding: 16,
    paddingBottom: 80, // Space for navbar
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  eventTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#6A466C',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    width: 70,
    color: '#333',
  },
  infoValue: {
    fontSize: 16,
    flex: 1,
    color: '#555',
  },
  descriptionContainer: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  descriptionLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#333',
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#555',
  },
  viewButton: {
    backgroundColor: '#6A466C',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  viewButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  navBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
}); 