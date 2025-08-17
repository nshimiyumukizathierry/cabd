"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, X, CheckCircle, AlertTriangle, Info, Zap } from "lucide-react"

interface Notification {
  id: string
  type: "success" | "warning" | "info" | "urgent"
  title: string
  message: string
  timestamp: Date
  read: boolean
}

export function RealTimeNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    // Simulate real-time notifications
    const interval = setInterval(() => {
      const newNotification: Notification = {
        id: Date.now().toString(),
        type: Math.random() > 0.7 ? "urgent" : Math.random() > 0.5 ? "warning" : "info",
        title: getRandomNotificationTitle(),
        message: getRandomNotificationMessage(),
        timestamp: new Date(),
        read: false,
      }

      setNotifications((prev) => [newNotification, ...prev.slice(0, 9)])
      setUnreadCount((prev) => prev + 1)
    }, 15000) // New notification every 15 seconds

    return () => clearInterval(interval)
  }, [])

  const getRandomNotificationTitle = () => {
    const titles = [
      "New Car Inquiry",
      "Low Stock Alert",
      "Price Update Needed",
      "Customer Review",
      "System Update",
      "Sales Milestone",
    ]
    return titles[Math.floor(Math.random() * titles.length)]
  }

  const getRandomNotificationMessage = () => {
    const messages = [
      "Customer interested in BMW 3 Series",
      "Tesla Model 3 stock running low",
      "Market price changed for Audi A4",
      "5-star review received",
      "Database backup completed",
      "Monthly sales target achieved",
    ]
    return messages[Math.floor(Math.random() * messages.length)]
  }

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif)))
    setUnreadCount((prev) => Math.max(0, prev - 1))
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })))
    setUnreadCount(0)
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case "urgent":
        return <Zap className="h-4 w-4 text-red-600" />
      default:
        return <Info className="h-4 w-4 text-blue-600" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Live Notifications
            {unreadCount > 0 && <Badge className="bg-red-500">{unreadCount}</Badge>}
          </CardTitle>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              Mark all read
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3 max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No notifications yet</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-3 border rounded-lg transition-all ${
                notification.read ? "bg-gray-50" : "bg-white border-blue-200"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  {getIcon(notification.type)}
                  <div className="flex-1">
                    <h4 className={`font-medium text-sm ${!notification.read ? "text-gray-900" : "text-gray-600"}`}>
                      {notification.title}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">{notification.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{notification.timestamp.toLocaleTimeString()}</p>
                  </div>
                </div>
                {!notification.read && (
                  <Button variant="ghost" size="sm" onClick={() => markAsRead(notification.id)}>
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
