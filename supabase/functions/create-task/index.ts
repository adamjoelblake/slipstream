// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "npm:@supabase/supabase-js@2.40.0"

Deno.serve(async (req) => {
    try {
        // Ensure the request method is POST for creating a task
        if (req.method !== 'POST') {
            return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
                headers: { "Content-Type": "application/json" },
                status: 405,
            });
        }

        // Extract Authorization header for user authentication
        const authorization = req.headers.get("Authorization")
        const token = authorization?.split(" ")[1]

        if (!token) {
            return new Response(JSON.stringify({ error: "No authorization token provided." }), {
                headers: { "Content-Type": "application/json" },
                status: 401,
            })
        }

        // Initialize Supabase client with the user's token
        const supabase = createClient(
            Deno.env.get("SUPABASE_URL") ?? "https://your-supabase-url.supabase.co",
            Deno.env.get("SUPABASE_ANON_KEY") ?? "YOUR_SUPABASE_ANON_KEY",
            { global: { headers: { Authorization: authorization! } } }
        )

        // Verify the user's session
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            console.error("Auth error:", authError?.message || "User not found")
            return new Response(JSON.stringify({ error: "Invalid or expired token." }), {
                headers: { "Content-Type": "application/json" },
                status: 401,
            })
        }

        // Parse the request body for task data
        const { title, description, status, due_date } = await req.json()

        // Basic validation
        if (!title) {
            return new Response(JSON.stringify({ error: "Title is required." }), {
                headers: { "Content-Type": "application/json" },
                status: 400,
            });
        }

        // Insert the new task into the 'tasks' table
        const { data: newTask, error } = await supabase
            .from("tasks")
            .insert({
                user_id: user.id, // Assign the task to the authenticated user
                title,
                description,
                status, // Will use 'Open' by default if not provided
                due_date,
            })
            .select() // Select the newly created task
            .single() // Expect a single object back

        if (error) {
            console.error("Supabase error creating task:", error.message)
            return new Response(JSON.stringify({ error: error.message }), {
                headers: { "Content-Type": "application/json" },
                status: 500,
            })
        }

        // Return the newly created task
        return new Response(
            JSON.stringify({ task: newTask }),
            { headers: { "Content-Type": "application/json" } },
        )
    } catch (error) {
        console.error("Error in create-task function:", error.message)
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { "Content-Type": "application/json" },
            status: 500,
        })
    }
})

/* To invoke locally:

  1. Run `supabase start`
  2. Make an HTTP request with a valid JWT and task data:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/create-task' \
    --header 'Authorization: Bearer [YOUR_AUTH_TOKEN]' \
    --header 'Content-Type: application/json' \
    --data '{
        "title": "Buy groceries",
        "description": "Milk, eggs, bread",
        "status": "Open",
        "due_date": "2025-10-01"
      }'

*/