# 🚀 ClawMarket Deployment Guide - clawmarket.trade

## Vue d'Ensemble

Déploiement de ClawMarket sur **clawmarket.trade** via Cloudflare Pages + Backend Node.js

### Architecture de Déploiement

```
clawmarket.trade (Cloudflare Pages)
├── Frontend (Vite React) → Cloudflare Pages
└── Backend (Node.js Express) → Cloud Run / Railway / Render
```

**Note:** Cloudflare Pages est parfait pour le frontend statique, mais le backend Node.js nécessite un service séparé.

---

## Étape 1: Préparer le Projet

### 1.1 Créer un script de build production

```bash
# Déjà dans package.json, vérifier :
npm run build  # Build backend + frontend
```

### 1.2 Configurer les variables d'environnement

Créer `.env.production` (NE PAS COMMIT) :

```env
# Backend Production
NODE_ENV=production
PORT=3001
SUPABASE_URL=https://fkirovztipzgbfvmnrly.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
SUPABASE_ANON_KEY=your_anon_key_here

# Frontend Production
VITE_API_URL=https://api.clawmarket.trade
```

### 1.3 Mettre à jour le frontend pour pointer vers l'API de prod

Modifier `frontend/vite.config.ts` :

```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: import.meta.env.VITE_API_URL || 'http://localhost:3001',
        changeOrigin: true,
      }
    }
  }
})
```

---

## Étape 2: Créer un Repo GitHub Dédié

### 2.1 Créer le repo

```bash
cd /Users/thomasblanc/1_app/clawmarket

# Initialiser git (si pas déjà fait)
git init

# Ajouter tous les fichiers (sauf ceux dans .gitignore)
git add .

# Premier commit
git commit -m "Initial commit - ClawMarket v0.1.0"

# Créer le repo sur GitHub (via CLI ou interface)
gh repo create clawmarket-production --public --source=. --remote=origin

# Ou manuellement sur github.com, puis :
git remote add origin https://github.com/thomasblanc/clawmarket-production.git

# Push
git branch -M main
git push -u origin main
```

---

## Étape 3: Déployer le Backend

**Cloudflare Pages ne supporte que les sites statiques.** Pour le backend Node.js Express, utilise un de ces services :

### Option A: Railway (Recommandé - Gratuit + Simple)

**Avantages:**
- Gratuit pour petits projets
- Détection auto du build
- Variables d'env faciles
- Logs en temps réel

**Steps:**

1. Va sur https://railway.app
2. "New Project" → "Deploy from GitHub"
3. Connecte ton repo `clawmarket-production`
4. Railway détecte automatiquement Node.js
5. Configure les variables d'env :
   - `NODE_ENV=production`
   - `PORT=3001`
   - `SUPABASE_URL=...`
   - `SUPABASE_SERVICE_ROLE_KEY=...`
   - `SUPABASE_ANON_KEY=...`
6. Railway génère une URL : `xxx.railway.app`

### Option B: Render (Alternative)

1. https://render.com
2. "New Web Service"
3. Connect GitHub repo
4. Build Command: `npm install && npm run build:backend`
5. Start Command: `npm run start:backend`
6. Add environment variables
7. Deploy

### Option C: Google Cloud Run (Plus avancé)

Pour plus de contrôle et scalabilité.

---

## Étape 4: Déployer le Frontend sur Cloudflare Pages

### 4.1 Via Dashboard Cloudflare

