"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Car, Heart, ShoppingCart, User, LogOut } from "lucide-react"
import { useAuth } from "@/components/providers/auth-provider"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const navigation = [
  { name: "Home", href: "/" },
  { name: "Browse Cars", href: "/cars" },
  { name: "About", href: "/about" },
]

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { user, loading, signOut } = useAuth()

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Car className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">CarBD</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                  pathname === item.href ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-700"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {!loading && (
              <>
                {user ? (
                  <>
                    <Link href="/favorites">
                      <Button variant="ghost" size="sm">
                        <Heart className="h-4 w-4 mr-2" />
                        Favorites
                      </Button>
                    </Link>
                    <Link href="/cart">
                      <Button variant="ghost" size="sm">
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Cart
                      </Button>
                    </Link>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.user_metadata?.avatar_url || "/placeholder.svg"} alt="Profile" />
                            <AvatarFallback>{user.email?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                          </Avatar>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                          <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">
                              {user.user_metadata?.full_name || "User"}
                            </p>
                            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                          </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href="/profile">
                            <User className="mr-2 h-4 w-4" />
                            <span>Profile</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleSignOut}>
                          <LogOut className="mr-2 h-4 w-4" />
                          <span>Log out</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                ) : (
                  <>
                    <Link href="/auth/login">
                      <Button variant="ghost" size="sm">
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/auth/register">
                      <Button size="sm">Sign Up</Button>
                    </Link>
                  </>
                )}
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col space-y-4 mt-4">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                        pathname === item.href ? "text-blue-600" : "text-gray-700"
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}

                  {!loading && (
                    <>
                      {user ? (
                        <>
                          <div className="border-t pt-4">
                            <div className="flex items-center space-x-3 mb-4">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={user.user_metadata?.avatar_url || "/placeholder.svg"} alt="Profile" />
                                <AvatarFallback>{user.email?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium">{user.user_metadata?.full_name || "User"}</p>
                                <p className="text-xs text-muted-foreground">{user.email}</p>
                              </div>
                            </div>
                          </div>
                          <Link href="/favorites" onClick={() => setIsOpen(false)}>
                            <Button variant="ghost" size="sm" className="w-full justify-start">
                              <Heart className="h-4 w-4 mr-2" />
                              Favorites
                            </Button>
                          </Link>
                          <Link href="/cart" onClick={() => setIsOpen(false)}>
                            <Button variant="ghost" size="sm" className="w-full justify-start">
                              <ShoppingCart className="h-4 w-4 mr-2" />
                              Cart
                            </Button>
                          </Link>
                          <Link href="/profile" onClick={() => setIsOpen(false)}>
                            <Button variant="ghost" size="sm" className="w-full justify-start">
                              <User className="h-4 w-4 mr-2" />
                              Profile
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start"
                            onClick={() => {
                              handleSignOut()
                              setIsOpen(false)
                            }}
                          >
                            <LogOut className="h-4 w-4 mr-2" />
                            Sign Out
                          </Button>
                        </>
                      ) : (
                        <>
                          <div className="border-t pt-4 space-y-2">
                            <Link href="/auth/login" onClick={() => setIsOpen(false)}>
                              <Button variant="ghost" size="sm" className="w-full">
                                Sign In
                              </Button>
                            </Link>
                            <Link href="/auth/register" onClick={() => setIsOpen(false)}>
                              <Button size="sm" className="w-full">
                                Sign Up
                              </Button>
                            </Link>
                          </div>
                        </>
                      )}
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}
