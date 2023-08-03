"use client"

import Link from 'next/link'
import useSWR from 'swr'
import { Auth, Card, Typography, Space, Button, Icon } from '@supabase/ui'
import { supabase, fetcher } from '@/lib/initSupabase'
import React, { useEffect, useState } from 'react'
import { redirect } from 'next/navigation';

export default function Profile() {

  const { user, session } = Auth.useUser()
  const { data, error } = useSWR(
    session ? ['/api/getUser', session.access_token] : null,
    fetcher
  )

  return (
    <div style={{ maxWidth: '420px', margin: '96px auto' }}>
      <Card>
        <Space direction="vertical" size={6}>

          {user ? (
          <>
            <div className="text-black text-1xl font-semibold py-0">Hello, <i>{user.email}</i></div>
            {/* <Typography.Text strong>Email: {user.email}</Typography.Text>
            <Typography.Text type="success">
              User data retrieved
            </Typography.Text>

            <Typography.Text>
              <pre>{JSON.stringify(user, null, 2)}</pre>
            </Typography.Text> */}
          </>
          ) : (
          <>
          <div className="text-black text-1xl font-semibold py-0"><a href="/signin" className="underline">Sign in</a> to view your account.</div>
          </>
          )}

        </Space>
      </Card>
    </div>
  )
}