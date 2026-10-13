import { colors, field, button } from '../components/ui';
import React, { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Dimensions, TextInput, TouchableOpacity, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Image } from 'expo-image';
import { EvilIcons } from '@expo/vector-icons';
import { Feather } from '@expo/vector-icons';
import { Fontisto } from '@expo/vector-icons';
import {checkPersistence, login} from "./api/users.js"
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db } from '../firebaseConfig.js';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
const windowHeight = Dimensions.get('window').height; // 667
const windowWidth = Dimensions.get('window').width; // 375
import { registerForPushNotificationsAsync } from '../expoPushNotifications.js'

export default function Login({navigation}) {
  const [isEyeOpen, setIsEyeOpen] = useState(true);
  const [email, setEmail] = useState("");
  const [pword, setPword] = useState("");
  const [expoPushToken, setExpoPushToken] = useState('');
  useFocusEffect(useCallback(() => {
    let active = true;
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      try {
        const token = await registerForPushNotificationsAsync().catch(error => {
          console.warn('Push notification registration failed:', error);
          return '';
        });
        if (!active) return;
        setExpoPushToken(token || '');
        const waiver = await getDoc(doc(db, 'waivers', user.uid));
        if (!active) return;
        if (!waiver.exists()) {
          navigation.reset({ index: 0, routes: [{ name: 'Waiver', params: { uid: user.uid } }] });
        } else {
          const admin = await checkPersistence(token, user.uid);
          if (active) navigation.reset({ index: 0, routes: [{ name: admin ? 'AdminEvents' : 'Events' }] });
        }
      } catch (error) {
        if (active) Alert.alert('Unable to load account', error.message);
      }
    });
    return () => { active = false; unsubscribe(); };
  }, [navigation]));


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}><KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.container}>
        <Image
            style={styles.image}
            source={require('../assets/scmac-logo.png')}
        />
        <Text style={styles.titleText}>
            Welcome back.
        </Text>
        <Text style={styles.intro}>A little time. A lasting impact.
Join your creative community.</Text>

        <Text style={styles.emailText}>Email</Text>
        <View style={styles.emailContainer}>
        <View style={styles.envelopeIcon}>
          <EvilIcons name="envelope" size={24} color="black" />
        </View>
          <TextInput  
          style={styles.emailInput} 
          autoCapitalize='none'
          value={email} 
          placeholder="johndoe@gmail.com"
          placeholderTextColor="#808080"
          onChangeText={text => setEmail(text)}
          ></TextInput>
        </View>
        <Text style={styles.passwordText}>Password</Text>
        <View style={styles.passwordContainer}>
        <View style={styles.lockIcon}>
          <EvilIcons name="lock" size={24} color="black" />
        </View>
          <TextInput autoCapitalize='none' 
            secureTextEntry={isEyeOpen} 
            value={pword}
            style={styles.passwordInput}
            placeholder="●●●●●●●"
            placeholderTextColor="#808080"
            onChangeText={text => setPword(text)}></TextInput>
          <View style={styles.eyeIcon}>
          <TouchableOpacity
            onPress={() => setIsEyeOpen(!isEyeOpen)}
          >
            <Feather
              name={isEyeOpen ? 'eye' : 'eye-off'}
              size={16}
              color="black"
            />
          </TouchableOpacity>
        </View>
        </View>

      <View>
      <TouchableOpacity
          onPress={() => {
            navigation.navigate("ForgotPassword1")
          }}
          style={styles.forgotPasswordButton}
        >
          <Text style={styles.forgotPasswordText}>Forgot password?</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.loginButton}
              onPress={async () => {
                if (email && pword) {
                var user = await login(email,pword, expoPushToken);
                if (user) {
                  setEmail("");
                  setPword("");
                }
              } else {
                Alert.alert("Cannot leave field empty");
              }
              }}
            >
            <Text style={styles.loginButtonText}>Log In</Text>
          </TouchableOpacity>
        </View>
      <TouchableOpacity
          onPress={() => {
            navigation.navigate("Signup");
          }}
          style={styles.noAccountButton}
        >
          <Text style={styles.noAccountText}>Don't have an account? <Text style={styles.signUpText}>Sign Up</Text></Text>
        </TouchableOpacity>
    </ScrollView></KeyboardAvoidingView></SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, paddingHorizontal: 28, paddingTop: 28, paddingBottom: 40, alignItems: 'center', backgroundColor: colors.background },
  image: { width: 280, maxWidth: '100%', height: 110, contentFit: 'contain', marginBottom: 32 },
  titleText: { width: '100%', color: colors.ink, fontWeight: '700', fontSize: 36, letterSpacing: -1, lineHeight: 44 },
  intro: { width: '100%', color: colors.muted, fontSize: 16, lineHeight: 25, marginTop: 10, marginBottom: 28 },
  emailText: { width: '100%', color: colors.ink, fontSize: 13, fontWeight: '600', marginBottom: 9 },
  passwordText: { width: '100%', color: colors.ink, fontSize: 13, fontWeight: '600', marginTop: 22, marginBottom: 9 },
  emailContainer: { ...field, width: '100%', flexDirection: 'row', alignItems: 'center', paddingVertical: 5 },
  passwordContainer: { ...field, width: '100%', flexDirection: 'row', alignItems: 'center', paddingVertical: 5 },
  emailInput: { flex: 1, paddingVertical: 10, paddingHorizontal: 10, color: colors.ink, fontSize: 16 },
  passwordInput: { flex: 1, paddingVertical: 10, paddingHorizontal: 10, color: colors.ink, fontSize: 16 },
  eyeIcon: { padding: 6 }, envelopeIcon: {}, lockIcon: {},
  forgotPasswordButton: { alignSelf: 'flex-end', paddingVertical: 18, paddingHorizontal: 8 },
  forgotPasswordText: { color: colors.primary, fontSize: 13, fontWeight: '600' },
  buttonContainer: { width: '100%', marginTop: 6 }, loginButton: { ...button, width: '100%' },
  loginButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' }, noAccountButton: { paddingVertical: 24 },
  noAccountText: { color: colors.muted, fontSize: 14, textAlign: 'center' }, signUpText: { color: colors.primary, fontWeight: '700' }
});
