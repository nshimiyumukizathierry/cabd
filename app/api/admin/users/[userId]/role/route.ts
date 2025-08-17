import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Create admin client with service role key
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export async function PUT(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const { userId } = params
    const { role } = await request.json()

    if (!role || !["user", "admin"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }

    console.log(`Updating user ${userId} role to ${role}`)

    const { error } = await supabaseAdmin
      .from("profiles")
      .update({
        role,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)

    if (error) {
      console.error("Error updating user role:", error)
      return NextResponse.json({ error: "Failed to update user role", details: error.message }, { status: 500 })
    }

    // Also update the auth.users metadata
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      app_metadata: { role },
    })

    if (authError) {
      console.error("Error updating auth metadata:", authError)
      // Don't fail the request if metadata update fails
    }

    console.log(`Successfully updated user ${userId} role to ${role}`)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
