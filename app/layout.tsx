"use client"

import React, { ReactNode } from 'react';
import Navbar from '@/components/ui/Navbar/Navbar';
import Footer from '@/components/ui/Footer/Footer';
import 'styles/main.css';
import 'styles/chrome-bug.css';
import { Request, Response } from 'express';
import { supabase, fetcher } from '@/lib/initSupabase';

import useSWR from 'swr'
import { Auth } from '@supabase/ui'
import { User } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'

export default function Layout({ children } : { children: ReactNode } ) {

  const meta = {
    title: 'HikeUK',
    description: 'Brought to you by Vercel and Supabase.',
    cardImage: '/og.png'
  };

  return (
    <html lang="en">
      <head>
      <title>{meta.title}</title>
        <meta name="robots" content="follow, index" />
        <link href="/favicon.ico" rel="shortcut icon" />
        <meta content={meta.description} name="description" />
        <meta
          property="og:url"
          content={`https://mapuk.vercel.app`}
        />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={meta.title} />
        <meta property="og:description" content={meta.description} />
        <meta property="og:title" content={meta.title} />
        <meta property="og:image" content={meta.cardImage} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@vercel" />
        <meta name="twitter:title" content={meta.title} />
        <meta name="twitter:description" content={meta.description} />
        <meta name="twitter:image" content={meta.cardImage} />
      </head>
      <body>

        <Auth.UserContextProvider supabaseClient={supabase}>
          <Navbar/>
            <main id="skip">
              {children}              
            </main>
          <Footer />
        </Auth.UserContextProvider>
        
      </body>
    </html>
  )
}
