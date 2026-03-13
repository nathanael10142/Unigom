import React, { useState, useEffect } from 'react'
import { Settings, Bell, Shield, Database, Wifi, Save } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { useUIStore } from '../stores/uiStore'
import { useAuthStore } from '../stores/authStore'

interface SystemSettings {
  language: string
  timezone: string
  dateFormat: string
  sessionTimeout: number
  realTimeNotifications: boolean
  emailNotifications: boolean
  soundNotifications: boolean
  maxLoginAttempts: number
  databaseType: string
  biometricDevice: string
  deviceIp: string
}

export const SettingsPage: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<SystemSettings>({
    language: 'Français',
    timezone: 'Africa/Lubumbashi',
    dateFormat: 'DD/MM/YYYY',
    sessionTimeout: 24,
    realTimeNotifications: true,
    emailNotifications: false,
    soundNotifications: true,
    maxLoginAttempts: 5,
    databaseType: 'MySQL',
    biometricDevice: 'Hikvision',
    deviceIp: '192.168.1.100'
  })
  const { addNotification } = useUIStore()
  const { admin, logout } = useAuthStore()

  const handleSettingChange = (key: keyof SystemSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const saveSettings = async () => {
    setSaving(true)
    try {
      addNotification({
        type: 'success',
        title: 'Succès',
        message: 'Paramètres sauvegardés avec succès',
        read: false,
      })
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de sauvegarder les paramètres',
        read: false,
      })
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => {
    logout()
    window.location.href = '/login'
  }

  useEffect(() => {
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="flex-1 bg-chat flex items-center justify-center">
        <div className="loading-dots">
          <div className="loading-dot"></div>
          <div className="loading-dot"></div>
          <div className="loading-dot"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 bg-chat">
      <div className="p-6 space-y-6">
        {/* Actions Header */}
        <div className="flex justify-end mb-4">
          <Button
            icon={<Save size={16} />}
            onClick={saveSettings}
            loading={saving}
          >
            Sauvegarder
          </Button>
        </div>
        {/* User Info Card */}
        <div className="card-whatsapp p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="avatar avatar-lg bg-primary text-white text-xl">
              {admin?.username?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="flex-1">
              <h2 className="text-text-primary text-xl font-semibold">
                {admin?.username || 'Administrateur'}
              </h2>
              <p className="text-text-secondary">Administrateur Système</p>
              <p className="text-text-muted text-sm">
                Dernière connexion: {admin?.last_login ? new Date(admin.last_login).toLocaleString('fr-FR') : 'Jamais'}
              </p>
            </div>
            <Button
              variant="danger"
              onClick={handleLogout}
            >
              Se déconnecter
            </Button>
          </div>
        </div>

        {/* Preferences */}
        <div className="card-whatsapp p-6">
          <div className="flex items-center gap-3 mb-4">
            <Settings className="w-5 h-5 text-primary" />
            <h3 className="text-text-primary font-semibold text-lg">
              Préférences
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-text-secondary text-sm mb-1">Langue</label>
              <select
                className="input-whatsapp w-full"
                value={settings.language}
                onChange={(e) => handleSettingChange('language', e.target.value)}
              >
                <option value="Français">Français</option>
                <option value="English">English</option>
                <option value="Português">Português</option>
              </select>
            </div>
            
            <div>
              <label className="block text-text-secondary text-sm mb-1">Fuseau horaire</label>
              <select
                className="input-whatsapp w-full"
                value={settings.timezone}
                onChange={(e) => handleSettingChange('timezone', e.target.value)}
              >
                <option value="Africa/Lubumbashi">Africa/Lubumbashi (UTC+2)</option>
                <option value="Europe/Paris">Europe/Paris (UTC+1)</option>
                <option value="America/New_York">America/New_York (UTC-5)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-text-secondary text-sm mb-1">Format de date</label>
              <select
                className="input-whatsapp w-full"
                value={settings.dateFormat}
                onChange={(e) => handleSettingChange('dateFormat', e.target.value)}
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
            
            <div>
              <label className="block text-text-secondary text-sm mb-1">Durée de session (heures)</label>
              <input
                type="number"
                className="input-whatsapp w-full"
                value={settings.sessionTimeout}
                onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                min={1}
                max={168}
              />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="card-whatsapp p-6">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="w-5 h-5 text-primary" />
            <h3 className="text-text-primary font-semibold text-lg">
              Notifications
            </h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-text-primary font-medium">Notifications temps réel</h4>
                <p className="text-text-secondary text-sm">Recevoir les pointages en temps réel</p>
              </div>
              <input
                type="checkbox"
                checked={settings.realTimeNotifications}
                onChange={(e) => handleSettingChange('realTimeNotifications', e.target.checked)}
                className="rounded border-border"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-text-primary font-medium">Notifications email</h4>
                <p className="text-text-secondary text-sm">Recevoir les rapports par email</p>
              </div>
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                className="rounded border-border"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-text-primary font-medium">Son des notifications</h4>
                <p className="text-text-secondary text-sm">Jouer un son lors des notifications</p>
              </div>
              <input
                type="checkbox"
                checked={settings.soundNotifications}
                onChange={(e) => handleSettingChange('soundNotifications', e.target.checked)}
                className="rounded border-border"
              />
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="card-whatsapp p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-5 h-5 text-primary" />
            <h3 className="text-text-primary font-semibold text-lg">
              Sécurité
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-text-secondary text-sm mb-1">Tentatives de connexion max</label>
              <input
                type="number"
                className="input-whatsapp w-full"
                value={settings.maxLoginAttempts}
                onChange={(e) => handleSettingChange('maxLoginAttempts', parseInt(e.target.value))}
                min={3}
                max={10}
              />
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-hover-bg rounded-lg">
            <p className="text-text-secondary text-sm">
              Session active: {admin?.username || 'Administrateur'}
            </p>
            <p className="text-text-secondary text-sm">
              Token JWT: 24 heures
            </p>
          </div>
        </div>

        {/* System Configuration */}
        <div className="card-whatsapp p-6">
          <div className="flex items-center gap-3 mb-4">
            <Database className="w-5 h-5 text-primary" />
            <h3 className="text-text-primary font-semibold text-lg">
              Configuration Système
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-text-secondary text-sm mb-1">Base de données</label>
              <select
                className="input-whatsapp w-full"
                value={settings.databaseType}
                onChange={(e) => handleSettingChange('databaseType', e.target.value)}
              >
                <option value="MySQL">MySQL</option>
                <option value="PostgreSQL">PostgreSQL</option>
                <option value="SQLite">SQLite</option>
              </select>
            </div>
            
            <div>
              <label className="block text-text-secondary text-sm mb-1">Terminal biométrique</label>
              <select
                className="input-whatsapp w-full"
                value={settings.biometricDevice}
                onChange={(e) => handleSettingChange('biometricDevice', e.target.value)}
              >
                <option value="Hikvision">Hikvision</option>
                <option value="ZKTeco">ZKTeco</option>
                <option value="Suprema">Suprema</option>
              </select>
            </div>
            
            <div>
              <label className="block text-text-secondary text-sm mb-1">IP du terminal</label>
              <input
                type="text"
                className="input-whatsapp w-full"
                value={settings.deviceIp}
                onChange={(e) => handleSettingChange('deviceIp', e.target.value)}
                placeholder="192.168.1.100"
              />
            </div>
          </div>
        </div>

        {/* System Info */}
        <div className="card-whatsapp p-6">
          <div className="flex items-center gap-3 mb-4">
            <Wifi className="w-5 h-5 text-primary" />
            <h3 className="text-text-primary font-semibold text-lg">
              Informations Système
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-3 bg-hover-bg rounded-lg">
              <h4 className="text-text-primary font-medium mb-1">CPU</h4>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-border rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: '25%' }}
                  />
                </div>
                <span className="text-text-secondary text-sm">25%</span>
              </div>
            </div>
            
            <div className="p-3 bg-hover-bg rounded-lg">
              <h4 className="text-text-primary font-medium mb-1">Mémoire</h4>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-border rounded-full h-2">
                  <div 
                    className="bg-warning h-2 rounded-full transition-all duration-300"
                    style={{ width: '60%' }}
                  />
                </div>
                <span className="text-text-secondary text-sm">60%</span>
              </div>
            </div>
            
            <div className="p-3 bg-hover-bg rounded-lg">
              <h4 className="text-text-primary font-medium mb-1">Disque</h4>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-border rounded-full h-2">
                  <div 
                    className="bg-info h-2 rounded-full transition-all duration-300"
                    style={{ width: '45%' }}
                  />
                </div>
                <span className="text-text-secondary text-sm">45%</span>
              </div>
            </div>
            
            <div className="p-3 bg-hover-bg rounded-lg">
              <h4 className="text-text-primary font-medium mb-1">Uptime</h4>
              <p className="text-text-secondary text-sm">2 jours, 14 heures</p>
            </div>
            
            <div className="p-3 bg-hover-bg rounded-lg">
              <h4 className="text-text-primary font-medium mb-1">Connexions actives</h4>
              <p className="text-text-secondary text-sm">12</p>
            </div>
            
            <div className="p-3 bg-hover-bg rounded-lg">
              <h4 className="text-text-primary font-medium mb-1">Scans aujourd'hui</h4>
              <p className="text-text-secondary text-sm">156</p>
            </div>
            
            <div className="p-3 bg-hover-bg rounded-lg">
              <h4 className="text-text-primary font-medium mb-1">Total scans</h4>
              <p className="text-text-secondary text-sm">2847</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
