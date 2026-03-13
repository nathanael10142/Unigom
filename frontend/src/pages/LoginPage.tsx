import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import { Header } from '../components/layout/Header'
import { Button } from '../components/ui/Button'
import { useAuthStore } from '../stores/authStore'
import type { Admin } from '../types'
import toast from 'react-hot-toast'

const loginSchema = z.object({
  username: z.string().min(1, 'L\'email est requis').email('Email invalide'),
  password: z.string().min(1, 'Le mot de passe est requis'),
})

type LoginFormData = z.infer<typeof loginSchema>

export const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const { login, isLoading } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data)
      toast.success('Connexion réussie!')
      navigate('/')
    } catch (error) {
      // L'erreur est déjà gérée dans le store
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img 
            src="/logo.png" 
            alt="Logo" 
            className="w-20 h-20 object-contain mx-auto mb-4"
          />
          <h1 className="text-text-primary text-2xl font-bold mb-2">
            UNIGOM Biométrie
          </h1>
          <p className="text-text-secondary">
            Système de Présence Biométrique
          </p>
        </div>

        {/* Login Form */}
        <div className="card-whatsapp p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Username Field */}
            <div>
              <label className="block text-text-primary text-sm font-medium mb-2">
                Email
              </label>
              <input
                type="email"
                {...register('username')}
                className="input-whatsapp w-full"
                placeholder="admin@unigom.edu"
                disabled={isLoading}
              />
              {errors.username && (
                <p className="text-error text-sm mt-1">
                  {errors.username.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-text-primary text-sm font-medium mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  className="input-whatsapp w-full pr-10"
                  placeholder="••••••••"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-text-primary"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-error text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              loading={isLoading}
              icon={<LogIn size={20} />}
              className="w-full"
            >
              {isLoading ? 'Connexion...' : 'Se connecter'}
            </Button>
          </form>

          {/* Info Section */}
          <div className="mt-6 pt-6 border-t border-border">
            <div className="text-center">
              <p className="text-text-secondary text-sm mb-2">
                Accès administrateur uniquement
              </p>
              <div className="flex items-center justify-center gap-2 text-xs text-text-muted">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>Connexion sécurisée JWT</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-text-muted text-xs">
            Université de Goma © 2026
          </p>
        </div>
      </div>
    </div>
  )
}
