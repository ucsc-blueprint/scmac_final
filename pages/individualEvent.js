import { colors, card, field, button } from '../components/ui';
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Switch } from 'react-native'; 
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, updateDoc, arrayUnion } from 'firebase/firestore';
import { Dropdown } from 'react-native-element-dropdown';
import { AntDesign } from '@expo/vector-icons';
import Checkbox from 'expo-checkbox';
import { auth, db } from '../firebaseConfig';
import { scheduleNotif } from './api/event';

var item = null;
export default function EventDetailScreen({route,navigation}) {
  const [value, setValue] = useState("");
  const [event, setEvent] = useState({});
  const [materials, setMaterials] = useState([]);
  const [shiftsData, setShiftsData] = useState([]);
  const [isEnabled, setIsEnabled] = useState(false);
  const toggleSwitch = () => setIsEnabled(previousState => !previousState);

  const renderItem = item => {
    return (
      <View style={styles.item}>
        <Text style={styles.textItem}>{item.label}</Text>
        {/* {console.log(item.value)}
        {console.log(value)} */}
        {item.value === value?.value && (
          <AntDesign
            style={styles.icon}
            color="black"
            name="Safety"
            size={20}
          />
        )}
        {/* <AntDesign
            style={styles.icon}
            color="black"
            name="Safety"
            size={20}
          /> */}
      </View>
    );
  };

  useEffect( () => {
    async function fetchData() {
      const arr = [];
      const arr2 = [];
      item = route.params;
      // const event = item;
      // console.log(item.item.id)
      const eventData = item.item;
      const loadedShifts = await Promise.all((eventData.shifts || []).map(async shiftId => {
        const shiftRef = doc(db, 'shifts', shiftId);
        const snapshot = await getDoc(shiftRef);
        if (!snapshot.exists()) return null;
        const shift = snapshot.data();
        const start = new Date(shift.startTime * 1000).toLocaleString('en-US', {
          weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
        });
        const end = new Date(shift.endTime * 1000).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        const signedUp = (shift.user || []).includes(auth.currentUser?.uid);
        return { shift: shiftRef, label: `${start} – ${end}${signedUp ? ' (Already Signed Up)' : ''}`, value: shiftId, startTime: shift.startTime };
      }));
      setShiftsData(loadedShifts.filter(Boolean).sort((a, b) => a.startTime - b.startTime));
      eventData.materials.forEach(async element => {
        const el = {...element,
                    isSelected: false};
        if(!element.user) arr2.push(el);
      });
      // console.log(materials);
      setMaterials(arr2);
      
      const fetchedEvents = {
          id: eventData.id,
          title: eventData.title,
          date: eventData.date,
          endDate: eventData.endDate,
          description: eventData.description,
          location: eventData.location,
          materials: eventData.materials,
          shifts: eventData.shifts,
          notifs: eventData.notifs
        }

      setEvent(fetchedEvents);
      // console.log(event.data())
    }
    fetchData();
 }, [])

  const toggleMaterial = (index) => {
    const updatedMaterials = [...materials];
    updatedMaterials[index].isSelected = !updatedMaterials[index].isSelected;
    setMaterials(updatedMaterials);
  };

  return (
    <ScrollView style={styles.container}>
        <View key={event.id}>
          <Text style={styles.title}>{event.title}</Text>
          <Text style={styles.subtitle}>Start Date: {new Date(event.date * 1000).toLocaleString('en-US', {
        weekday: 'short', // 'Fri'
        month: 'short',   // 'May'
        day: 'numeric',   // '03',
        year: '2-digit',
        hour: '2-digit',  // '02' or '14'
        minute: '2-digit' // '30'
    })}</Text>
          <Text style={styles.subtitle}>End Date: {new Date(event.endDate * 1000).toLocaleString('en-US', {
        weekday: 'short', // 'Fri'
        month: 'short',   // 'May'
        day: 'numeric',   // '03',
        year: '2-digit',
        hour: '2-digit',  // '02' or '14'
        minute: '2-digit' // '30'
    })}</Text>
          <Text style={styles.subtitle}>Location: {event.location}</Text>
          <Text style={styles.sectionTitle}>Event Description: </Text>
          <Text style={styles.description}>{event.description}</Text>
          <Text style={styles.sectionTitle}>Select a Work Shift</Text>
            <Dropdown
              style={styles.dropdown}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              inputSearchStyle={styles.inputSearchStyle}
              iconStyle={styles.iconStyle}
              data={shiftsData}
              maxHeight={320}
              mode="modal"
              containerStyle={{ backgroundColor: colors.surface, borderRadius: 16, borderColor: colors.border, padding: 8 }}
              activeColor={colors.soft}
              disable={!shiftsData.length}
              labelField="label"
              valueField="value"
              placeholder={shiftsData.length ? "Choose a work shift" : "No shifts available"}
              searchPlaceholder="Search..."
              value={value?.value || null}
              onChange={item => {
                // console.log(item)
                setValue(item);
              }}
              renderItem={renderItem}
            />
          {!shiftsData.length && <Text style={{ marginHorizontal: 24, marginTop: 10, color: colors.muted, fontSize: 13, lineHeight: 20 }}>This event has no volunteer shifts yet. An organizer can add them.</Text>}
          <Text style={styles.sectionTitle}>Materials Checklist</Text>
          {materials ? materials.map((material,index) => (
            <View key={index} style={styles.checkboxContainer}>
              <Checkbox
                value={materials[index].isSelected || false}
                onValueChange={() => toggleMaterial(index)}
                style={styles.checkbox}
              />
              <Text style={styles.label}>{material ? material.item : ""}</Text>
            </View>
          )):null}

<Text style={styles.sectionTitle}>Event Organizer</Text>
        <Switch
          trackColor={{false: '#767577', true: '#6A466C'}}
          thumbColor={isEnabled ? '#fff' : '#f4f3f4'}
          ios_backgroundColor="#3e3e3e"
          onValueChange={toggleSwitch}
          value={isEnabled}
          style={{marginLeft: "5%"}}
        />

          <Text style={styles.sectionTitle}>Comments</Text>
          <TextInput style={styles.textInput} multiline placeholder="Additional comments" />
          <TouchableOpacity style={styles.button} onPress={async ()=> 
            {
              const shiftData = await getDoc(value.shift);
              if(shiftData.data().user.includes(auth.currentUser.uid)) {
                Alert.alert("Already signed up");
                return;
              }
              const trigger = new Date(shiftData.data().startTime*1000);
              if (new Date > trigger) {
                Alert.alert("Start date for shift has passed");
                return;
              }
              console.log("event: " + event.title)

              Date.prototype.subtractDays = function (d) {
                this.setDate(this.getDate() - d);
                return this;
            }

            console.log(event)

            event.notifs.map(el => {
              if (el === "1 hour before") {
                const dateCopy = new Date(trigger);
                dateCopy.setHours(dateCopy.getHours() - 1);
                if (new Date < dateCopy) {
                  scheduleNotif("Reminder for event: " + event.title, "Be there for your shift: " + value.label, dateCopy, event.id)
                }
              }
              if (el === "1 day before") {
                const dateCopy2 = new Date(trigger);
                dateCopy2.subtractDays(1);
                if (new Date < dateCopy2) {
                  scheduleNotif("Reminder for event: " + event.title, "Be there for your shift: " + value.label, dateCopy2, event.id)
                }
              }
              if (el === "1 week before") {
                const dateCopy3 = new Date(trigger);
                dateCopy3.subtractDays(7);
                if (new Date < dateCopy3) {
                  scheduleNotif("Reminder for event: " + event.title, "Be there for your shift: " + value.label, dateCopy3, event.id)
                }
              }
            })

              // console.log(value.shift._key.path.segments[1]);
              if (isEnabled) {
                await updateDoc(value.shift, {
                  user: arrayUnion(auth.currentUser.uid),
                  organizers: arrayUnion(auth.currentUser.uid)
                });
              } else {
                await updateDoc(value.shift, {
                  user: arrayUnion(auth.currentUser.uid),
                });
              }
          const eventDoc = doc(db, "events", event.id);
          console.log(eventDoc);
          let index = 0;
          const arr = [];
          materials.map(m => {
            if (!m.user) {
              if (materials[index].isSelected)
                m.user = auth.currentUser.uid;
              index++;
            }
            arr.push(m);
          })
          // console.log(arr)
          await updateDoc(eventDoc, {
            materials: arr
          });
          await updateDoc(doc(db, "users", auth.currentUser.uid), {
            events: arrayUnion(event.id)
          });
          Alert.alert("Successfully Signed Up for " + event.title + "!");
          navigation.navigate("Events");
          }}>
            <Text style={styles.buttonText}>Confirm</Text>
          </TouchableOpacity>
        </View>
    </ScrollView>
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
    paddingBottom: 10, // Add padding at the bottom if needed for visual appeal
  },
  title: {
    fontSize: 24,
    fontWeight: '500',
    marginTop: "5%",
    // marginBottom: "5%",
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '500',
    marginTop: "5%",
    marginLeft: 10,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '500',
    marginTop: "5%",
    marginBottom: "2%",
    marginLeft: 10,
  },
  description: {
    fontSize: 16,
    marginLeft: 10,
    marginRight: 10,
    fontWeight: '400',
  },
  label: {
    fontSize: 16,
    // marginBottom: 10,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center', 
    paddingLeft: 20, 
    marginBottom: 3, 
  },
  checkbox: {
    marginRight: 8,
  },
  dropdown: {
    marginLeft: "4%",
    height: "7%",
    width: "90%",
    backgroundColor: 'F1F1F2',
    borderRadius: 12,
    borderWidth: 1,
    borderColor:"8E8E93",
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  item: {
    padding: 17,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textItem: {
    flex: 1,
    fontSize: 16,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  button: {
    backgroundColor: '#6A466C',
    padding: 15,
    margin: 10,
    borderRadius: 5,
    alignItems: 'center',
    borderRadius: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  }, 
  textInput: {
    height: 100,
    textAlignVertical: 'top',
    textAlign: 'left',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10, 
    fontSize: 16,
    borderRadius: 5,
    backgroundColor: "#F1F1F2",
    margin: 10,
  },
});
const styles = StyleSheet.create({
  ...originalStyles,
  container: { ...originalStyles.container, backgroundColor: colors.background },
  title: { ...originalStyles.title, fontSize: 30, color: colors.ink, fontWeight: "700", textAlign: "left", marginHorizontal: 24, marginTop: 28, letterSpacing: -0.7 },
  subtitle: { ...originalStyles.subtitle, fontSize: 14, color: colors.muted, lineHeight: 22, marginHorizontal: 24, marginTop: 12 },
  sectionTitle: { ...originalStyles.sectionTitle, fontSize: 17, color: colors.ink, fontWeight: "600", marginHorizontal: 24, marginTop: 28, marginBottom: 12 },
  description: { ...originalStyles.description, fontSize: 15, lineHeight: 24, color: colors.muted, marginHorizontal: 24 },
  dropdown: { ...field, height: 56, marginHorizontal: 24, paddingHorizontal: 14, shadowOpacity: 0, elevation: 0 },
  button: { ...originalStyles.button, ...button, marginHorizontal: 24, marginTop: 24, marginBottom: 40 },
  buttonText: { ...originalStyles.buttonText, fontSize: 16, fontWeight: "600" },
  textInput: { ...originalStyles.textInput, ...field, minHeight: 100, marginHorizontal: 24 },
  checkboxContainer: { ...originalStyles.checkboxContainer, marginHorizontal: 24, paddingLeft: 0, paddingVertical: 8 },
  label: { ...originalStyles.label, fontSize: 15, color: colors.ink }
});
