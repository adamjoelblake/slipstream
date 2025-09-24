// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
// Import the Supabase client for use in Deno Edge Functions
import { createClient } from "npm:@supabase/supabase-js@2.40.0"

// The main entry point for the Edge Function
Deno.serve(async (req) => {
    try {
        // Ensure the request method is GET, as this function is for reading tasks
        if (req.method !== 'GET') {
            return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
                headers: { "Content-Type": "application/json" },
                status: 405,
            });
        }

        // Extract the Authorization header (which should contain a JWT)
        const authorization = req.headers.get("Authorization")
        const token = authorization?.split(" ")[1] // Get the token part after 'Bearer '

        // If no token is provided, return an unauthorized error
        if (!token) {
            return new Response(JSON.stringify({ error: "No authorization token provided." }), {
                headers: { "Content-Type": "application/json" },
                status: 401,
            })
        }

        // Create a Supabase client configured for use within an Edge Function.
        // The JWT token from the client request is passed to ensure RLS is applied correctly.
        const supabase = createClient(
            // Ensure SUPABASE_URL is set in your Supabase project's Edge Function environment variables
            Deno.env.get("SUPABASE_URL") ?? "https://your-supabase-url.supabase.co", // Replace with actual URL if env var not set
            // Ensure SUPABASE_ANON_KEY is set in your Supabase project's Edge Function environment variables
            Deno.env.get("SUPABASE_ANON_KEY") ?? "YOUR_SUPABASE_ANON_KEY", // Replace with actual ANON KEY if env var not set
            { global: { headers: { Authorization: authorization! } } } // Pass the original Authorization header
        )

        // Verify the user's session using the provided JWT token.
        // Supabase Auth will internally validate the JWT and return the user object if valid.
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        // If authentication fails or no user is found, return an unauthorized error
        if (authError || !user) {
            console.error("Auth error:", authError?.message || "User not found")
            return new Response(JSON.stringify({ error: "Invalid or expired token." }), {
                headers: { "Content-Type": "application/json" },
                status: 401,
            })
        }

        // Fetch tasks from the 'tasks' table, filtered by the authenticated user's ID.
        // RLS policies on the 'tasks' table will further ensure only authorized rows are returned.
        const { data: tasks, error } = await supabase
            .from("tasks")
            .select("*") // Select all columns for the tasks
            .eq("user_id", user.id) // Crucial: Filter tasks to only include those belonging to the authenticated user

        // If there's a database error, log it and return a server error response
        if (error) {
            console.error("Supabase error fetching tasks:", error.message)
            return new Response(JSON.stringify({ error: error.message }), {
                headers: { "Content-Type": "application/json" },
                status: 500,
            })
        }

        // If successful, return the fetched tasks as a JSON array
        return new Response(
            JSON.stringify({ tasks }),
            { headers: { "Content-Type": "application/json" } },
        )
    } catch (error) {
        // Catch any unexpected errors during the function execution
        console.error("Error in get-tasks function:", error.message)
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { "Content-Type": "application/json" },
            status: 500,
        })
    }
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request with a valid JWT (from an authenticated user):

  curl -i --location --request GET 'http://127.0.0.1:54321/functions/v1/get-tasks' \
    --header 'Authorization: Bearer [YOUR_AUTH_TOKEN]'

*/