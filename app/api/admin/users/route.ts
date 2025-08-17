import { createClient } from "@supabase/supabase-js"
import { type NextRequest, NextResponse } from "next/server"

// Create admin client with service role key
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export async function GET(request: NextRequest) {
  try {
    console.log("Admin users API called")

    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")

    let query = supabaseAdmin.from("profiles").select("*").order("created_at", { ascending: false })

    if (email) {
      query = query.ilike("email", `%${email}%`)
    }

    const { data: users, error } = await query

    if (error) {
      console.error("Error fetching users:", error)
      return NextResponse.json({ error: "Failed to fetch users", details: error.message }, { status: 500 })
    }

    console.log(`Found ${users?.length || 0} users`)
    return NextResponse.json({ users: users || [] })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
