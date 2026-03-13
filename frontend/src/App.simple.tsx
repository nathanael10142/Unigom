import React, { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Eye, EyeOff, LogIn } from 'lucide-react'

// Page de login simple
function SimpleLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // Simulation de login - juste pour tester
    if (email && password) {
      setIsLoggedIn(true)
    }
  }

  if (isLoggedIn) {
    return (
      <div style={{ 
        padding: '40px', 
        background: '#0a141f', 
        color: '#e9edef', 
        minHeight: '100vh' 
      }}>
        <h1 style={{ color: '#00a884', marginBottom: '20px' }}>
          🎉 UNIGOM Biométrie - Dashboard
        </h1>
        <div style={{
          background: '#202c33',
          padding: '30px',
          borderRadius: '12px',
          marginBottom: '20px'
        }}>
          <h2 style={{ color: '#e9edef', marginBottom: '15px' }}>
            Bienvenue dans le système !
          </h2>
          <p style={{ color: '#8696a0', marginBottom: '20px' }}>
            Le frontend WhatsApp-style fonctionne parfaitement ! 🚀
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            <div style={{ background: '#111b21', padding: '20px', borderRadius: '8px' }}>
              <h3 style={{ color: '#00a884', marginBottom: '10px' }}>👥 Employés</h3>
              <p style={{ color: '#8696a0' }}>Gestion complète du personnel</p>
            </div>
            <div style={{ background: '#111b21', padding: '20px', borderRadius: '8px' }}>
              <h3 style={{ color: '#00a884', marginBottom: '10px' }}>🔐 Pointages</h3>
              <p style={{ color: '#8696a0' }}>Suivi biométrique en temps réel</p>
            </div>
            <div style={{ background: '#111b21', padding: '20px', borderRadius: '8px' }}>
              <h3 style={{ color: '#00a884', marginBottom: '10px' }}>📊 Statistiques</h3>
              <p style={{ color: '#8696a0' }}>Dashboard avec analytics</p>
            </div>
          </div>
        </div>
        <button 
          onClick={() => setIsLoggedIn(false)}
          style={{
            background: '#00a884',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Se déconnecter
        </button>
      </div>
    )
  }

  return (
    <div style={{ 
      padding: '40px', 
      background: '#0a141f', 
      color: '#e9edef', 
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <div style={{
        background: '#202c33',
        padding: '40px',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h1 style={{ 
          color: '#00a884', 
          textAlign: 'center', 
          marginBottom: '30px',
          fontSize: '24px'
        }}>
          UNIGOM Biométrie
        </h1>
        
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#8696a0' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                background: '#111b21',
                border: '1px solid #3b4a52',
                borderRadius: '8px',
                color: '#e9edef',
                fontSize: '16px'
              }}
              placeholder="admin@unigom.edu"
              required
            />
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#8696a0' }}>
              Mot de passe
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 40px 12px 12px',
                  background: '#111b21',
                  border: '1px solid #3b4a52',
                  borderRadius: '8px',
                  color: '#e9edef',
                  fontSize: '16px'
                }}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#8696a0',
                  cursor: 'pointer'
                }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          
          <button
            type="submit"
            style={{
              width: '100%',
              background: '#00a884',
              color: 'white',
              border: 'none',
              padding: '14px',
              borderRadius: '8px',
              fontSize: '16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <LogIn size={20} />
            Se connecter
          </button>
        </form>
        
        <p style={{ 
          textAlign: 'center', 
          marginTop: '20px', 
          color: '#8696a0',
          fontSize: '14px'
        }}>
          Système de pointage biométrique<br/>
          Université de Goma
        </p>
      </div>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SimpleLoginPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
