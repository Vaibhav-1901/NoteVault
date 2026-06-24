# CoWrite

A full-stack notes app with real-time collaboration. Write solo or share a session and edit together live.

→ [usecowrite.vercel.app](https://usecowrite.vercel.app)

---

Started as a basic CRUD notes app, then I added real-time collaboration on top using Socket.io. The interesting part was designing the session system,users can join via a session ID.Getting presence updates (who joined or left) and keeping every client in sync without stale states.

## Features

- Real-time collaborative editing: multiple people on the same note, live
- Session-based sharing using a generated session ID
- Presence indicators: see who's online and when someone joins or leaves
- Tag notes (work, personal, ideas) and filter from the sidebar
- Search that filters as you type
- Create, edit and delete notes
- Auto-save while typing
- Mobile-friendly sidebar drawer

## Tech Stack

**Frontend** : React, Vite, Tailwind CSS, Socket.io client  
**Backend** : Node.js, Express.js, Socket.io  
**Database** : MongoDB with Mongoose  
**Auth** : JWT (httpOnly cookies)  
**Deployment** : Vercel (frontend), Render (backend)

## Notes
Since the frontend and backend are hosted on different domains, the application relies on cross-site cookies for authentication. If login doesn't work, ensure your browser isn't blocking third-party cookies or cross-site cookies for this site.
First load might take ~30 seconds as render's free tier spins down after inactivity.

## Author

Vaibhav Singh