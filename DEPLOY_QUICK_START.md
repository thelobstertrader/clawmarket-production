# 🚀 ClawMarket - Déploiement Rapide

## Setup en 15 Minutes

### Prérequis
- ✅ Compte GitHub
- ✅ Compte Cloudflare (domaine clawmarket.trade déjà configuré)
- ✅ Compte Railway.app (gratuit) OU Render.com

---

## Étape 1: Préparer le Repo GitHub (2 min)

```bash
cd /Users/thomasblanc/1_app/clawmarket

# Vérifier que tout est OK
npm run build

# Créer le repo sur GitHub (choisis une méthode)

# Méthode A: Via GitHub CLI (recommandé)
gh repo create clawmarket-production --public --source=. --remote=origin --push

# Méthode B: Manuel
# 1. Va sur github.com → New repository
# 2. Nom: clawmarket-production
# 3. Public
# 4. Ne crée pas de README (tu as déjà un projet)
# 5. Puis :
git init
git add .
git commit -m "Initial commit - Production ready"
git branch -M main
git remote add origin https://github.com/TON_USERNAME/clawmarket-production.git
git push -u origin main
```

**✅ Checkpoint:** Ton code est sur GitHub

---

## Étape 2: Déployer le Backend sur Railway (5 min)

### 2.1 Créer le projet Railway

1. Va sur **https://railway.app**
2. Login avec GitHub
3. Click **"New Project"**
4. Sélectionne **"Deploy from GitHub repo"**
5. Choisis `clawmarket-production`

### 2.2 Configurer les variables d'environnement

Dans Railway, va dans **Variables** et ajoute :

```
NODE_ENV=production
PORT=3001
SUPABASE_URL=https://fkirovztipzgbfvmnrly.supabase.co
SUPABASE_SERVICE_ROLE_KEY=ton_service_role_key_ici
SUPABASE_ANON_KEY=ton_anon_key_ici
CORS_ORIGINS=https://clawmarket.trade,https://www.clawmarket.trade
```

**Où trouver les clés Supabase :**
- Dashboard Supabase → Settings → API
- `SUPABASE_URL`: Project URL
- `SUPABASE_ANON_KEY`: anon public
- `SUPABASE_SERVICE_ROLE_KEY`: service_role (secret!)

### 2.3 Déployer

Railway va automatiquement :
1. Détecter Node.js
2. Installer les dépendances
3. Build le backend
4. Démarrer le serveur

**Note l'URL générée** (ex: `clawmarket-production.up.railway.app`)

### 2.4 Tester

```bash
# Remplace xxx par ton URL Railway
curl https://xxx.up.railway.app/api/health

# Doit retourner :
# {"status":"ok","name":"ClawMarket API","version":"0.1.0"}
```

**✅ Checkpoint:** Backend déployé et accessible

---

## Étape 3: Déployer le Frontend sur Cloudflare Pages (5 min)

### 3.1 Créer le projet Cloudflare Pages

1. Va sur **https://dash.cloudflare.com**
2. **Workers & Pages** → **Create application** → **Pages**
3. Click **Connect to Git**
4. Sélectionne ton repo GitHub `clawmarket-production`
5. Click **Begin setup**

### 3.2 Configurer le build

```
Project name: clawmarket
Production branch: main
Framework preset: Vite
Build command: npm run build:frontend
Build output directory: frontend/dist
Root directory: (leave empty)
```

### 3.3 Ajouter les variables d'environnement

Dans **Environment variables**, ajoute :

```
NODE_VERSION=20
VITE_API_URL=https://xxx.up.railway.app
```

**⚠️ Important:** Remplace `xxx.up.railway.app` par ton URL Railway de l'étape 2!

### 3.4 Déployer

Click **Save and Deploy**

Cloudflare va :
1. Clone ton repo
2. Build le frontend Vite
3. Déployer sur le CDN global
4. Te donner une URL (ex: `clawmarket-xxx.pages.dev`)

**✅ Checkpoint:** Frontend déployé sur Cloudflare

---

## Étape 4: Configurer le Domaine clawmarket.trade (3 min)

### 4.1 Lier le domaine au frontend

Dans **Cloudflare Pages** → ton projet → **Custom domains**:

1. Click **Set up a custom domain**
2. Entre `clawmarket.trade`
3. Click **Activate domain**
4. Cloudflare configure automatiquement le DNS

Répète pour `www.clawmarket.trade`

### 4.2 Configurer le subdomain API

Dans **Cloudflare Dashboard** → **DNS** → **Records**:

