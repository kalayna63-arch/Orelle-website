# ORELLE — Handmade, made to last

ORELLE is a responsive e-commerce website for a handmade fashion brand. It lets customers browse the collection, filter products by category, search for items, build a cart, and place an order. The brand owner can sign in as admin and update product details directly from the site.

## About the Project

The site is built with plain HTML, CSS, and JavaScript, with no frontend framework. It works as a single-page experience: the home page, contact page, and policy pages are switched with JavaScript, so moving around the site never reloads the browser. The design focuses on the brand's handmade identity, with a clean layout that adapts to both mobile and desktop screens.

## Features

- **Product catalogue** with category filters and live search
- **Shopping cart** with quantity controls and a running total
- **Two-step checkout** that collects shipping details before the order is placed
- **WhatsApp ordering**, which sends the order summary straight to the brand
- **Razorpay integration** for online payments
- **Admin mode** using Firebase Authentication, where only the authorized admin account can edit product details
- **Policy pages** covering Contact, Shipping, Refund, and Privacy
- **Responsive design** that works across phones, tablets, and desktops

## Tech Stack

| Area | Technology |
|------|-----------|
| Structure | HTML5 |
| Styling | CSS3 with custom properties and responsive layouts |
| Logic | Vanilla JavaScript |
| Authentication | Firebase Authentication |
| Payments | Razorpay Checkout |

## Project Structure

```
├── index.html   # Page structure and content
├── style.css    # Styling and responsive layout
├── script.js    # Cart, checkout, admin, and product logic
└── README.md
```

## How It Works

- **Browsing:** Products are rendered by JavaScript from a product list, and the category and search controls re-render the grid as the visitor interacts with them.
- **Cart:** Items are added to a cart panel that tracks quantities and totals, then passes the order into checkout.
- **Checkout:** The visitor enters shipping details in two steps, then either sends the order through WhatsApp or pays online through Razorpay.
- **Admin:** After signing in with Firebase Authentication, the admin account sees edit controls on each product. Changes are saved and shown to customers when the page loads.

## What This Project Demonstrates

- Structuring a multi-page site with JavaScript page switching
- Building a cart and multi-step checkout flow from scratch
- Integrating third-party services (Firebase and Razorpay)
- Designing a responsive, brand-focused interface
