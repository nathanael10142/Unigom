#!/usr/bin/env python3
"""
Script de test pour vérifier la configuration API du frontend
"""

import os
import requests

def test_frontend_api_config():
    """Vérifier la configuration API du frontend"""
    
    print("🔍 Configuration API du Frontend")
    print("=" * 40)
    
    # Lire les variables d'environnement
    api_url = os.getenv('VITE_API_URL', 'http://localhost:8000')
    ws_url = os.getenv('VITE_WS_URL', 'ws://localhost:8000')
    environment = os.getenv('VITE_ENVIRONMENT', 'development')
    
    print(f"📍 API URL : {api_url}")
    print(f"📍 WebSocket URL : {ws_url}")
    print(f"📍 Environment : {environment}")
    
    print("\n🧪 Tests de connexion...")
    
    # Test API
    try:
        response = requests.get(f"{api_url}/health", timeout=5)
        if response.status_code == 200:
            print("✅ API accessible")
            print(f"   Response: {response.json()}")
        else:
            print(f"❌ API erreur {response.status_code}")
            print(f"   Response: {response.text[:200]}...")
    except Exception as e:
        print(f"❌ API inaccessible: {e}")
    
    # Test endpoint employees
    try:
        response = requests.get(f"{api_url}/api/v1/employees", timeout=5)
        if response.status_code == 200:
            print("✅ Endpoint employees accessible")
        elif response.status_code == 401:
            print("✅ Endpoint employees répond (auth requise)")
        else:
            print(f"❌ Employees erreur {response.status_code}")
            print(f"   Response: {response.text[:200]}...")
    except Exception as e:
        print(f"❌ Employees inaccessible: {e}")
    
    print("\n🔧 Actions requises:")
    print("1. Démarrez le backend sur 95.216.18.174:8000")
    print("2. Vérifiez le firewall (port 8000)")
    print("3. Configurez NGINX reverse proxy si nécessaire")
    print("4. Redémarrez le frontend après correction")

if __name__ == "__main__":
    test_frontend_api_config()
