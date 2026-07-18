# Staybnb Interview Guide

## 1. Thirty-second project explanation

Staybnb is an Airbnb-inspired full-stack marketplace. The frontend uses Next.js with TypeScript and the App Router. The backend uses FastAPI and SQLAlchemy with SQLite. Guests can search and filter homes, save favorites, select dates, complete a mocked checkout, and view or cancel trips. Hosts can create, edit, and delete listings and review reservations. Bookings are persisted and the backend prevents date overlaps using an interval-overlap query.

## 2. Architecture

- **Frontend:** reusable React client components, route-based pages, a typed API client, role context, and toast context.
- **Backend:** route modules for users, listings, bookings, favorites, and host operations.
- **Database:** normalized relational schema with association tables and foreign keys.
- **Validation:** Pydantic request validation plus backend business-rule checks.
- **Seed data:** created once when the database is empty.

## 3. Booking overlap logic

Two date ranges overlap when:

`existing.check_in < requested.check_out AND existing.check_out > requested.check_in`

The API checks only confirmed bookings. If an overlap exists, it returns HTTP `409 Conflict`. Cancelled bookings no longer block dates.

## 4. Database relationships

- A user acting as a host owns many listings.
- A listing has many images, bookings, and reviews.
- Listings and amenities have a many-to-many relationship.
- Users and listings have a many-to-many favorite relationship represented by the `favorites` table.
- A booking belongs to one guest and one listing.

## 5. Why SQLite

SQLite satisfies the assignment, needs no separate server, supports relational constraints, and is easy to seed and demonstrate. For a large production system, PostgreSQL would be a natural replacement because SQLAlchemy isolates most persistence code from the specific database.

## 6. Why FastAPI

FastAPI provides typed request/response validation through Pydantic, automatic OpenAPI documentation, dependency injection for database sessions, and clear modular routing.

## 7. Why Next.js

Next.js provides file-system routing, layouts, optimized builds, strong TypeScript support, and straightforward Vercel deployment. The app uses the App Router and client components where interactivity is required.

## 8. Simplified authentication

The assignment permits mocked authentication. The role switcher maps to seeded demo users:

- Guest: user ID 1
- Host: user ID 2

In production, this would be replaced by a secure session/JWT flow, password hashing, authorization middleware, CSRF protection where relevant, and server-derived user IDs rather than client-supplied IDs.

## 9. Price calculation

- Nightly total = nightly rate × number of nights
- Service fee = 12% of nightly total
- Taxes = 8% of nightly total + cleaning fee + service fee
- Total = nightly total + cleaning fee + service fee + taxes

The backend is the source of truth and recalculates all values; it does not trust a total sent by the browser.

## 10. Improvements for production

- PostgreSQL and migrations with Alembic
- Proper authentication and authorization
- Object storage for uploads
- Real payment gateway and webhooks
- Background jobs and email notifications
- Redis caching and rate limiting
- Search indexing and geospatial queries
- Automated frontend end-to-end tests
- Observability, structured logging, and CI/CD
