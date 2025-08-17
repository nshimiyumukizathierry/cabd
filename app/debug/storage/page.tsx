"use client"

import { StorageDebug } from "@/components/debug/storage-debug"

export default function StorageDebugPage() {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Storage Debug</h1>
        <p className="text-gray-600">Comprehensive storage testing and debugging tools to diagnose upload issues.</p>
      </div>

      <StorageDebug />
    </div>
  )
}
