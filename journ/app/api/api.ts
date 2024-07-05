import { useEffect, useState } from 'react'
import { ActivityIndicator, FlatList, Text, View } from 'react-native'

type Movie = {
  id: string
  title: string
  releaseYear: string
}

const App = () => {
  const [isLoading, setLoading] = useState(true)
  const [data, setData] = useState<Movie[]>([])

  const getMovies = async () => {
    try {
      const response = await fetch('https://reactnative.dev/movies.json')
      const json = await response.json()
      setData(json.movies)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getMovies()
  }, [])
}

export default App
