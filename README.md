# HikeUK

HikeUK is a Next.js web app for planning Multi-Day Treks.

## Demo

https://hikeuk.vercel.app

## Features

* 🛰 Route with Satellite & OpenStreetMap views.
* 🗺 Create and share multi-day routes with snap-to-route mapping.
* ⛺️ Sleep well with comprehensive coverage of UK campsites, caves, and bothies.
* 🍗 Manage food and water by planning restocks at local supermarkets and pubs.

## Tech Stack

* HikeUK is a React application, written in Typescript, built with Next.js, and hosted on Vercel.
* The core map is provided by OpenLayers and routing is performed via the OpenRouteService API.
* Map features are sourced from OpenStreetMaps and stored in a database hosted on Supabase.
* Users interact via components extending Material ui components, styled with TailwindCSS.
* Supabase integration provides secure user accounts as well as storage for routes, features, and trips.
* All user mapping and accounts functionality is provided via a set of REST API endpoints.
