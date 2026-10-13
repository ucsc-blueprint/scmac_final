import { colors, field, button } from '../components/ui';
import React from 'react';
import { ScrollView, View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import {signup} from "./api/users.js";
import { AntDesign } from '@expo/vector-icons';
import { useState } from 'react';
import { Feather } from '@expo/vector-icons';
import Checkbox from 'expo-checkbox';
import { faL } from '@fortawesome/free-solid-svg-icons';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebaseConfig.js';
import { doc, setDoc } from 'firebase/firestore';

const items = [{
  id: '0',
  name: 'Potter'
}, {
  id: '1',
  name: 'Gallery'
}, {
  id: '2',
  name: 'Events'
},
{
  id: '3',
  name: 'Facilities'
},
{
  id: '4',
  name: 'Other'
}
];

export default function Signup({navigation, expoPushToken}) {
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState(0);
  const [pword, setPword] = useState("");
  const [pottery, setPottery] = useState(false);
  const [gallery, setGallery] = useState(false);
  const [events, setEvents] = useState(false);
  const [facilities, setFacilities] = useState(false);
  const [birthday, setBirthday] = useState("");
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isEyeOpen, setIsEyeOpen] = useState(true);

  onSelectedItemsChange = selectedItems => {
    this.setState({ selectedItems });
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

  return (
    <ScrollView style={{ backgroundColor: colors.background }} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.container}>
     <TouchableOpacity style={{marginTop: 60}} onPress={()=>navigation.navigate("Login")}>
                <AntDesign name="leftcircleo" size={30} color={colors.primary} />
            </TouchableOpacity>
      <Text style={styles.signUp}>Sign Up</Text>
      <TouchableOpacity 
        style={styles.eventsButton}
        onPress={() => navigation.navigate("ViewEvents")}
      >
        <Text style={styles.eventsButtonText}>View Events</Text>
      </TouchableOpacity>
      <Text style = {{fontSize:15, fontWeight: 500}}>First Name</Text>
      <TextInput 
      style={styles.input}
        onChangeText={text => setFname(text)}
       />
      <Text style = 
      {{fontSize:15, fontWeight:500,paddingTop:20}}>Last Name</Text>
      <TextInput style={styles.input}
         onChangeText={text => setLname(text)}
       />
      <Text style =
       {{fontSize:15, fontWeight:500, paddingTop:20}}>
        Email
      </Text>
      <TextInput style={styles.input}
              onChangeText={text => setEmail(text)}
              autoCapitalize='none'
      />
      <View style={styles.line} />
      <Text style = {{fontSize:15, fontWeight:500, paddingTop: 20}} >Phone Number (Optional)</Text>
      <TextInput style={styles.input} 
               onChangeText={text => setPhone(text)}

      />
      <View style={styles.line} />
      <View style={{flexDirection:'row'}}>
      <Text style = {{fontSize:15, fontWeight:500, paddingTop: 20}} >Password</Text>
      <TouchableOpacity
      style={{marginTop:"6%", marginLeft: "3%"}}
            onPress={() => setIsEyeOpen(!isEyeOpen)}
          >
            <Feather
              name={isEyeOpen ? 'eye' : 'eye-off'}
              size={16}
              color="black"
            />
          </TouchableOpacity>
      </View>
      <TextInput style={styles.input} 
               onChangeText={text => setPword(text)}
              autoCapitalize='none'
              autoComplete='password'
              secureTextEntry={isEyeOpen} 
      />
      
<DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleDateConfirm}
        onCancel={hideDatePicker}
      />
      <View style={styles.birthday}>
        <Text style={{fontSize:15, fontWeight:500 }}>Birthday (Optional): </Text>
        
        <TextInput style={{textDecorationLine: 'underline', fontWeight:500}} editable={false} onPressIn={()=> showDatePicker()} placeholder='Choose Date'>{birthday ? new Date(birthday).toDateString().split(' ').slice(1).join(' ') : ""}</TextInput>
      </View>
      
      <Text style = {{fontSize:15, fontWeight:500, paddingTop: 20}}>Select Interests</Text>
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

      <TouchableOpacity 
      style={styles.continueButton}
              onPress={async () =>  {
                if (fname.trim() && lname.trim() && email.trim() && pword) {
                  const arr = [];
                  if (pottery) arr.push("Pottery");
                  if (gallery) arr.push("Gallery");
                  if (events) arr.push("Events");
                  if (facilities) arr.push("Facilities");
                  // await signup(email, pword, fname, lname, phone, arr, birthday, expoPushToken);
                  try {
                    const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), pword);
                    const user = userCredential.user;
                    const data = {
                      uid: user.uid,
                      fname: fname.trim(),
                      lname: lname.trim(),
                      email: email.trim(),
                      phone: phone || "", // Use empty string if phone is not provided
                      admin: false,
                      birthday: birthday ? Math.floor(birthday.getTime() / 1000) : null,
                      notifToken: expoPushToken || '',
                      downloadURL: "",
                      notifications: [],
                      gender: "",
                      interests: arr
                    };
                    await setDoc(doc(db, 'users', user.uid), data);
                    navigation.reset({ index: 0, routes: [{ name: 'Waiver', params: { uid: user.uid } }] });
                  } catch (error) {
                    // console.error("Signup error:", error.code);
                    if (error.code == "auth/email-already-exists") Alert.alert("Email already exists");
                    if (error.code == "auth/email-already-in-use") Alert.alert("Email already in use");
                    if (error.code == "auth/invalid-email") Alert.alert("Invalid Email");
                    if (error.code == "auth/invalid-password") Alert.alert("Invalid Password (Must be at least 6 characters)");
                    if (error.code == "auth/weak-password") Alert.alert("Password must be at least 6 characters");
                    if (!['auth/email-already-exists', 'auth/email-already-in-use', 'auth/invalid-email', 'auth/invalid-password', 'auth/weak-password'].includes(error.code)) {
                      Alert.alert('Unable to create account', error.message);
                    }
                  }
                } else {
                  Alert.alert("Cannot leave field empty");
                }
              }}
      >
        <Text style = {{color:"white", fontSize:20}}>Continue</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 24, paddingBottom: 48, alignItems: 'stretch' },
  signUp: { fontSize: 34, fontWeight: '700', color: colors.ink, letterSpacing: -1, paddingTop: 26, paddingBottom: 30 },
  input: { ...field, width: '100%', marginTop: 8 }, continueButton: { ...button, width: '100%', marginTop: 28 },
  checkboxContainer: { flexDirection: 'row', alignItems: 'center', padding: 14, marginTop: 8, borderRadius: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  checkbox: { marginRight: 12, borderRadius: 5, borderColor: colors.border }, birthday: { flexDirection: 'row', alignItems: 'center', marginTop: 24, marginBottom: 4 },
  eventsButton: { position: 'absolute', right: 24, top: 112, backgroundColor: colors.soft, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10 }, eventsButtonText: { color: colors.primary, fontSize: 12, fontWeight: '600' }
});
