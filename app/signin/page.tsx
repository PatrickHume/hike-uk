"use client"

import Link from 'next/link'
import useSWR from 'swr'
import { Auth, Card, Typography, Space, Button, Icon } from '@supabase/ui'
import { supabase, fetcher } from '@/lib/initSupabase'
import React, { useEffect, useState } from 'react'
import { redirect } from 'next/navigation';

type ViewType =
  | 'sign_in'
  | 'sign_up'
  | 'forgotten_password'
  | 'magic_link'
  | 'update_password'

export default function SignIn() {
  const { user, session } = Auth.useUser()
  const { data, error } = useSWR(
    session ? ['/api/getUser', session.access_token] : null,
    fetcher
  )
  const [authView, setAuthView] = useState(('sign_in' as ViewType))

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'PASSWORD_RECOVERY') setAuthView('update_password')
        if (event === 'USER_UPDATED')
          setTimeout(() => setAuthView('sign_in'), 1000)
        // Send session to /api/auth route to set the auth cookie.
        // NOTE: this is only needed if you're doing SSR (getServerSideProps)!
        fetch('/api/auth', {
          method: 'POST',
          headers: new Headers({ 'Content-Type': 'application/json' }),
          credentials: 'same-origin',
          body: JSON.stringify({ event, session }),
        }).then((res) => {
          if(res.status !== 200){
            return undefined;
          }
          return res.json();
        })
      }
    )

    return () => {
      if(authListener !== null) authListener.unsubscribe();
    }
  }, [])

  if(user) redirect('/');

  const View = () => {
      return (
        <Space direction="vertical" size={8}>
          <div>
          <div className="text-black text-2xl font-semibold py-0">Welcome to <b>HIKEUK</b></div>
          </div>
          <Auth
            supabaseClient={supabase}
            providers={['google', 'github']}
            view={authView}
            socialLayout="horizontal"
            socialButtonSize="xlarge"
          />
        </Space>
      )
  }

  return (
    <div style={{ maxWidth: '420px', margin: '96px auto' }}>
      <Card>
        <View />
      </Card>
    </div>
  )
}
