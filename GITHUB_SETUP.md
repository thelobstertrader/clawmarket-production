# 📦 Pusher ClawMarket sur GitHub

## Option 1: Script Automatique (Recommandé) 🚀

### Étape 1: Lance le script
```bash
./push-to-github.sh
```

Le script va :
- ✅ Initialiser git
- ✅ Configurer git avec ton username
- ✅ Créer le commit initial
- ✅ Configurer le remote GitHub

### Étape 2: Crée le repo sur GitHub

1. Va sur **https://github.com/new**
2. Remplis :
   ```
   Repository name: clawmarket-production
   Description: AI agent-to-agent commerce platform
   Public: ✅

   ⚠️ NE crée PAS:
   - README
   - .gitignore
   - license
   ```
3. Click **Create repository**

### Étape 3: Push

```bash
git push -u origin main
```

Si demandé, authentifie avec un **Personal Access Token** (voir plus bas).

---

## Option 2: Manuel (Si tu préfères) 📝

### Étape 1: Initialise git
```bash
cd /Users/thomasblanc/1_app/clawmarket

git init
git add .
git commit -m "Initial commit - ClawMarket v0.1.0"
git branch -M main
```

### Étape 2: Crée le repo sur GitHub
Même chose qu'Option 1, Étape 2.

### Étape 3: Connecte et push
```bash
# Remplace TON_USERNAME par ton username GitHub
git remote add origin https://github.com/TON_USERNAME/clawmarket-production.git
git push -u origin main
```

---

## 🔑 Créer un Personal Access Token (si demandé)

GitHub n'accepte plus les mots de passe pour git push. Tu dois créer un token :

### Étapes:
1. Va sur **https://github.com/settings/tokens/new**
2. Remplis :
   ```
   Note: clawmarket-push
   Expiration: 90 days (ou No expiration si tu veux)
   Scopes: ✓ repo (coche tout dans "repo")
   ```
3. Click **Generate token**
4. **COPIE LE TOKEN** (tu ne le reverras plus!)
5. Utilise-le comme password quand git le demande

### Sauvegarder le token (optionnel)
```bash
# Pour ne pas avoir à le retaper à chaque fois
git config --global credential.helper store
```

Après le premier push avec le token, git le sauvegarde.

---

## Option 3: Via GitHub CLI (Si installé) 🎯

### Installer GitHub CLI
```bash
brew install gh
```

### Authentifier
```bash
gh auth login
```

### Créer et push en une commande
```bash
cd /Users/thomasblanc/1_app/clawmarket

gh repo create clawmarket-production --public --source=. --remote=origin --push
```

**C'est tout !** Le repo est créé et pushé automatiquement.

---

## ✅ Vérifier que ça a marché

Après le push, vérifie :

```bash
# Voir le remote configuré
git remote -v

# Doit afficher:
# origin  https://github.com/TON_USERNAME/clawmarket-production.git (fetch)
# origin  https://github.com/TON_USERNAME/clawmarket-production.git (push)
```

Puis va sur **https://github.com/TON_USERNAME/clawmarket-production** dans ton navigateur.

Tu devrais voir tous tes fichiers ! 🎉

---

## 📊 Ce qui sera poussé

**Fichiers importants:**
- ✅ `backend/` - Code backend
- ✅ `frontend/` - Code frontend
- ✅ `docs/` - Documentation API
- ✅ Tous les fichiers de test
- ✅ Tous les guides de déploiement
- ✅ `package.json`, configs, etc.

**Fichiers EXCLUS** (via .gitignore):
- ❌ `node_modules/` (trop gros)
- ❌ `.env` (secrets)
- ❌ `test-agents-credentials.json` (API keys)
- ❌ `dist/`, `build/` (générés)

---

## 🚨 Troubleshooting

### Erreur: "remote origin already exists"
```bash
git remote remove origin
git remote add origin https://github.com/USERNAME/REPO.git
```

### Erreur: "Authentication failed"
→ Tu dois utiliser un **Personal Access Token**, pas ton mot de passe GitHub.

### Erreur: "Repository not found"
→ Le repo n'existe pas sur GitHub. Crée-le d'abord sur https://github.com/new

### Erreur: "Permission denied"
→ Vérifie ton username et que le repo t'appartient.

---

## 🔐 Sécurité

### ⚠️ Avant de pusher, vérifie que `.gitignore` contient :

```
.env
.env.local
.env.*.local
test-agents-credentials.json
node_modules/
```

Ces fichiers ne doivent JAMAIS être sur GitHub !

### ✅ Déjà configuré
Le `.gitignore` est déjà correct dans le projet. Tu es safe.

---

## 🎯 Après le Push

### Prochaine étape: Déploiement !

Une fois sur GitHub :

1. **Deploy Backend:**
   - Railway → Connect to GitHub → Auto-deploy

2. **Deploy Frontend:**
   - Cloudflare Pages → Connect to GitHub → Auto-deploy

3. **Configure Domain:**
   - `clawmarket.trade` → Cloudflare Pages
   - `api.clawmarket.trade` → Railway

**Lis:** `DEPLOY_QUICK_START.md` pour les étapes détaillées.

---

## 💡 Conseils

### Utilise des commits clairs
```bash
# Bon
git commit -m "Add user authentication"

# Mauvais
git commit -m "update"
```

### Pushe régulièrement
```bash
git add .
git commit -m "Update: description"
git push
```

### Protège la branche main
Sur GitHub → Settings → Branches → Add rule:
- Branch name: `main`
- ✓ Require pull request before merging

---

## 📞 Besoin d'Aide?

**Erreur de push?**
1. Check que le repo existe sur GitHub
2. Vérifie ton username
3. Utilise un Personal Access Token (pas password)

**Autres problèmes?**
- GitHub Docs: https://docs.github.com
- Git Tutorial: https://git-scm.com/docs/gittutorial

---

**Créé par:** Claude (Sonnet 4.5)
**Date:** 2026-02-17

🦀 **Ready to push ClawMarket to GitHub!** 🦀
