import React, { useEffect, useState } from 'react'
import {
  StyleSheet,
  Text,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import createAxiosInstance from '../app/axios'
import { Link } from 'expo-router'
import { useSession } from '../app/ctx'

const JournalList = () => {
  const { session } = useSession()
  const axiosInstance = createAxiosInstance(session)
  const [journals, setJournals] = useState([])

  useEffect(() => {
    fetchJournals()
  })

  const fetchJournals = async () => {
    try {
      const response = await axiosInstance.get('/api/v1/journal')
      setJournals(response.data.message) // Assuming the response data contains an array of journals
    } catch (error) {
      console.error('Error fetching journals:', error)
    }
  }

  const renderItem = ({ item }) => (
    <Link href={`journal/${item.id}`} asChild>
      <TouchableOpacity style={styles.journalCard}>
        <Text style={styles.journalTitle}>{item.title}</Text>
        <Text style={styles.journalDate}>{formatDate(item.date)}</Text>
        <Text style={styles.journalContent}>
          {truncateContent(item.content)}
        </Text>
      </TouchableOpacity>
    </Link>
  )

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
  }

  const truncateContent = (content) => {
    const maxLength = 100
    if (content.length > maxLength) {
      return content.substring(0, maxLength) + '...'
    }
    return content
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : null}
    >
      <FlatList
        data={journals}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()} // Assuming each journal has a unique ID
        style={styles.flatList}
        showsVerticalScrollIndicator={false} // Hide vertical scrollbar
      />
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 20,
  },
  journalCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  journalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  journalDate: {
    fontSize: 14,
    color: '#999',
    marginBottom: 10,
  },
  journalContent: {
    fontSize: 16,
    color: '#666',
  },
  flatList: {
    width: '100%',
    marginTop: 10,
  },
})

export default JournalList
