# Mini Ecommerce (Next.js)

Mini ecommerce project built for learning purposes, focused on **architecture, global state management, and purchase flow**, rather than visual design or a real backend.

The goal of this project is to practice how a modern application is structured using **Next.js (App Router)**, **TypeScript**, and **React Context**, simulating a real ecommerce experience with fake data.

---

## Tech Stack

- **Next.js 14** (App Router)
- **React**
- **TypeScript**
- **Tailwind CSS**
- **Context API** (cart & state management)
- Fake product database (no backend)

---

## Features

- Product listing
- Product detail page
- Shopping cart
  - Add / remove products
  - Update quantities
  - Clear cart
- Fake checkout flow
- Global state using React Context
- Product image support

---

## Project Structure

src/
├─ app/
│ ├─ page.tsx # Home
│ ├─ products/ # Product list
│ ├─ product/[id]/ # Product detail
│ ├─ cart/ # Cart page
│ ├─ checkout/ # Fake checkout
│ └─ context/ # Global contexts
│
├─ components/
│ └─ ProductCard.tsx
│
├─ lib/
│ └─ products.ts # Fake product database
│
public/
└─ products/ # Product images

---

## Product Data

Products are fetched from a fake database file (`lib/products.ts`) that simulates a real data source:

- id
- title
- price
- description
- image

This approach allows building the full ecommerce logic without relying on a backend.

---

## Project Goals

- Learn **Next.js App Router**
- Understand **global state management without Redux**
- Practice **component-based architecture**
- Design real-world ecommerce flows
- Build a solid foundation for future backend integration

---

## Future Improvements

- Real backend (API / database)
- User authentication
- Cart persistence
- UI / UX improvements
- Real checkout & payments
- Testing

---

## Run Locally

```bash
npm install
npm run dev
Open in your browser:
http://localhost:3000
