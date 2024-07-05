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
import { Ionicons } from '@expo/vector-icons'
import createAxiosInstance from '../../../axios'
import { useSession } from '../../../ctx'
import { Picker } from '@react-native-picker/picker'
import { useLocalSearchParams } from 'expo-router'
export default function Journal() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { session } = useSession()
  const axiosInstance = createAxiosInstance(session)
  const [journalId, setJournalId] = useState('')
  const [deleted, setDeleted] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category_id, setCategory_id] = useState('')
  const [categoryName, setCategoryName] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  const [categories, setCategories] = useState([])
  const [showDelete, setShowDelete] = useState(false)

  useEffect(() => {
    fetchJournal()
    fetchCategories()
  }, [journalId])
  useEffect(() => {
    setJournalId(id)
  }, [id])
  const fetchJournal = async () => {
    try {
      const response = await axiosInstance.get(`/api/v1/journal/${journalId}`)
      const { title, content, category_id } = response.data.message
      setTitle(title)
      setContent(content)
      setCategory_id(category_id)
      fetchCategoryName(category_id)
    } catch (error) {
      console.error('Error fetching journal:', error)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await axiosInstance.get('/api/v1/journal/category')
      setCategories(response.data.message)
      // Fetch category name only if category_id is set initially
      if (category_id) {
        fetchCategoryName(category_id)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchCategoryName = (categoryId) => {
    const selectedCategory = categories.find((cat) => cat.id === categoryId)
    if (selectedCategory) {
      setCategoryName(selectedCategory.name)
    }
  }

  const updateJournal = async (field, value) => {
    try {
      setIsUpdating(true)
      await axiosInstance.put(`/api/v1/journal/${journalId}`, {
        [field]: value,
      })
      setIsUpdating(false)
      if (field === 'category_id') {
        fetchCategoryName(value)
      }
    } catch (error) {
      setIsUpdating(false)
      console.error('Error updating journal:', error)
      Alert.alert('Error', 'There was an error updating the journal.')
    }
  }

  const handleTitleChange = (text) => {
    setTitle(text)
    updateJournal('title', text)
  }

  const handleContentChange = (text) => {
    setContent(text)
    updateJournal('content', text)
  }

  const handleCategoryChange = (value) => {
    setCategory_id(value)
    updateJournal('category_id', value)
  }

  const handleDeleteJournal = async () => {
    try {
      await axiosInstance.delete(`/api/v1/journal/${journalId}`)
      Alert.alert('Success', 'Journal deleted successfully.')
      setDeleted(true)
    } catch (error) {
      console.error('Error deleting journal:', error)
      Alert.alert('Error', 'There was an error deleting the journal.')
    }
  }

  if (deleted) {
    return (
      <View style={styles.deletedContainer}>
        <Text style={styles.deletedText}>Journal has been deleted.</Text>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : null}
    >
      <View style={styles.formContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Edit Journal</Text>
          <View style={styles.menuContainer}>
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => setShowDelete(!showDelete)}
            >
              <Ionicons name='ellipsis-vertical' size={24} color='black' />
            </TouchableOpacity>
            {showDelete && (
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={handleDeleteJournal}
              >
                <Text style={styles.deleteButtonText}>Delete Journal</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={handleTitleChange}
        />
        <Text style={styles.label}>Content</Text>
        <TextInput
          style={[styles.input, styles.contentInput]}
          value={content}
          onChangeText={handleContentChange}
          multiline
          numberOfLines={6}
          textAlignVertical='top'
        />
        <Text style={styles.label}>Category</Text>
        <Text style={styles.categoryText}>{categoryName}</Text>
        <Picker
          selectedValue={category_id}
          style={styles.picker}
          onValueChange={handleCategoryChange}
        >
          {categories.map((cat) => (
            <Picker.Item key={cat.id} label={cat.name} value={cat.id} />
          ))}
        </Picker>
        {isUpdating && <Text style={styles.updatingText}>Updating...</Text>}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  menuContainer: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  menuButton: {
    padding: 10,
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  deleteButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
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
  contentInput: {
    height: 150,
    textAlignVertical: 'top',
  },
  picker: {
    height: 50,
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
  },
  updatingText: {
    color: '#007AFF',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 10,
  },
  deletedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  deletedText: {
    fontSize: 18,
    color: '#333',
  },
  categoryText: {
    fontSize: 16,
    marginBottom: 10,
  },
})
