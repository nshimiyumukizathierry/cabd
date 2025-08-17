import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Home, Search } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="text-6xl font-bold text-gray-300 mb-4">404</div>
          <CardTitle>Page Not Found</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">The page you're looking for doesn't exist or has been moved.</p>
          <div className="flex gap-2 justify-center">
            <Link href="/">
              <Button>
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Button>
            </Link>
            <Link href="/cars">
              <Button variant="outline">
                <Search className="h-4 w-4 mr-2" />
                Browse Cars
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
