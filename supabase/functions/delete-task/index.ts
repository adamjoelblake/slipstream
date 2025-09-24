// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "npm:@supabase/supabase-js@2.40.0"

Deno.serve(async (req) => {
    try {
        // This function can accept POST or DELETE for deletion
        if (!['POST', 'DELETE'].includes(req.method)) {
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

        // Parse the request body for task_id
        const { task_id } = await req.json()

        // Basic validation
        if (!task_id) {
            return new Response(JSON.stringify({ error: "Task ID is required." }), {
                headers: { "Content-Type": "application/json" },
                status: 400,
            });
        }

        // Delete the task, ensuring it belongs to the authenticated user
        const { error, count } = await supabase
            .from("tasks")
            .delete()
            .eq("id", task_id)
            .eq("user_id", user.id) // Crucial: Ensure the user can only delete their own tasks
            .count('exact'); // Get the count of deleted rows

        if (error) {
            console.error("Supabase error deleting task:", error.message)
            return new Response(JSON.stringify({ error: error.message }), {
                headers: { "Content-Type": "application/json" },
                status: 500,
            })
        }

        if (count === 0) {
            return new Response(JSON.stringify({ message: "Task not found or not authorized to delete." }), {
                headers: { "Content-Type": "application/json" },
                status: 404,
            });
        }

        // Return a success message
        return new Response(
            JSON.stringify({ message: `Task with ID ${task_id} deleted successfully.` }),
            { headers: { "Content-Type": "application/json" } },
        )
    } catch (error) {
        console.error("Error in delete-task function:", error.message)
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { "Content-Type": "application/json" },
            status: 500,
        })
    }
})

/* To invoke locally:

  1. Run `supabase start`
  2. Make an HTTP request with a valid JWT and task_id:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/delete-task' \
    --header 'Authorization: Bearer [YOUR_AUTH_TOKEN]' \
    --header 'Content-Type: application/json' \
    --data '{ "task_id": "YOUR_TASK_UUID" }'

*/