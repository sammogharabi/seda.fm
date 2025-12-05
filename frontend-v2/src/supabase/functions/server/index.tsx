import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Create Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
);

// Health check endpoint
app.get("/make-server-2cdc6b38/health", (c) => {
  return c.json({ status: "ok" });
});

// Email signup endpoint
app.post("/make-server-2cdc6b38/email-signup", async (c) => {
  try {
    const { email, source } = await c.req.json();
    
    if (!email) {
      return c.json({ error: "Email is required" }, 400);
    }

    // Create table if it doesn't exist
    const { error: createError } = await supabase.rpc('create_beta_waitlist_table');
    
    // Insert email into waitlist
    const { data, error } = await supabase
      .from('beta_waitlist')
      .insert([
        {
          email: email,
          created_at: new Date().toISOString(),
          source: source || 'api'
        }
      ])
      .select();

    if (error) {
      console.error('Database error:', error);
      return c.json({ error: "Failed to save email" }, 500);
    }

    return c.json({ success: true, data });
  } catch (error) {
    console.error('Server error:', error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Feedback submission endpoint
app.post("/make-server-2cdc6b38/feedback", async (c) => {
  try {
    const { userType, rating, comment, username, userId } = await c.req.json();
    
    if (!userType || rating === null || !comment) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    // Get Resend API key from environment
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    
    if (!resendApiKey) {
      console.error('Feedback submission error: RESEND_API_KEY environment variable not set');
      return c.json({ error: "Email service not configured" }, 500);
    }

    // Send email via Resend
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`
      },
      body: JSON.stringify({
        from: 'sedā.fm <feedback@seda.fm>',
        to: ['sam@seda.fm'],
        subject: `New Feedback from ${userType} - Rating: ${rating}/10`,
        html: `
          <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #0a0a0a; color: #fafafa; padding: 30px; border-radius: 12px; border: 1px solid #333;">
              <h1 style="color: #ff6b6b; margin-bottom: 20px;">New Feedback Submission</h1>
              
              <div style="background: #1a1a1a; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #333;">
                <h2 style="color: #fafafa; font-size: 16px; margin-bottom: 15px;">User Information</h2>
                <p style="margin: 8px 0; color: #a0a0a0;"><strong style="color: #fafafa;">Username:</strong> ${username || 'Anonymous'}</p>
                <p style="margin: 8px 0; color: #a0a0a0;"><strong style="color: #fafafa;">User ID:</strong> ${userId || 'N/A'}</p>
                <p style="margin: 8px 0; color: #a0a0a0;"><strong style="color: #fafafa;">User Type:</strong> ${userType.charAt(0).toUpperCase() + userType.slice(1)}</p>
                <p style="margin: 8px 0; color: #a0a0a0;"><strong style="color: #fafafa;">Rating:</strong> ${rating}/10</p>
              </div>
              
              <div style="background: #1a1a1a; padding: 20px; border-radius: 8px; border: 1px solid #333;">
                <h2 style="color: #fafafa; font-size: 16px; margin-bottom: 15px;">Feedback</h2>
                <p style="color: #fafafa; line-height: 1.6; white-space: pre-wrap;">${comment}</p>
              </div>
              
              <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #333;">
                <p style="color: #a0a0a0; font-size: 12px; margin: 0;">
                  Submitted: ${new Date().toLocaleString('en-US', { 
                    dateStyle: 'full', 
                    timeStyle: 'short' 
                  })}
                </p>
              </div>
            </div>
          </div>
        `
      })
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json();
      console.error('Resend API error while sending feedback email:', errorData);
      return c.json({ error: "Failed to send feedback email", details: errorData }, 500);
    }

    const emailData = await emailResponse.json();
    console.log('Feedback email sent successfully:', emailData);

    return c.json({ success: true, message: "Feedback sent successfully" });
  } catch (error) {
    console.error('Feedback submission error:', error);
    return c.json({ error: "Internal server error while processing feedback", details: error.message }, 500);
  }
});

Deno.serve(app.fetch);