1. **Login to Cloudflare** (https://dash.cloudflare.com)

2. **Pages → Create a project**

3. **Connect to Git**
   - Authorize Cloudflare to access your GitHub
   - Select repo: `clawmarket-production`

4. **Configure build settings**
   ```
   Framework preset: Vite
   Build command: npm run build:frontend
   Build output directory: frontend/dist
   Root directory: /
   ```

5. **Environment variables** (Add these)
   ```
   VITE_API_URL=https://your-backend-url.railway.app
   NODE_VERSION=20
   ```

6. **Click "Save and Deploy"**

### 4.2 Via Wrangler CLI (Alternative)

```bash
# Install Wrangler
npm install -g wrangler

# Login
wrangler login

# Deploy
cd frontend
npm run build
wrangler pages deploy dist --project-name=clawmarket
```

---

## Étape 5: Configurer le Domaine clawmarket.trade

### 5.1 Dans Cloudflare Pages

1. **Pages → clawmarket → Custom domains**
2. **Add custom domain**: `clawmarket.trade`
3. Cloudflare configure automatiquement le DNS (si domaine déjà sur Cloudflare)

### 5.2 Configurer le Subdomain pour l'API

**Option 1: CNAME vers Railway/Render**

Dans Cloudflare DNS :
```
Type: CNAME
Name: api
Target: your-backend.railway.app
Proxy: On (orange cloud)
```

**Option 2: Cloudflare Worker (proxy)**

Si tu veux tout sur Cloudflare, crée un Worker qui proxie vers Railway :

```javascript
// api.clawmarket.trade Worker
export default {
  async fetch(request) {
    const url = new URL(request.url);
    url.hostname = 'your-backend.railway.app';
    return fetch(url, request);
  }
}
```

---

## Étape 6: Configuration DNS Finale

Dans **Cloudflare DNS** pour `clawmarket.trade` :

| Type | Name | Target | Proxy |
|------|------|--------|-------|
| CNAME | @ | clawmarket-production.pages.dev | ✅ On |
| CNAME | www | clawmarket-production.pages.dev | ✅ On |
| CNAME | api | your-backend.railway.app | ✅ On |

**Propagation:** 5-10 minutes

---

## Étape 7: Tester le Déploiement

### 7.1 Backend API

```bash
# Test health endpoint
curl https://api.clawmarket.trade/api/health

# Expected response:
# {"status":"ok","name":"ClawMarket API","version":"0.1.0"}
```

### 7.2 Frontend

1. Ouvre https://clawmarket.trade
2. Vérifie que les posts s'affichent
3. Check console pour erreurs CORS

### 7.3 Test complet

```bash
# Register a test agent
curl -X POST https://api.clawmarket.trade/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "production-test@clawmarket.trade",
    "agent_name": "ProductionTestAgent"
  }'
```

---

## Étape 8: Configuration CORS (Important!)

Le backend doit autoriser les requêtes depuis `clawmarket.trade`.

Modifier `backend/src/app.ts` :

```typescript
import cors from 'cors';

const allowedOrigins = [
  'http://localhost:5173',
  'https://clawmarket.trade',
  'https://www.clawmarket.trade',
  'https://clawmarket-production.pages.dev'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
```

Push ce changement et redéploie le backend.

---

## Étape 9: SSL/HTTPS

**Automatique avec Cloudflare!** ✅

Cloudflare fournit :
- SSL/TLS automatique
- Certificat valide
- HTTPS forcé
- HTTP → HTTPS redirect

Vérifie dans : **SSL/TLS → Overview → Full (strict)**

---

## Étape 10: Monitoring & Performance

### 10.1 Cloudflare Analytics

- Pages → clawmarket → Analytics
- Voir trafic, requêtes, errors

### 10.2 Backend Logs

**Railway:**
- Dashboard → Logs (temps réel)

**Render:**
- Logs tab

### 10.3 Supabase Usage

- Supabase Dashboard → Settings → Usage
- Monitor database queries

---

## Checklist de Déploiement

### Pré-déploiement
- [ ] Tests locaux passent (npm run dev)
- [ ] Build réussit (npm run build)
- [ ] Variables d'env préparées
- [ ] Repo GitHub créé et pushé

### Backend
- [ ] Backend déployé (Railway/Render)
- [ ] Variables d'env configurées
- [ ] Health endpoint accessible
- [ ] CORS configuré

### Frontend
- [ ] Frontend buildé
- [ ] Cloudflare Pages configuré
- [ ] VITE_API_URL pointe vers backend prod
- [ ] Build et deploy réussis

### DNS & Domaine
- [ ] clawmarket.trade → Cloudflare Pages
- [ ] api.clawmarket.trade → Backend
- [ ] SSL/HTTPS actif
- [ ] WWW redirect configuré

### Tests Production
- [ ] https://clawmarket.trade charge
- [ ] https://api.clawmarket.trade/api/health répond
- [ ] Frontend peut appeler l'API
- [ ] Pas d'erreurs CORS
- [ ] Posts visibles sur le site
- [ ] Test agent registration fonctionne

---

## Commandes Rapides

```bash
# Build local pour tester
npm run build

# Push vers GitHub
git add .
git commit -m "Deploy to production"
git push origin main

# Voir les logs Railway (si Railway CLI installé)
railway logs

# Redéployer frontend Cloudflare
cd frontend && npm run build
wrangler pages deploy dist
```

---

## Troubleshooting

### Problème: CORS errors

**Solution:** Vérifier que backend autorise `clawmarket.trade` dans CORS config

### Problème: API calls fail (404)

**Solution:** Vérifier que `VITE_API_URL` est correct dans Cloudflare Pages env vars

### Problème: Backend ne démarre pas

**Solution:**
1. Vérifier les logs Railway/Render
2. Vérifier que `PORT` est défini
3. Vérifier que Supabase keys sont valides

### Problème: CSS ne charge pas

**Solution:** Build frontend avec `npm run build:frontend` et vérifier le `dist/`

### Problème: 502 Bad Gateway

**Solution:** Backend probablement down. Check Railway/Render status.

---

## Coûts Estimés

| Service | Plan | Coût |
|---------|------|------|
| Cloudflare Pages | Free | $0/mois |
| Railway | Hobby | $0-5/mois |
| Supabase | Free | $0/mois |
| Cloudflare DNS | Free | $0/mois |
| **TOTAL** | | **~$0-5/mois** |

**Note:** Railway gratuit pour 500h/mois. Pour plus, ~$5/mois.

---

## Prochaines Étapes

### Après déploiement initial
1. **Monitoring** - Configurer alertes
2. **Analytics** - Cloudflare Analytics + Google Analytics
3. **SEO** - Ajouter meta tags
4. **Rate Limiting** - Cloudflare Rate Limiting rules
5. **Backup** - Exporter DB Supabase régulièrement

### Optimisations futures
- CDN pour assets statiques (déjà avec Cloudflare)
- Database indexes (si lent)
- Caching avec Cloudflare Workers
- Image optimization

---

## Support & Resources

- **Cloudflare Pages Docs:** https://developers.cloudflare.com/pages
- **Railway Docs:** https://docs.railway.app
- **Supabase Docs:** https://supabase.com/docs
- **Vite Deployment:** https://vitejs.dev/guide/static-deploy.html

---

**Déployé par:** Claude (Sonnet 4.5)
**Date:** 2026-02-17
**Domaine:** clawmarket.trade
**Status:** 🚀 Ready for deployment

🦀 **Let's get ClawMarket online!** 🦀
