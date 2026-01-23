<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent, AuthFormField } from '@nuxt/ui'
import { login } from '~/api/auth/Auth'
import { ref } from 'vue'

const toast = useToast()

const authError = ref('')
const authFieldErrors = ref({})
const authRawError = ref(null)

const fields: AuthFormField[] = [{
  name: 'email',
  type: 'email',
  label: 'Email',
  placeholder: 'Enter your email',
  required: true
}, {
  name: 'password',
  label: 'Password',
  type: 'password',
  placeholder: 'Enter your password',
  required: true
}, {
  name: 'remember',
  label: 'Remember me',
  type: 'checkbox'
}]


const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Must be at least 8 characters')
})

type Schema = z.output<typeof schema>

async function onSubmit(payload: FormSubmitEvent<Schema>) {
  try {
    authError.value = ''
    authFieldErrors.value = {}
    const response: any = await login(payload.data.email, payload.data.password)
    // Some backends return a 200 with { success: false } — treat that as an error
    if (!response || response?.success === false || !response?.token) {
      const msg = response?.message || response?.error || response?.data?.message || 'Login failed'
      const err = { data: { message: msg, errors: response?.errors || response?.data?.errors } }
      throw err
    }
    const token = useCookie('auth_token')
    const role = useCookie('user_role')
    role.value = response.role
    token.value = response.token
    
    toast.add({ title: 'Success', description: 'Logged in successfully' })
    if (response.role === 'admin') {
      await navigateTo('/admin')
    } else if (response.role === 'supervisor') {
      await navigateTo('/supervisor')
    } else if (response.role === 'technician') {
      await navigateTo('/technician')
    } else {
      await navigateTo('/user')
    }
  } catch (error: any) {
    console.error('Login error:', error)
    // populate field-level errors if present (Laravel-style `errors`), and a general message
    authFieldErrors.value = {}
    if (error?.data?.errors) {
      authFieldErrors.value = Object.fromEntries(Object.entries(error.data.errors).map(([k, v]) => [k, Array.isArray(v) ? v.join(' ') : v]))
    }

    let message = ''
    if (error?.data?.message) {
      message = error.data.message
    } else if (error?.data?.errors) {
      const first = Object.values(error.data.errors)[0]
      message = Array.isArray(first) ? first[0] : String(first)
    } else if (error?.message) {
      message = error.message
    } else if (typeof error === 'string') {
      message = error
    } else {
      try { message = JSON.stringify(error) } catch { message = 'An error occurred during login' }
    }

    authError.value = message || 'An error occurred during login'
    toast.add({ title: 'Login Failed', description: authError.value, color: 'error' })
  }
}
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-4 p-4">
    <UPageCard class="w-full max-w-md">
      <div class="mb-4 w-full">
        <UAlert v-if="authError" icon="i-lucide-alert-triangle" color="red" variant="soft" title="Login Failed" :description="authError" />
      </div>

      <UAuthForm
        :schema="schema"
        title="Login"
        description="Enter your credentials to access your account."
        icon="i-lucide-user"
        :fields="fields"
        :errors="authFieldErrors"
        @submit="onSubmit"
      />
    </UPageCard>
  </div>
</template>

