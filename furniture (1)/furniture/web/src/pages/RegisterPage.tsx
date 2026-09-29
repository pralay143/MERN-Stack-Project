import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router'
import { errorMessage } from '@/api/client'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/Field'
import { Alert } from '@/components/ui/misc'
import { applyServerErrors } from '@/features/auth/applyServerErrors'
import { AuthCard } from '@/features/auth/AuthCard'
import { useCurrentUser, useRegister } from '@/features/auth/hooks'
import { safeNextPath } from '@/features/auth/redirect'
import { registerSchema, type RegisterValues } from '@/features/auth/schemas'

export function RegisterPage() {
  const [params] = useSearchParams()
  const next = safeNextPath(params.get('next'))
  const navigate = useNavigate()
  const { user } = useCurrentUser()
  const signUp = useRegister()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema) })

  if (user && !signUp.isSuccess) return <Navigate to={next} replace />

  const onSubmit = ({ contactNum, ...values }: RegisterValues) =>
    signUp.mutate(
      { ...values, ...(contactNum ? { contactNum } : {}) },
      {
        onSuccess: () => navigate(next, { replace: true }),
        onError: (error) => applyServerErrors(error, setError, ['name', 'email', 'password', 'contactNum']),
      },
    )

  // Field-level messages from the server appear under the inputs instead.
  const showAlert = signUp.isError && Object.keys(errors).length === 0

  return (
    <AuthCard
      title="Create your account"
      intro="Save your details, track orders and check out in seconds."
      footer={
        <>
          Already have an account?{' '}
          <Link to={`/login${params.get('next') ? `?next=${encodeURIComponent(next)}` : ''}`} className="font-medium text-walnut hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
        {showAlert && <Alert>{errorMessage(signUp.error)}</Alert>}
        <TextField label="Full name" autoComplete="name" error={errors.name?.message} {...register('name')} />
        <TextField label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
        <TextField
          label="Password"
          type="password"
          autoComplete="new-password"
          hint="At least 8 characters."
          error={errors.password?.message}
          {...register('password')}
        />
        <TextField
          label="Phone (optional)"
          type="tel"
          autoComplete="tel"
          hint="For delivery updates."
          error={errors.contactNum?.message}
          {...register('contactNum')}
        />
        <Button type="submit" size="lg" fullWidth loading={signUp.isPending}>
          Create account
        </Button>
      </form>
    </AuthCard>
  )
}
