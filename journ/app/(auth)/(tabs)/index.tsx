import React, { useState, useRef, useEffect } from 'react'
import {
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Animated,
  FlatList,
  Platform,
  Modal,
  View,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { ThemedText as Text } from '@/components/ThemedText'
import JournalList from '@/components/journals'
import createAxiosInstance from '../../axios'
import { useSession } from '../../ctx'

export default function Index() {
  const { session } = useSession()
  const axiosInstance = createAxiosInstance(session)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [categoryId, setCategoryId] = useState(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isCategoryFormVisible, setIsCategoryFormVisible] = useState(false)
  const [newCategory, setNewCategory] = useState('')
  const [categories, setCategories] = useState([])
  const fadeAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await axiosInstance.get('/api/v1/journal/category')
      setCategories(response.data.message)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const toggleForm = () => {
    setIsVisible(!isVisible)
    Animated.timing(fadeAnim, {
      toValue: isVisible ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start()
  }

  const handleCreateJournal = async () => {
    if (!title || !content || !categoryId) {
      alert('Please fill out all fields.')
      return
    }

    try {
      const response = await axiosInstance.post('/api/v1/journal', {
        title,
        content,
        category_id: categoryId,
      })

      console.log('Journal created:', response.data)
      setTitle('')
      setContent('')
      setCategoryId(null)
      toggleForm()
    } catch (error) {
      console.error('Error creating journal:', error)
    }
  }

  const handleCreateCategory = async () => {
    if (!newCategory) {
      alert('Please enter a category name.')
      return
    }

    try {
      const response = await axiosInstance.post(
        '/api/v1/journal/new_category',
        { name: newCategory },
      )

      console.log('Category created:', response.data)
      setNewCategory('')
      setIsCategoryFormVisible(false)
      fetchCategories()
    } catch (error) {
      console.error('Error creating category:', error)
    }
  }

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.categoryItem}
      onPress={() => {
        setCategoryId(item.id)
        setIsCategoryFormVisible(false)
      }}
    >
      <Text style={styles.categoryItemText}>{item.name}</Text>
    </TouchableOpacity>
  )

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : null}
    >
      <JournalList />

      <TouchableOpacity style={styles.createButton} onPress={toggleForm}>
        <Ionicons name='add-circle-outline' size={32} color='#007AFF' />
      </TouchableOpacity>

      <Modal
        animationType='slide'
        transparent={true}
        visible={isVisible}
        onRequestClose={toggleForm}
      >
        <View style={styles.modalBackground}>
          <View style={styles.formContainer}>
            <Animated.View style={{ opacity: fadeAnim }}>
              <Text style={styles.title}>Create New Journal</Text>
              <TextInput
                style={styles.input}
                placeholder='Title'
                value={title}
                onChangeText={(text) => setTitle(text)}
              />
              <TouchableOpacity
                style={styles.selectCategoryButton}
                onPress={() => setIsCategoryFormVisible(!isCategoryFormVisible)}
              >
                <Text style={styles.buttonText}>
                  {isCategoryFormVisible
                    ? 'Hide Categories'
                    : 'Select Category'}
                </Text>
              </TouchableOpacity>

              {isCategoryFormVisible && (
                <FlatList
                  data={categories}
                  renderItem={renderItem}
                  keyExtractor={(item) => item.id.toString()}
                  style={styles.categoryList}
                />
              )}

              <TouchableOpacity
                style={styles.smallCreateCategoryButton}
                onPress={() => setIsCategoryFormVisible(!isCategoryFormVisible)}
              >
                <Text style={styles.buttonText}>
                  {isCategoryFormVisible
                    ? 'Hide Create Category'
                    : 'Create Category'}
                </Text>
              </TouchableOpacity>

              {isCategoryFormVisible && (
                <View style={styles.categoryForm}>
                  <TextInput
                    style={styles.input}
                    placeholder='New Category Name'
                    value={newCategory}
                    onChangeText={(text) => setNewCategory(text)}
                  />
                  <TouchableOpacity
                    style={styles.createCategoryButton}
                    onPress={handleCreateCategory}
                  >
                    <Text style={styles.buttonText}>Submit Category</Text>
                  </TouchableOpacity>
                </View>
              )}

              <TextInput
                style={[styles.input, styles.contentInput]}
                placeholder='Content'
                multiline
                numberOfLines={6}
                value={content}
                onChangeText={(text) => setContent(text)}
              />
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleCreateJournal}
              >
                <Text style={styles.buttonText}>Create Journal</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  )
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: 20,
  },
  createButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 50,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
    zIndex: 10,
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  formContainer: {
    width: '100%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#007AFF',
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
  selectCategoryButton: {
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    padding: 15,
    marginTop: 10,
  },
  categoryList: {
    maxHeight: 150,
    marginBottom: 15,
  },
  categoryItem: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    marginBottom: 10,
  },
  categoryItemText: {
    color: 'black',
  },
  smallCreateCategoryButton: {
    backgroundColor: '#34C759',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    padding: 15,
    marginTop: 10,
  },
  categoryForm: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    marginTop: 10,
  },
  createCategoryButton: {
    backgroundColor: '#34C759',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    padding: 15,
    marginTop: 10,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    padding: 15,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
})
