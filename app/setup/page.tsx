import { ConnectionTest } from "@/components/setup/connection-test"
import { StorageTest } from "@/components/setup/storage-test"
import { StorageDebug } from "@/components/setup/storage-debug"
import { SupabaseDebug } from "@/components/debug/supabase-debug"

export default function SetupPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">CarBD Setup & Debug</h1>
          <p className="text-gray-600">Verify your database connection and troubleshoot issues</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ConnectionTest />
          <StorageTest />
        </div>

        <StorageDebug />

        <SupabaseDebug />

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Image Loading Issues:</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
            <li>Check the "Storage Debug Information" above to see actual files in your bucket</li>
            <li>Verify that the image filenames in your database match the actual files</li>
            <li>Test individual image URLs by clicking the links in the debug section</li>
            <li>Update car records to use the correct filenames from your storage</li>
            <li>Ensure storage bucket policies allow public access</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
