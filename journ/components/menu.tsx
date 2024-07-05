import React, { useState } from 'react'
import { StyleSheet, TouchableOpacity, Text, View, Alert } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import createAxiosInstance from '../app/axios'
import { useSession } from '../app/ctx'

const ThreeDotMenu = ({ journalId, onDelete }) => {
  const { session } = useSession()
  const axiosInstance = createAxiosInstance(session)
  const [showDelete, setShowDelete] = useState(false)

  const handleDeleteJournal = async () => {
    try {
      await axiosInstance.delete(`/api/v1/journal/${journalId}`)
      Alert.alert('Success', 'Journal deleted successfully.')
      onDelete()
    } catch (error) {
      console.error('Error deleting journal:', error)
      Alert.alert('Error', 'There was an error deleting the journal.')
    }
  }

  return (
    <View style={styles.menuContainer}>
      <TouchableOpacity onPress={() => setShowDelete(!showDelete)}>
        <Ionicons name='ellipsis-vertical' size={24} color='black' />
      </TouchableOpacity>
      {showDelete && (
        <View style={styles.deleteButtonContainer}>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDeleteJournal}
          >
            <Text style={styles.deleteButtonText}>Delete Journal</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  menuContainer: {
    position: 'absolute',
    right: 20,
    top: 30,
    zIndex: 1,
  },
  deleteButtonContainer: {
    marginTop: 10,
    alignItems: 'flex-end',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    padding: 10,
    borderRadius: 5,
  },
  deleteButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
})

export default ThreeDotMenu
