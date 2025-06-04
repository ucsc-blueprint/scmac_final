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
import { auth } from '../firebaseConfig.js';

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
    <ScrollView contentContainerStyle={styles.container}>
     <TouchableOpacity style={{marginTop: "20%"}} onPress={()=>navigation.navigate("Login")}>
                <AntDesign name="leftcircleo" size={50} color="#A3A3A3" />
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
                if (fname && lname && email && pword && birthday) {
                  const arr = [];
                  if (pottery) arr.push("Pottery");
                  if (gallery) arr.push("Gallery");
                  if (events) arr.push("Events");
                  if (facilities) arr.push("Facilities");
                  // await signup(email, pword, fname, lname, phone, arr, birthday, expoPushToken);
                  try {
                    const userCredential = await createUserWithEmailAndPassword(auth, email, pword);
                    const user = userCredential.user;
                    const data = {
                      uid: user.uid,
                      fname: fname,
                      lname: lname,
                      email: email,
                      phone: phone || "", // Use empty string if phone is not provided
                      // admin: false,
                      birthday: typeof birthday === 'number'? birthday: Math.floor(birthday.getTime() / 1000),
                      notifToken: expoPushToken,
                      downloadURL: "",
                      notifications: [],
                      gender: "",
                      interests: arr
                    };
                    navigation.navigate("Waiver", {item: data});
                  } catch (error) {
                    // console.error("Signup error:", error.code);
                    if (error.code == "auth/email-already-exists") Alert.alert("Email already exists");
                    if (error.code == "auth/email-already-in-use") Alert.alert("Email already in use");
                    if (error.code == "auth/invalid-email") Alert.alert("Invalid Email");
                    if (error.code == "auth/invalid-password") Alert.alert("Invalid Password (Must be at least 6 characters)");
                    if (error.code == "auth/weak-password") Alert.alert("Password must be at least 6 characters");
                    // throw error;
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
  container: {
    // flex: -300,
    alignItems: 'flex-start',
    paddingLeft: 25,
    paddingRight: 25,
    // marginBottom: '80%'
  },
  backButton: {
    marginTop: 80,
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 2.5,
    borderColor: '#A3A3A3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signUp: {
    paddingTop: 35,
    paddingBottom: 35,
    fontWeight: "600",
    fontSize: 30,
    color: '#6A466C',
    textAlign: 'left'
  },
  input: {
    height: 40,
    width: 333,
    borderColor: '#232323',
    paddingHorizontal: 10,
    fontSize: 18,
    borderBottomWidth: 1.2
  },  
  continueButton: {
    marginTop: "6%",
    backgroundColor: '#6A466C',
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    width: 333,
    height: 44,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: "3%",
    marginLeft: "1%"
  },
  checkbox: {
    marginRight: 8,
  },
  birthday: {
    marginTop: "6%",
    marginBottom: "1%",
    flexDirection:'row',
  },
  eventsButton: {
    position: 'absolute',
    right: 25,
    top: 130,
    backgroundColor: '#6A466C',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventsButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});
