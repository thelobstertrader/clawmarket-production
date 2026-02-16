#!/bin/bash

# Script pour pusher ClawMarket sur GitHub
# Usage: ./push-to-github.sh

set -e

echo "🦀 ClawMarket - Push vers GitHub"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Vérifier qu'on est dans le bon dossier
if [ ! -f "package.json" ]; then
    print_error "Ce script doit être exécuté depuis la racine du projet!"
    exit 1
fi

# Vérifier git
if ! command -v git &> /dev/null; then
    print_error "Git n'est pas installé!"
    echo "Installe-le avec: brew install git"
    exit 1
fi

print_success "Git est installé"

# Demander le username GitHub
echo ""
print_info "Configuration GitHub"
echo "-------------------"
echo ""
read -p "Ton username GitHub (ex: thomasblanc): " GITHUB_USERNAME

if [ -z "$GITHUB_USERNAME" ]; then
    print_error "Username requis!"
    exit 1
fi

# Demander le nom du repo
echo ""
read -p "Nom du repo (défaut: clawmarket-production): " REPO_NAME
REPO_NAME=${REPO_NAME:-clawmarket-production}

# Confirmer
echo ""
print_warning "Confirmation:"
echo "  Username: $GITHUB_USERNAME"
echo "  Repo: $REPO_NAME"
echo "  URL: https://github.com/$GITHUB_USERNAME/$REPO_NAME"
echo ""
read -p "Continuer? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_warning "Annulé"
    exit 0
fi

# Initialiser git si nécessaire
if [ ! -d ".git" ]; then
    print_info "Initialisation de git..."
    git init
    print_success "Git initialisé"
else
    print_warning "Git déjà initialisé"
fi

# Configurer git
print_info "Configuration de git..."
git config user.name "$GITHUB_USERNAME" || true
git config user.email "$GITHUB_USERNAME@users.noreply.github.com" || true
print_success "Git configuré"

# Créer .gitignore s'il n'existe pas déjà (normalement il existe)
if [ ! -f ".gitignore" ]; then
    print_warning ".gitignore n'existe pas, création..."
    cat > .gitignore << 'EOF'
# Dependencies
node_modules/

# Build outputs
dist/
build/

# Environment
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*

# TypeScript
*.tsbuildinfo

# Supabase
supabase/.temp/

# Test data (contains API keys)
test-agents-credentials.json
EOF
    print_success ".gitignore créé"
fi

# Ajouter tous les fichiers
print_info "Ajout des fichiers..."
git add .
print_success "Fichiers ajoutés"

# Commit
print_info "Création du commit initial..."
git commit -m "Initial commit - ClawMarket v0.1.0

- Full-stack agent-to-agent commerce platform
- Backend: Node.js + Express + TypeScript
- Frontend: Vite + React + Tailwind
- Database: Supabase (PostgreSQL)
- Features: Posts, comments, votes, deals, messaging, moderation
- Testing: 5 AI agents, automated test suite
- Deployment: Ready for Railway + Cloudflare Pages
- Domain: clawmarket.trade

🦀 Where agents do business. Humans welcome to profit."

print_success "Commit créé"

# Créer la branche main
git branch -M main
print_success "Branche main créée"

# Ajouter le remote
REMOTE_URL="https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"
print_info "Ajout du remote: $REMOTE_URL"

# Supprimer le remote s'il existe déjà
git remote remove origin 2>/dev/null || true

git remote add origin "$REMOTE_URL"
print_success "Remote ajouté"

# Afficher les instructions
echo ""
echo "================================"
print_success "Git configuré et prêt!"
echo "================================"
echo ""
print_warning "PROCHAINES ÉTAPES:"
echo ""
echo "1️⃣  Crée le repo sur GitHub:"
echo "   → Va sur https://github.com/new"
echo "   → Repository name: ${BLUE}$REPO_NAME${NC}"
echo "   → Description: AI agent-to-agent commerce platform"
echo "   → Public"
echo "   → ${RED}NE crée PAS de README/LICENSE/.gitignore${NC}"
echo ""
echo "2️⃣  Une fois le repo créé, lance:"
echo "   ${GREEN}git push -u origin main${NC}"
echo ""
echo "3️⃣  Si demandé, authentifie-toi avec:"
echo "   → Username: $GITHUB_USERNAME"
echo "   → Password: ${BLUE}Un Personal Access Token${NC} (pas ton mot de passe!)"
echo ""
print_info "Pour créer un Personal Access Token:"
echo "   1. https://github.com/settings/tokens/new"
echo "   2. Note: clawmarket-push"
echo "   3. Expiration: 90 days (ou plus)"
echo "   4. Scopes: ✓ repo (tous)"
echo "   5. Generate token → Copie-le!"
echo ""
echo "4️⃣  Ton repo sera à:"
echo "   ${BLUE}https://github.com/$GITHUB_USERNAME/$REPO_NAME${NC}"
echo ""
print_success "C'est prêt!"
echo ""

# Proposer de faire le push maintenant
read -p "Veux-tu que je tente le push maintenant? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    print_info "Tentative de push..."
    echo ""

    if git push -u origin main; then
        echo ""
        print_success "Push réussi!"
        echo ""
        print_success "Ton code est maintenant sur GitHub:"
        echo "   ${BLUE}https://github.com/$GITHUB_USERNAME/$REPO_NAME${NC}"
        echo ""
        print_info "Prochaine étape: Déploiement!"
        echo "   Lis: ${GREEN}DEPLOY_QUICK_START.md${NC}"
    else
        echo ""
        print_error "Push échoué!"
        echo ""
        print_warning "Causes possibles:"
        echo "   1. Le repo n'existe pas encore sur GitHub"
        echo "   2. Authentification requise"
        echo "   3. Pas les droits d'accès"
        echo ""
        print_info "Solution:"
        echo "   1. Crée le repo sur https://github.com/new"
        echo "   2. Puis: ${GREEN}git push -u origin main${NC}"
        echo ""
    fi
else
    echo ""
    print_warning "OK, tu pourras push plus tard avec:"
    echo "   ${GREEN}git push -u origin main${NC}"
    echo ""
fi

echo "🦀 Script terminé!"
