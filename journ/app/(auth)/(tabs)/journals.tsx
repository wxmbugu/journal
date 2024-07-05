import React, { useState, useEffect } from 'react'
import { StyleSheet, Text, View, ScrollView } from 'react-native'
import createAxiosInstance from '../../axios'
import { useSession } from '../../ctx'
import { Picker } from '@react-native-picker/picker'

export default function JournalSummary() {
  const { session } = useSession()
  const axiosInstance = createAxiosInstance(session)
  const [journals, setJournals] = useState([])
  const [period, setPeriod] = useState('daily')
  const [summary, setSummary] = useState([])

  useEffect(() => {
    fetchJournals()
  }, [])

  useEffect(() => {
    categorizeJournals()
  }, [journals, period])

  const fetchJournals = async () => {
    try {
      const response = await axiosInstance.get('/api/v1/journal')
      setJournals(response.data.message)
    } catch (error) {
      console.error('Error fetching journals:', error)
    }
  }

  const categorizeJournals = () => {
    const categorized = journals.reduce((acc, journal) => {
      const date = new Date(journal.date)
      let key

      switch (period) {
        case 'daily':
          key = date.toDateString()
          break
        case 'weekly':
          const startOfWeek = new Date(
            date.setDate(date.getDate() - date.getDay()),
          )
          key = startOfWeek.toDateString()
          break
        case 'monthly':
          key = `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`
          break
      }

      if (!acc[key]) {
        acc[key] = []
      }

      acc[key].push(journal)
      return acc
    }, {})

    setSummary(Object.entries(categorized))
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Journal Summary</Text>
      <Picker
        selectedValue={period}
        style={styles.picker}
        onValueChange={(itemValue) => setPeriod(itemValue)}
      >
        <Picker.Item label='Daily' value='daily' />
        <Picker.Item label='Weekly' value='weekly' />
        <Picker.Item label='Monthly' value='monthly' />
      </Picker>
      <ScrollView style={styles.scrollView}>
        <View style={styles.summaryContainer}>
          {summary.map(([key, entries]) => (
            <View key={key} style={styles.summarySection}>
              <Text style={styles.summaryTitle}>{key}</Text>
              {entries.map((journal) => (
                <View key={journal.id} style={styles.journalEntry}>
                  <Text style={styles.journalTitle}>{journal.title}</Text>
                  <Text>{journal.category}</Text>
                  <Text>{journal.content}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  picker: {
    height: 50,
    width: '100%',
    marginBottom: 20,
  },
  scrollView: {
    flex: 1,
  },
  summaryContainer: {
    flex: 1,
  },
  summarySection: {
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  journalEntry: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
  },
  journalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
})

