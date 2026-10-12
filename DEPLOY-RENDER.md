# Deploying CEMS to Render with Aiven MySQL Cloud Database

This guide walks you through deploying your CEMS (College Event Management System) full-stack application to **Render** connected to your live **Aiven MySQL** cloud database.

---

## 1. Database Configuration (Aiven MySQL)

Your Aiven Cloud MySQL credentials have been integrated into `backend/src/main/resources/application.yml` and `render.yaml`:

- **Host:** `mysql-24427e6c-anurag-7a46.a.aivencloud.com`
- **Port:** `23643`
- **Database:** `defaultdb`
- **User:** `avnadmin`
- **Password:** `<YOUR_AIVEN_DB_PASSWORD>` (from your Aiven Console)
- **SSL Mode:** `REQUIRED`
- **JDBC URL:** `jdbc:mysql://mysql-24427e6c-anurag-7a46.a.aivencloud.com:23643/defaultdb?sslMode=REQUIRED`

---

## 2. Option A: One-Click Deploy via Render Blueprint (Recommended)

Render can automatically configure and deploy both the **Spring Boot backend** and the **React frontend** using the included [`render.yaml`](./render.yaml).

### Steps:
1. Log in to [dashboard.render.com](https://dashboard.render.com).
2. Click **New +** in the top right, then select **Blueprint**.
3. Connect your GitHub repository: `https://github.com/24eg105r05-svg/tt-project`.
4. Render will parse `render.yaml` and display two services to create:
   - **`cems-backend`** (Web Service, Docker)
   - **`cems-frontend`** (Static Site)
5. Click **Apply**.
6. Render will automatically build the backend Docker container, seed the database on Aiven, build the React frontend, and deploy both services!

---

## 3. Option B: Manual Deploy on Render Dashboard

If you prefer to configure each service manually in Render's dashboard:

### Step 1: Deploy Backend Web Service
1. In Render, click **New +** -> **Web Service**.
2. Select your repository `tt-project`.
3. Configure the service:
   - **Name:** `cems-backend`
   - **Language / Runtime:** `Docker`
   - **Root Directory:** leave blank (or `backend`)
   - **Dockerfile Path:** `./backend/Dockerfile`
   - **Docker Context:** `./backend`
   - **Instance Type:** `Free`
   - **Health Check Path:** `/actuator/health`
4. In **Environment Variables**, add:
   - `CEMS_DB_URL`: `jdbc:mysql://mysql-24427e6c-anurag-7a46.a.aivencloud.com:23643/defaultdb?sslMode=REQUIRED`
   - `CEMS_DB_USER`: `avnadmin`
   - `CEMS_DB_PASSWORD`: `<your Aiven password>`
   - `CEMS_JWT_SECRET`: *(Click 'Generate' or enter 32+ characters)*
   - `CEMS_CORS_ORIGINS`: `*`
   - `CEMS_SEED`: `true`
5. Click **Create Web Service**. Wait for the build and deployment to succeed. Note down your backend URL (e.g., `https://cems-backend-xxxx.onrender.com`).

---

### Step 2: Deploy Frontend Static Site
1. In Render, click **New +** -> **Static Site**.
2. Select your repository `tt-project`.
3. Configure the static site:
   - **Name:** `cems-frontend`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`
4. In **Environment Variables**, add:
   - `VITE_API_URL`: `https://cems-backend-xxxx.onrender.com/api` *(replace with your backend URL)*
   - `VITE_DEMO_MODE`: `true`
5. Under **Redirects/Rewrites**:
   - Add a rewrite rule:
     - **Type:** `Rewrite`
     - **Source:** `/*`
     - **Destination:** `/index.html`
6. Click **Create Static Site**.

---

## 4. Verification & Testing

Once both services are deployed:
1. **Health Check:** Visit `https://<your-backend>.onrender.com/actuator/health` -> should return `{"status":"UP"}`.
2. **Swagger API Docs:** Visit `https://<your-backend>.onrender.com/swagger-ui.html`.
3. **Frontend Application:** Open `https://<your-frontend>.onrender.com`.
4. **Demo Logins (password: `cems@123`):**
   - **Student:** `alex.rivera@college.edu`
   - **Organizer:** `s.connor@college.edu`
   - **Admin:** `m.vance@college.edu`
