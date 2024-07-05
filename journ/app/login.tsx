import React from 'react'
import { Button, StyleSheet, TextInput, View, Text } from 'react-native'

import { Formik } from 'formik'
import { ThemedText } from '@/components/ThemedText'
import * as Yup from 'yup'
import { useSession } from './ctx'
import { router, Link } from 'expo-router'

const LoginSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string()
    .min(6, 'Password is too short - should be 6 chars minimum.')
    .required('Password is required'),
})

export default function Login() {
  const { signIn } = useSession()

  const handleLogin = async (values) => {
    try {
      const response = await fetch(
        'http://192.168.100.101:5000/api/v1/authentication/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(values),
        },
      )

      if (response.ok) {
        const data = await response.json()
        signIn(data)
        router.replace('/')
      } else {
        console.error('Login failed')
      }
    } catch (error) {
      console.error('An error occurred:', error)
    }
  }

  return (
    <View style={styles.container}>
      <Formik
        initialValues={{ email: '', password: '' }}
        validationSchema={LoginSchema}
        onSubmit={handleLogin}
      >
        {({
          handleChange,
          handleBlur,
          handleSubmit,
          values,
          errors,
          touched,
        }) => (
          <>
            <TextInput
              style={styles.input}
              placeholder='Email'
              onChangeText={handleChange('email')}
              onBlur={handleBlur('email')}
              value={values.email}
            />
            {errors.email && touched.email && (
              <Text style={styles.error}>{errors.email}</Text>
            )}
            <TextInput
              style={styles.input}
              placeholder='Password'
              secureTextEntry
              onChangeText={handleChange('password')}
              onBlur={handleBlur('password')}
              value={values.password}
            />
            {errors.password && touched.password && (
              <Text style={styles.error}>{errors.password}</Text>
            )}
            <Button onPress={handleSubmit} title='Login' />
          </>
        )}
      </Formik>
      <ThemedText>
        Don't have an account?{' '}
        <Link href='/signup' style={styles.link}>
          Signup
        </Link>
      </ThemedText>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    width: '80%',
    padding: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  error: {
    color: 'red',
    marginBottom: 10,
  },
  link: {
    color: 'blue',
  },
})