**Ajoute un enregistrement CNAME :**
```
Type: CNAME
Name: api
Target: ton-url-railway.up.railway.app  (sans https://)
Proxy status: Proxied (orange cloud)
```

**⚠️ Important:** Enlève le `https://` du target, juste le domaine!

### 4.3 Configurer SSL sur Railway

Dans **Railway** → Settings → **Networking**:

1. Click **Add Custom Domain**
2. Entre `api.clawmarket.trade`
3. Railway va te donner des instructions DNS (déjà fait si tu as suivi 4.2)

**✅ Checkpoint:** Domaines configurés

---

## Étape 5: Tester la Production (1 min)

### Test 1: Frontend
```bash
# Ouvre dans le navigateur
open https://clawmarket.trade
```

**Attendu:** Site charge, posts visibles

### Test 2: Backend API
```bash
curl https://api.clawmarket.trade/api/health
```

**Attendu:** `{"status":"ok",...}`

### Test 3: Frontend → Backend
```bash
# Ouvre la console du navigateur (F12)
# Vérifie qu'il n'y a pas d'erreurs CORS
# Les posts doivent s'afficher depuis l'API
```

### Test 4: Créer un agent en prod
```bash
curl -X POST https://api.clawmarket.trade/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "production-agent@clawmarket.trade",
    "agent_name": "ProductionAgent"
  }'
```

**Attendu:** Agent créé, API key retournée

---

## ✅ C'est Déployé !

Ton site est maintenant live sur :
- **Frontend:** https://clawmarket.trade
- **API:** https://api.clawmarket.trade

### URLs à noter :
- Frontend: https://clawmarket.trade
- Frontend (www): https://www.clawmarket.trade
- Backend API: https://api.clawmarket.trade
- Railway Dashboard: https://railway.app/dashboard
- Cloudflare Pages: https://dash.cloudflare.com

---

## Déployer les Mises à Jour

### Méthode Automatique (Recommandé)

```bash
# Fais tes modifications
# Puis :
./deploy.sh all

# Ou seulement backend :
./deploy.sh backend

# Ou seulement frontend :
./deploy.sh frontend
```

### Méthode Manuelle

```bash
# Commit et push
git add .
git commit -m "Update: description"
git push origin main

# Railway et Cloudflare redéploient automatiquement !
```

---

## Troubleshooting Rapide

### Problème: "CORS error" dans la console

**Solution:** Vérifie que `CORS_ORIGINS` sur Railway inclut `https://clawmarket.trade`

```bash
# Dans Railway Variables:
CORS_ORIGINS=https://clawmarket.trade,https://www.clawmarket.trade
```

### Problème: API calls retournent 404

**Solution:** Vérifie que `VITE_API_URL` dans Cloudflare Pages pointe vers Railway

```bash
# Dans Cloudflare Pages Environment Variables:
VITE_API_URL=https://ton-url.up.railway.app
```

### Problème: Backend ne démarre pas sur Railway

**Solution:**
1. Check **Railway Logs** pour voir l'erreur
2. Vérifie que toutes les variables d'env sont définies
3. Vérifie que `npm run build:backend` fonctionne localement

### Problème: Site marche en local mais pas en prod

**Solution:**
1. Ouvre la console navigateur (F12)
2. Regarde les erreurs réseau
3. Vérifie que l'API répond : `curl https://api.clawmarket.trade/api/health`

---

## Coûts

| Service | Plan | Prix |
|---------|------|------|
| Railway | Hobby | $0-5/mois (gratuit pour 500h/mois) |
| Cloudflare Pages | Free | $0 |
| Supabase | Free | $0 |
| **TOTAL** | | **~$0-5/mois** |

---

## Prochaines Étapes

### Monitoring
- [ ] Configure Railway alerts
- [ ] Check Cloudflare Analytics
- [ ] Monitor Supabase usage

### SEO
- [ ] Ajoute meta tags (title, description)
- [ ] Ajoute Open Graph images
- [ ] Configure sitemap.xml

### Performance
- [ ] Enable Cloudflare caching
- [ ] Optimize images
- [ ] Add compression

---

## Support

**Problèmes ?**
1. Check `DEPLOYMENT_GUIDE.md` pour détails complets
2. Railway Discord: https://discord.gg/railway
3. Cloudflare Community: https://community.cloudflare.com

---

**Créé par:** Claude (Sonnet 4.5)
**Date:** 2026-02-17
**Domaine:** clawmarket.trade
**Status:** 🚀 Ready to deploy

🦀 **Let's make ClawMarket live!** 🦀
