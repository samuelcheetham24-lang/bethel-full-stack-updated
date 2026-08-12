# Bethel Divine Mystery Church — Full-Stack Website

This is your website plus a backend server that manages its content —
sermons, events, ministries, gallery photos, leadership, prayer
requests, and online giving through Paystack. One command runs
everything.

## What's inside

```
backend/
  server.js          ← starts everything
  public/
    index.html         ← your website
    admin.html          ← private dashboard (prayer requests + giving)
    give-callback.html  ← page shown after someone gives online
  data/
    store.json           ← all your content, auto-created on first run
  uploads/                ← photos uploaded through the admin API land here
  routes/                   ← the API endpoints
  scripts/createAdmin.js    ← sets up your admin login
```

There is **no separate database to install** — everything is saved in
one plain file: `data/store.json`.

## 1. Install (one-time)

You need [Node.js](https://nodejs.org) installed (the LTS version).
Then, in this folder, run:

```
npm install
```

## 2. Set up your secret key (one-time)

Copy `.env.example` to a new file named `.env`, and replace the
`JWT_SECRET` value with any long random string.

## 3. Create your admin login (one-time)

```
npm run create-admin
```

Type a username and password — this is what you'll use to log in at
`/admin.html` to view prayer requests and giving records.

## 4. Turn on online giving with Paystack (optional, one-time)

Once set up, clicking "Give Now" sends the person to a secure
Paystack checkout page to actually pay, in cedis. When they return,
the site checks with Paystack directly to confirm the gift really
went through.

1. Go to **paystack.com** and create a business account
2. **Settings → API Keys & Webhooks**
3. Copy your **Test secret key** (starts with `sk_test_`) to try it
   safely first — no real money moves
4. Add it to your `.env`:
   ```
   PAYSTACK_SECRET_KEY=sk_test_your_actual_key_here
   ```
5. Once you're ready for real giving, swap it for your **Live** key
   (starts with `sk_live_`) after Paystack verifies your business —
   no other changes needed.

## 5. Run the site

```
npm start
```

Then open **http://localhost:3000** in your browser.

## Managing your content

Once the server is running, log in and manage content by calling the
API — the easiest way without writing code is a free tool like
**Postman** or **Insomnia**.

### Log in

```
POST http://localhost:3000/api/auth/login
Body (JSON): { "username": "...", "password": "..." }
```

Copy the `token` you get back — every change needs it, sent as a
header: `Authorization: Bearer <token>`.

### What you can manage

| What | Read (public) | Add / Edit / Delete (needs login) |
|---|---|---|
| Sermons | `GET /api/sermons` | `POST` / `PUT /api/sermons/:id` / `DELETE /api/sermons/:id` |
| Events | `GET /api/events` | `POST` / `PUT /api/events/:id` / `DELETE /api/events/:id` |
| Ministries | `GET /api/ministries` | `POST` / `PUT /api/ministries/:id` / `DELETE /api/ministries/:id` |
| Gallery photos | `GET /api/gallery` | `POST` (upload a photo) / `DELETE /api/gallery/:id` |
| Leadership | `GET /api/leadership` | `POST` / `PUT /api/leadership/:id` / `DELETE /api/leadership/:id` |
| Prayer requests | — (admin only) | `GET /api/prayer`, `PATCH /api/prayer/:id`, `DELETE /api/prayer/:id` |
| Giving records | — (admin only) | `GET /api/give` |

Photos (gallery, sermon thumbnails, leadership headshots) are sent as
a **form**, not plain JSON — with a file field named `photo` (or
`thumbnail` for sermons). Everything else is sent as plain JSON.

### The admin dashboard

Go to `http://localhost:3000/admin.html` and log in with your admin
username/password to see every prayer request and every gift that's
come in, in a simple visual list — no API tool needed for those two.

## Adding your real photos and videos later

Right now sermons, gallery, and leadership use placeholder graphics
since you don't have real photos/videos yet. Once you do, just send
them to me (or upload through the admin API) and I'll wire them in —
same as we did with the teacher photos on your Godba site.

## Putting this online

Right now this only runs on your own computer. To make it a real
public website — which you'll need in order to give Paystack (and
anyone else) a working link — it needs to be hosted somewhere like
Render, same as we discussed for Godba. Just say the word when you're
ready and I'll walk you through it.

## Something not working?

- **"command not found: npm"** → Node.js isn't installed yet.
- **Photos not showing** → make sure the `public` and `uploads`
  folders traveled along with the rest of the project.
- **"Invalid username or password"** on login → re-run
  `npm run create-admin` to reset it.
- **Giving doesn't redirect to Paystack** → check that
  `PAYSTACK_SECRET_KEY` is filled in in your `.env` file.
