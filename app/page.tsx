'use client'

import { Button, Card, CardContent, CardHeader, CardTitle, DropdownMenu, DropdownMenuItem } from '@/components/ui/opus-components'

export default function Home() {
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