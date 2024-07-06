import React, { useState, useEffect } from 'react'
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native'
import createAxiosInstance from '../../axios'
import { useSession } from '../../ctx'

export default function UserDetails() {
  const { session, signOut } = useSession()
  const axiosInstance = createAxiosInstance(session)
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    fetchUserDetails()
  }, [])

  const fetchUserDetails = async () => {
    try {
      const response = await axiosInstance.get(
        `/api/v1/authentication/get_details/${session.user_id}`,
      )
      const { email, username, phone_number } = response.data
      setEmail(email)
      setUsername(username)
      setPhoneNumber(phone_number)
    } catch (error) {
      console.error('Error fetching user details:', error)
    }
  }

  const updateUserDetails = async (field, value) => {
    try {
      setIsUpdating(true)
      await axiosInstance.put('/api/v1/authentication/update_details', {
        [field]: value,
      })
      setIsUpdating(false)
    } catch (error) {
      setIsUpdating(false)
      console.error('Error updating user details:', error)
      Alert.alert('Error', 'There was an error updating the user details.')
    }
  }

  const handleEmailChange = (text) => {
    setEmail(text)
    updateUserDetails('email', text)
  }

  const handleUsernameChange = (text) => {
    setUsername(text)
    updateUserDetails('username', text)
  }

  const handlePhoneNumberChange = (text) => {
    setPhoneNumber(text)
    updateUserDetails('phone_number', text)
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : null}
    >
      <View style={styles.formContainer}>
        <Text style={styles.title}>Update User Details</Text>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={handleEmailChange}
        />
        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={handleUsernameChange}
        />
        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={styles.input}
          value={phoneNumber}
          onChangeText={handlePhoneNumberChange}
        />
        {isUpdating && <Text style={styles.updatingText}>Updating...</Text>}
        <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 20,
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
  },
  updatingText: {
    color: '#007AFF',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 10,
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
})
