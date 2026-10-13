import { colors, card, field, button } from '../components/ui';
import React, { useState, useEffect } from 'react';
import NavBar from '../components/NavBar.js';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, Image, FlatList } from 'react-native';
import {getCurrentUserData} from '../pages/api/users';
import { auth, db } from '../firebaseConfig';
import { signOut } from 'firebase/auth';
import Checkbox from 'expo-checkbox';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { doc, getDoc, getDocs, snapshotEqual, updateDoc, query, collection, where, documentId, arrayRemove, deleteDoc } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
// import * as FileSystem from 'expo-file-system';
import { Alert } from 'react-native';
import { storage } from '../firebaseConfig.js';
import {ref, uploadBytesResumable, getDownloadURL} from "firebase/storage";
import { SimpleLineIcons, AntDesign } from '@expo/vector-icons';
import { sendPushNotification } from './api/event.js';
import * as Notifications from 'expo-notifications';
import { ScrollView} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function Profile({navigation}) {
  const [uid, setUid] = useState("");
  const [admin, setAdmin] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [gender, setGender] = useState("");
  const [birthday, setBirthday] = useState("");
  const [interests, setInterests] = useState([]);
  const [isEditable, setIsEditable] = useState(false);
  const [pottery, setPottery] = useState(false);
  const [gallery, setGallery] = useState(false);
  const [events, setEvents] = useState(false);
  const [facilities, setFacilities] = useState(false);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  // const [image, setImage] = useState(null); //added
  const [uploading, setUploading] = useState(false);
  const [downloadURL, setImageURL] = useState("");
  const [eventsData, setEventsData] = useState([]);
  const [notifs, setNotifs] = useState([]);

  let i = 0;

  const signOutFunc = async () => {
    signOut(auth).then(() => {
      navigation.reset({ index: 0, routes: [{ name: "Login" }] });
    }).catch((error) => {
      console.log(error);
    });
  }

  const deleteAccount = async () => {
    Alert.alert('Confirm Deletion', 'Are you sure you want to delete your account? This action cannot be undone.', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteDoc(doc(db, "users", auth.currentUser.uid));
            await deleteUser(auth.currentUser);
            navigation.navigate("Login");
          } catch (error) {
            console.log(error);
          }
        },
      },
    ]);
  };

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleDateConfirm = (date) => {
    // console.warn("A date has been picked: ", date);
    setBirthday(date);
    hideDatePicker();
  };

  const pickImage = async () =>{
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All, //all:img, videos
        aspect: [4,3],
        quality: 1,
      });
      if (!result.canceled){
        setImageURL(result.assets[0].uri);
        await uploadMedia(result.assets[0].uri);
        // console.log(image)
      }
  };

  //upload media files
  const uploadMedia = async (img) => {
    setUploading(true);
    const response = await fetch(img);
    const blob = await response.blob();

    const storageRef = ref(storage, uid);
    const uploadTask = uploadBytesResumable(storageRef, blob);

      getDownloadURL(uploadTask.snapshot.ref).then(async(downloadURL) => {
        console.log(downloadURL);
        setImageURL(downloadURL);
        // setImage(downloadURL);
      })


    Alert.alert('Photo Uploaded!');
};
  useEffect( () => {
    async function fetchData() {
      data = await getCurrentUserData();
      const arr2 = [];
      if (data.events) {
      data.events.forEach(async el => {
        const eventDoc = doc(db, "events", el);
        const temp = await getDoc(eventDoc);
        const eventData = temp.data();
        if (el && eventData) {
          eventData["id"] = el;
          if (new Date() < new Date(eventData.endDate*1000)) arr2.push(eventData);
        }
        setEventsData(arr2);
      });
    }
      // console.log(eventsData);
      setAdmin(data.admin);
      setFirstName(data.fname);
      setLastName(data.lname);
      setEmail(data.email);
      setPhoneNumber(data.phone);
      setGender(data.gender);
      setBirthday(data.birthday ? data.birthday*1000 : "");
      setInterests(data.interests);
      if (data.notifications) setNotifs(data.notifications);
      data.interests.forEach((el) => {
        if (el === "Pottery") setPottery(!pottery);
        if (el === "Gallery") setGallery(!gallery);
        if (el === "Events") setEvents(!events);
        if (el === "Facilities") setFacilities(!facilities);
      })
      setUid(data.uid);
      setImageURL(data.pfp);
    }
    fetchData();
 }, [])

 const EventItem = ({ item, nav }) => (
  <TouchableOpacity key={item.id} style={styles.itemContainer} onPress={()=>{
    if (admin) {nav.navigate("AdminIndividualEvent", {item: item})}
    else {nav.navigate("IndividualEvent", {item: item})}
  }}>
    <AntDesign name="delete" size={24} color="black" onPress={() => {
      Alert.alert('Are you sure you want to drop out of this event?', '', [
        {
          text: 'Cancel',
          onPress: () => console.log(item.shifts),
          style: 'cancel',
        },
        {text: 'OK', onPress: async () => {
          if (item.shifts.length !== 0) {
            const q = query(
              collection(db, "shifts"),
              where(documentId(), "in",
                item.shifts
              ),
            );
            const productsDocsSnap = await getDocs(q);

            productsDocsSnap.forEach(async (document) => {
              // console.log(doc.id)
              if (document.data().user.includes(auth.currentUser.uid)) {
                // console.log(document.id)

              if (document.data().organizers) {
                document.data().organizers.map(async el => {
                  const organizerData = await getDoc(doc(db, "users", el))
                  sendPushNotification(organizerData.data().notifToken, el, "A voluteer dropped from an event you organize", firstName + " " + lastName + " dropped from their " + new Date(document.data().startTime*1000).toLocaleString('en-US', {
                    weekday: 'short', // 'Fri'
                    month: 'short',   // 'May'
                    day: 'numeric',   // '03'
                    hour: '2-digit',  // '02' or '14'
                    minute: '2-digit' // '30'
                }) + " - " + new Date(document.data().endTime*1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + " shift")
                })
              }

              await updateDoc(doc(db, "shifts", document.id), {
                user: arrayRemove(auth.currentUser.uid)
              })

              await updateDoc(doc(db, "users", auth.currentUser.uid), {
                events: arrayRemove(item.id)
              })

              if (notifs) {
                notifs.forEach(async (d) => {
                  var noti = await getDoc(doc(db, "notifications", d));
                  if (noti.data().eventId && noti.data().eventId == item.id) {
                    await Notifications.cancelScheduledNotificationAsync(noti.data().identifier);
                    await deleteDoc(doc(db, "notifications", d))
                  }
                })
              }

              data = await getCurrentUserData();
              const arr2 = [];
              if (data.events) {
              data.events.forEach(async el => {
                const eventDoc = doc(db, "events", el);
                const temp = await getDoc(eventDoc);
                const eventData = temp.data();
                if (el && eventData) {
                  eventData["id"] = el;
                  if (new Date() < new Date(eventData.endDate*1000)) arr2.push(eventData);
                }
                setEventsData(arr2);
              });
              }
            }
            });

          }
        }},
      ]);}
      } />
    <View style={styles.eventInfo}>
      {/* <Text style={styles.date}>{new Date(item.date).toDateString().split(' ').slice(1).join(' ')}</Text> */}
      <Text style={styles.date}>{new Date(item.date * 1000).toLocaleString('en-US', {
        weekday: 'short', // 'Fri'
        month: 'short',   // 'May'
        day: 'numeric',   // '03',
        year: '2-digit',
        hour: '2-digit',  // '02' or '14'
        minute: '2-digit' // '30'
    })}</Text>
      <Text style={styles.eventName}>{item.title}</Text>
      <Text style={styles.location}>{item.location}</Text>
    </View>
	<SimpleLineIcons name="arrow-right" size={24} color="black" />
  </TouchableOpacity>
);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Profile</Text>
        <TouchableOpacity style = {styles.editButton}
          onPress ={async () => {if(isEditable){
              const arr = [];
              if (pottery) arr.push("Pottery");
              if (gallery) arr.push("Gallery");
              if (events) arr.push("Events");
              if (facilities) arr.push("Facilities");
              setInterests(arr);

              //HANDLE ERROR HANDLING HERE (CHECK ONCE THEY EDIT IF THEY ARE VALID EMAIL, NUMBER, ETC)

              const userDoc = doc(db, "users", auth.currentUser.uid);
              if (!firstName || !lastName|| !email|| !phoneNumber) {
                Alert.alert("Cannot leave field empty. Click edit again to learn more");
              }
              else {
                await updateDoc(userDoc, {
                  fname: firstName,
                  lname: lastName,
                  email: email,
                  phone: phoneNumber,
                  pfp: downloadURL == undefined ? "" : downloadURL,
                  gender: gender,
                  birthday: birthday / 1000,
                  interests: arr
                });
            }
          }
          setIsEditable(!isEditable)}}>
          <MaterialIcons name={isEditable ? "save" : "edit"} size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>
      <ScrollView style={{ flex: 1}} keyboardShouldPersistTaps="handled">
          <TouchableOpacity style={styles.selectButton} onPress={() => {if(isEditable) pickImage()}}>
            <View style={styles.imageContainer}>
              {downloadURL ? <Image source={{ uri: downloadURL}} style={styles.image}/> : <Text style={{ fontSize: 38, color: colors.primary, fontWeight: '600' }}>{firstName?.charAt(0)}{lastName?.charAt(0)}</Text>}
            </View>
          </TouchableOpacity>
    <View style={styles.name}>
      <View style={{flexDirection:'row'}}>
        <TextInput style={{fontSize: 24, fontWeight: "600", color: colors.ink, backgroundColor:isEditable?colors.soft:"transparent", borderRadius: 8}} editable={isEditable} onChangeText={setFirstName}>{firstName}</TextInput>
        <Text> </Text>
        <TextInput style={{fontSize: 24, fontWeight: "600", color: colors.ink, backgroundColor:isEditable?colors.soft:"transparent", borderRadius: 8}} editable={isEditable} onChangeText={setLastName}>{lastName}</TextInput>
      </View>
    </View>
    <View style={styles.email}>
        <Text style={{fontSize:11, color: colors.muted, fontWeight: "600", marginBottom: 6 }}>Email:     </Text>
        <TextInput style={{color: colors.ink, fontSize: 15, width: "100%", backgroundColor:isEditable?colors.soft:"transparent", borderRadius: 8, paddingVertical: 4}} editable={isEditable} onChangeText={setEmail}>{email}</TextInput>
    </View>
    <View style={styles.number}>
      <Text style={{fontSize:11, color: colors.muted, fontWeight: "600", marginBottom: 6 }}>Phone number:     </Text>
      <TextInput style={{color: colors.ink, fontSize: 15, width: "100%", backgroundColor:isEditable?colors.soft:"transparent", borderRadius: 8, paddingVertical: 4}} editable={isEditable} onChangeText={setPhoneNumber}>{phoneNumber}</TextInput>
    </View>
    <View style={styles.gender}>
      <Text style={{fontSize:11, color: colors.muted, fontWeight: "600", marginBottom: 6 }}>Gender:     </Text>
      <TextInput style={{color: colors.ink, fontSize: 15, width: "100%", backgroundColor:isEditable?colors.soft:"transparent", borderRadius: 8, paddingVertical: 4}} editable={isEditable} onChangeText={setGender}>{gender}</TextInput>
    </View>
    <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleDateConfirm}
        onCancel={hideDatePicker}
      />
    <View style={styles.birthday}>
      <Text style={{fontSize:11, color: colors.muted, fontWeight: "600", marginBottom: 6 }}>Birthday:     </Text>

      <TextInput style={{color: colors.ink, fontSize: 15, width: "100%", backgroundColor:isEditable?colors.soft:"transparent", borderRadius: 8, paddingVertical: 4}} editable={false} onPressIn={()=> {if(isEditable)showDatePicker()}}>{birthday ? new Date(birthday).toDateString().split(' ').slice(1).join(' ') : 'Not provided'}</TextInput>
    </View>
    <View style={styles.interests}>
      <Text style={{fontSize:11, color: colors.muted, fontWeight: "600", marginBottom: 6 }}>Interests:     <Text style={{fontSize:11, color: colors.muted, fontWeight: "600", marginBottom: 6 }}>{!isEditable?interests ? interests.join(', ') : "":""}</Text></Text>
      {!isEditable ? (
        <View></View>
    ): (<View>
        <View style={styles.checkboxContainer}>
        <Checkbox
          value={pottery}
          onValueChange={() => setPottery(!pottery)}
          style={styles.checkbox}
        />
        <Text style={{fontSize:15, fontWeight:400}}>Pottery</Text>
      </View>
      <View style={styles.checkboxContainer}>
        <Checkbox
          value={gallery}
          onValueChange={() => setGallery(!gallery)}
          style={styles.checkbox}
        />
        <Text style={{fontSize:15, fontWeight:400}}>Gallery</Text>
      </View>
      <View style={styles.checkboxContainer}>
        <Checkbox
          value={events}
          onValueChange={() => setEvents(!events)}
          style={styles.checkbox}
        />
        <Text style={{fontSize:15, fontWeight:400}}>Events</Text>
      </View>
      <View style={styles.checkboxContainer}>
        <Checkbox
          value={facilities}
          onValueChange={() => setFacilities(!facilities)}
          style={styles.checkbox}
        />
        <Text style={{fontSize:15, fontWeight:400}}>Facilities</Text>
      </View>
      </View>)}

    </View>
    <View style={{ marginTop: 24, marginBottom: 12 }}>
      <Text style={{ fontSize: 17, color: colors.ink, fontWeight: '600', marginHorizontal: 24, marginBottom: 16 }}>Your upcoming events</Text>
      {eventsData.length ? eventsData.map(item => <EventItem key={item.id} item={item} nav={navigation}/>) : <Text style={{ color: colors.muted, fontSize: 14, lineHeight: 22, marginHorizontal: 24 }}>Your next creative adventure starts on the Events page.</Text>}
    </View>
          <TouchableOpacity style = {styles.signOutButton} onPress={signOutFunc}>
            <Text style ={styles.buttonText}> Sign Out </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteButton} onPress={deleteAccount}>
            <Text style={styles.buttonDeleteText}>Delete Account</Text>
          </TouchableOpacity>
      </ScrollView>
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
    flexDirection: "row",
    backgroundColor: '#6A466C',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
    paddingBottom: 10,
    position: "relative",
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: "center",
    flex: 1,
  },
  editButton: {
    position: "absolute",
    right: 20,
    top: 85,
  },
  editText: {
    fontSize: 18,
    fontWeight: '400',
    color: 'white',
    marginLeft:"45%",
    marginTop: "2%"
  },
  imageContainer:{
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#6A466C",
    backgroundColor: '#D9D9D9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 30,
    alignSelf: "center",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 60,
  },
  name: {
    alignItems: 'center',
    paddingTop: 15,
    paddingBottom: 15,
  },
  email: {
    marginBottom: "1%",
    flexDirection:'row',
    alignItems: 'center',
    borderBottomWidth: 1,  // Adding a divider
    borderColor: "#D9D9D9",
    paddingBottom: 5,
    marginHorizontal: 20,
  },
  number: {
    marginBottom: "1%",
    flexDirection:'row',
    alignItems: 'center',
    borderBottomWidth: 1,  // Adding a divider
    borderColor: "#D9D9D9",
    paddingBottom: 5,
    marginHorizontal: 20,
  },
  gender: {
    marginBottom: "1%",
    flexDirection:'row',
    alignItems: 'center',
    borderBottomWidth: 1,  // Adding a divider
    borderColor: "#D9D9D9",
    paddingBottom: 5,
    marginHorizontal: 20,
  },
  birthday: {
    marginBottom: "1%",
    flexDirection:'row',
    alignItems: 'center',
    borderBottomWidth: 1,  // Adding a divider
    borderColor: "#D9D9D9",
    paddingBottom: 5,
    marginHorizontal: 20,
  },
  interests: {
    marginBottom: "1%",
    flexDirection:'row',
    alignItems: 'center',
    borderBottomWidth: 1,  // Adding a divider
    borderColor: "#D9D9D9",
    paddingBottom: 5,
    marginHorizontal: 20,
  },
  signOutButton: {
    backgroundColor: '#EAEAEA',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderColor: "#8C8C8C",
    borderWidth: 1,
    height: "5.5%",
    width: "80%",
    marginLeft: "10%",
    marginTop: "7%",
    // marginBottom: "200%",
  },
  buttonText: {
      fontSize: 20,
      color: '#8C8C8C',
      alignItems: 'center',
  },
  buttonDeleteText: {
      fontSize: 20,
      color: '#FF0000',
      alignItems: 'center',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: "3%",
  },
  checkbox: {
    marginRight: 8,
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
    // height: "10%"
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
  deleteButton: {
    backgroundColor: '#EAEAEA',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderColor: "#8C8C8C",
    borderWidth: 1,
    height: 40,
    width: "80%",
    alignSelf: 'center',
    marginTop: "10%",
  },
});
const styles = StyleSheet.create({
  ...originalStyles,
  container: { ...originalStyles.container, backgroundColor: colors.background },
  header: { ...originalStyles.header, backgroundColor: colors.background, paddingTop: 64, paddingBottom: 22 },
  headerText: { ...originalStyles.headerText, color: colors.ink, textAlign: "left", fontSize: 32, fontWeight: "700", paddingLeft: 24, letterSpacing: -0.7 },
  editButton: { ...originalStyles.editButton, top: 72, right: 24 },
  editText: { ...originalStyles.editText, color: colors.primary, fontSize: 14, fontWeight: "600", marginLeft: 0, marginTop: 0 },
  imageContainer: { ...originalStyles.imageContainer, borderColor: colors.soft, borderWidth: 6, backgroundColor: colors.soft },
  email: { ...originalStyles.email, flexDirection: "column", alignItems: "flex-start", ...card, paddingVertical: 18, paddingHorizontal: 14, marginBottom: 10 },
  number: { ...originalStyles.number, flexDirection: "column", alignItems: "flex-start", ...card, paddingVertical: 18, paddingHorizontal: 14, marginBottom: 10 },
  gender: { ...originalStyles.gender, flexDirection: "column", alignItems: "flex-start", ...card, paddingVertical: 18, paddingHorizontal: 14, marginBottom: 10 },
  birthday: { ...originalStyles.birthday, flexDirection: "column", alignItems: "flex-start", ...card, paddingVertical: 18, paddingHorizontal: 14, marginBottom: 10 },
  interests: { ...originalStyles.interests, flexDirection: "column", alignItems: "flex-start", ...card, paddingVertical: 18, paddingHorizontal: 14, marginBottom: 10 },
  signOutButton: { ...originalStyles.signOutButton, ...button, marginHorizontal: 24, marginTop: 24 },
  buttonText: { ...originalStyles.buttonText, color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
  buttonDeleteText: { ...originalStyles.buttonDeleteText, color: "#A04B56", fontSize: 14, fontWeight: "500" },
  deleteButton: { ...originalStyles.deleteButton, minHeight: 54, height: 54, padding: 0, backgroundColor: "transparent", borderColor: colors.border, borderWidth: 1, borderRadius: 14, marginHorizontal: 24, marginBottom: 110 }
});
