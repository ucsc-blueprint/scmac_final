import { PageHeader, EmptyState } from '../components/ui';
import { colors, card, field, button } from '../components/ui';
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import Navbar from '../components/NavBar';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDocs , getDoc} from 'firebase/firestore';
import { firebaseConfig } from '../firebaseConfig';
import { auth, db } from '../firebaseConfig';
import NavBar from '../components/NavBar.js'

//Initialize Firebase app

const notificationsCollection = collection(db, 'notifications');

export default function Notifications({navigation}) {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        //Fetch the user document
        const userDocRef = doc(db, 'users', auth.currentUser.uid);
        const userSnapshot = await getDoc(userDocRef);
  
        if (userSnapshot.exists()) {
          //Get the IDs from the user 
          const { notifications } = userSnapshot.data();
  
          if (notifications && notifications.length > 0) {
            //Fetch each notification document
            const notificationsData = await Promise.all(
              notifications.map(async notificationId => {
                const notificationDocRef = doc(db, 'notifications', notificationId);
                const notificationSnapshot = await getDoc(notificationDocRef);
                if (notificationSnapshot.exists()) {
                  const notificationData = notificationSnapshot.data();
                  return {
                    id: notificationSnapshot.id,
                    description: notificationData.description,
                    dateTime: new Date(notificationData.date).toLocaleString([], {
                      month: '2-digit',
                      day: '2-digit',
                      year: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true
                    })
                  };
                } else {
                  console.warn(`Notification with ID ${notificationId} not found`);
                  return null;
                }
              })
            );
  
            //Filter out null values (notifs not found)
            const filteredNotificationsData = notificationsData.filter(notification => notification !== null);
            filteredNotificationsData.sort();
            filteredNotificationsData.reverse();
            setNotifications(filteredNotificationsData);
          } else {
            console.log('No notifications found for this user');
          }
        } else {
          console.log('User document not found');
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };
  
    fetchNotifications();
  }, []);

  const renderNotificationItem = ({ item }) => (
    <View style={styles.notification}>
      <View style={styles.imageContainer}>
        <View style={styles.imagePlaceholder} />
      </View>
      <View style={styles.notifText}>
        <Text style={styles.text}>{item.description}</Text>
        <Text style={styles.dateTime}>{item.dateTime}</Text>
      </View>
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>...</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <PageHeader title="Your updates" subtitle="Stay in the loop with your creative community."/>
      <View style={{ flex: 1 }}>
        <View style={styles.notificationContainer}>
          <Text style={styles.dateHeader}>RECENT ACTIVITY</Text>
          <FlatList
            data={notifications}
            contentContainerStyle={{ paddingBottom: 120, flexGrow: 1 }}
            ListEmptyComponent={<EmptyState icon="bell" title="You’re all caught up" description="Event reminders and community updates will appear here."/>}
            renderItem={renderNotificationItem}
            //keyExtractor={(item) => item.id.toString()} 
            keyExtractor={(item) => item.id}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </View>
      </View>
      <View style={{position: "absolute", bottom:0, width:"100%"}}>
        <NavBar navigation={navigation}/>
      </View>
    </View>
  );
} 

const originalStyles = StyleSheet.create({
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
    justifyContent: 'flex-end', // Align vertically to bottom
    padding: 80,
    textAlign: 'center',
    paddingBottom: 10, // Add padding at the bottom if needed for visual appeal
  },
  notificationContainer: { // The whole thing
    flex: 1,
    marginTop: 10,
  },
  dateHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    marginLeft: 8,
  },
  notification: {
    flex: 1,
    flexDirection: 'row', // Notif Description and date/time
    padding: 10,
    alignItems: 'center',
  },
  text: { // Notification Description
    fontSize: 17,
    fontWeight: 'bold',
    flex: 0.8,
  },
  button: {
    padding: 15,
    marginLeft: 'auto', // Push the button to right end
  },
  buttonText: {
    color: 'black',
    fontSize: 20,
    fontWeight: 'bold',
  },
  dateTime: {
    fontSize: 15,
    color: 'gray',
    marginRight: 4,
  },
  separator: {
    height: 1,
    backgroundColor: '#E9E8E8',
    marginVertical: 5,
  },
  imageContainer: {
    marginRight: 10,
  },
  imagePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'lightgray',
  },
});
const styles = StyleSheet.create({
  ...originalStyles,
  container: { ...originalStyles.container, backgroundColor: colors.background },
  notificationContainer: { ...originalStyles.notificationContainer, marginHorizontal: 20 },
  dateHeader: { ...originalStyles.dateHeader, fontSize: 12, color: colors.muted, fontWeight: "600", letterSpacing: 1, marginLeft: 0, marginBottom: 18 },
  notification: { ...originalStyles.notification, ...card, padding: 18, marginBottom: 10, flex: 0 },
  text: { ...originalStyles.text, fontSize: 15, lineHeight: 22, color: colors.ink, fontWeight: "500", flex: 0 },
  dateTime: { ...originalStyles.dateTime, fontSize: 12, color: colors.muted, marginTop: 6 },
  separator: { ...originalStyles.separator, height: 0, marginVertical: 0 },
  imagePlaceholder: { ...originalStyles.imagePlaceholder, width: 38, height: 38, backgroundColor: colors.soft, borderRadius: 12 },
  notifText: { ...originalStyles.notifText, flex: 1 },
  button: { ...originalStyles.button, padding: 8 }
});
