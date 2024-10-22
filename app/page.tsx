'use client'
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/providers/AuthProvider';
import { Button } from '@/app/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle, DropdownMenu, DropdownMenuItem } from '@/app/components/ui/opus-components'

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) {
    return null; // リダイレクト中は何も表示しない
  }
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-4xl font-bold">Welcome to OPUS</h1>
      <Card>
        <CardHeader>
          <CardTitle>Sample Card</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This is a sample card using our custom components.</p>
          <Button className="mt-4">Click me</Button>
        </CardContent>
      </Card>
      <DropdownMenu trigger="Options">
        <DropdownMenuItem>Option 1</DropdownMenuItem>
        <DropdownMenuItem>Option 2</DropdownMenuItem>
      </DropdownMenu>
    </main>
  )
}