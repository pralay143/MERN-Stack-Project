import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router'
import { errorMessage } from '@/api/client'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/Field'
import { Alert } from '@/components/ui/misc'
import { AuthCard } from '@/features/auth/AuthCard'
import { useCurrentUser, useLogin } from '@/features/auth/hooks'
import { safeNextPath } from '@/features/auth/redirect'
import { loginSchema, type LoginValues } from '@/features/auth/schemas'

export function LoginPage() {
  const [params] = useSearchParams()
  const next = safeNextPath(params.get('next'))
  const navigate = useNavigate()
  const { user } = useCurrentUser()
  const login = useLogin()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) })

  if (user) return <Navigate to={next} replace />

  const onSubmit = (values: LoginValues) => login.mutate(values, { onSuccess: () => navigate(next, { replace: true }) })

  return (
    <AuthCard
      title="Welcome back"
      intro="Log in to see your orders and check out faster."
      footer={
        <>
          New here?{' '}
          <Link to={`/register${params.get('next') ? `?next=${encodeURIComponent(next)}` : ''}`} className="font-medium text-walnut hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
        {login.isError && <Alert>{errorMessage(login.error)}</Alert>}
        <TextField label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
        <TextField
          label="Password"
          type="password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />
        <Button type="submit" size="lg" fullWidth loading={login.isPending}>
          Log in
        </Button>
      </form>
    </AuthCard>
  )
}
