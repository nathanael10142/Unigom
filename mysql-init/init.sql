-- ========================================
-- INITIALISATION BASES DE DONNÉES UNIGOM
-- ========================================

-- Créer bases de données si elles n'existent pas
CREATE DATABASE IF NOT EXISTS rhunigom__database_production CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS rhunigom_presence CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Utiliser la base de données principale
USE rhunigom__database_production;

-- ========================================
-- UTILISATEURS DE BASE DE DONNÉES
-- ========================================

-- Utilisateur pour la base de production (employés)
CREATE USER IF NOT EXISTS 'rhunigom_sgad_unigom'@'%' IDENTIFIED BY 'ZgEjd47Qf3wRaDSStYeF7vG5eEVf5UjzIkX1nMbA3gTtkBMXKkoBCBwb2Z3euRYJPsC4SKJtk';

-- Utilisateur pour la base de présence (pointages)
CREATE USER IF NOT EXISTS 'rhunigom_presence_users'@'%' IDENTIFIED BY 'ZPIK698rV9ay5GsiZym';

-- Donner les permissions
GRANT ALL PRIVILEGES ON rhunigom__database_production.* TO 'rhunigom_sgad_unigom'@'%';
GRANT ALL PRIVILEGES ON rhunigom_presence.* TO 'rhunigom_presence_users'@'%';

-- ========================================
-- FLUSH ET APPLICATION
-- ========================================

FLUSH PRIVILEGES;

-- ========================================
-- TABLES DE BASE DE PRÉSENCE (seront créées par SQLAlchemy)
-- ========================================

-- La base rhunigom_presence sera utilisée par le backend
-- pour stocker les pointages, logs, et cache agents
-- Les tables seront créées automatiquement par SQLAlchemy

-- ========================================
-- VÉRIFICATION
-- ========================================

SELECT 'Initialisation UNIGOM terminée avec succès' as status;
