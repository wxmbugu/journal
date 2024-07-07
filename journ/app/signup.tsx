import React, { useState } from 'react'
import { Button, StyleSheet, TextInput, View, Text } from 'react-native'
import { ThemedText } from '@/components/ThemedText'
import { Formik } from 'formik'
import * as Yup from 'yup'
import { useSession } from './ctx'
import { router, Link } from 'expo-router'

const SignupSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Email is required'),
  username: Yup.string().required('Username is required'),
  phone_number: Yup.string()
    .max(20, 'Phone number must be a string shorter than 20 characters')
    .required('Phone number is required'),
  password: Yup.string()
    .min(6, 'Password is too short - should be 6 chars minimum.')
    .required('Password is required'),
  confirm_password: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
})

export default function Signup() {
  const { signIn } = useSession()
  const [signupErrors, setSignupErrors] = useState({})

  const handleSignup = async (values) => {
    const { confirm_password, ...signupData } = values

    try {
      const response = await fetch(
        'http://192.168.100.101:5000/api/v1/authentication/signup',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(signupData),
        },
      )

      if (response.ok) {
        const data = await response.json()
        signIn(data.user)
        router.replace('/')
      } else {
        const errorData = await response.json()
        const errors = {}
        if (typeof errorData.error === 'string') {
          errors.general = errorData.error
        } else {
          for (const key in errorData.error) {
            if (Array.isArray(errorData.error[key])) {
              errors[key] = errorData.error[key].join(' ')
            } else {
              errors[key] = errorData.error[key]
            }
          }
        }
        setSignupErrors(errors)
      }
    } catch (error) {
      console.error('An error occurred:', error)
      setSignupErrors({ general: 'An error occurred. Please try again.' })
    }
  }

  return (
    <View style={styles.container}>
      <Formik
        initialValues={{
          email: '',
          username: '',
          phone_number: '',
          password: '',
          confirm_password: '',
        }}
        validationSchema={SignupSchema}
        onSubmit={handleSignup}
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
            {signupErrors.email && (
              <Text style={styles.error}>{signupErrors.email}</Text>
            )}
            <TextInput
              style={styles.input}
              placeholder='Username'
              onChangeText={handleChange('username')}
              onBlur={handleBlur('username')}
              value={values.username}
            />
            {errors.username && touched.username && (
              <Text style={styles.error}>{errors.username}</Text>
            )}
            {signupErrors.username && (
              <Text style={styles.error}>{signupErrors.username}</Text>
            )}
            <TextInput
              style={styles.input}
              placeholder='Phone Number'
              onChangeText={handleChange('phone_number')}
              onBlur={handleBlur('phone_number')}
              value={values.phone_number}
            />
            {errors.phone_number && touched.phone_number && (
              <Text style={styles.error}>{errors.phone_number}</Text>
            )}
            {signupErrors.phone_number && (
              <Text style={styles.error}>{signupErrors.phone_number}</Text>
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
            {signupErrors.password && (
              <Text style={styles.error}>{signupErrors.password}</Text>
            )}
            <TextInput
              style={styles.input}
              placeholder='Confirm Password'
              secureTextEntry
              onChangeText={handleChange('confirm_password')}
              onBlur={handleBlur('confirm_password')}
              value={values.confirm_password}
            />
            {errors.confirm_password && touched.confirm_password && (
              <Text style={styles.error}>{errors.confirm_password}</Text>
            )}
            {signupErrors.confirm_password && (
              <Text style={styles.error}>{signupErrors.confirm_password}</Text>
            )}
            {signupErrors.general && (
              <Text style={styles.error}>{signupErrors.general}</Text>
            )}
            <Button onPress={handleSubmit} title='Signup' />
          </>
        )}
      </Formik>
      <ThemedText>
        Have an account?{' '}
        <Link href='/login' style={styles.link}>
          Login
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
