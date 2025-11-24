import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { serve } from "https://deno.land/std@0.177.0/http/server.ts"; // Note: Updated to a more recent version
import { corsHeaders } from "../_shared/cors.ts";

// --- Main Function Logic ---
serve(async (req: Request) => {
  // 1. Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 2. Safely get environment variables
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const RECAPTCHA_SECRET_KEY = Deno.env.get("RECAPTCHA_SECRET_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL"); // Use SUPABASE_URL standard
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"); // Use SUPABASE_SERVICE_ROLE_KEY standard

    if (!RESEND_API_KEY || !RECAPTCHA_SECRET_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error("Missing one or more required environment variables on the server.");
    }
    
    // Email Configuration
    const SEND_TO_EMAIL = "pageperclick@gmail.com";
    const SEND_FROM_EMAIL = "noreply@pageperclick.com";
    
    // 3. Extract and validate request body
    const { contactData, recaptchaToken } = await req.json();
    if (!contactData || !recaptchaToken || !contactData.email || !contactData.full_name) {
      return new Response(JSON.stringify({ error: "Missing required contact data or reCAPTCHA token." }), {
        status: 400, // Bad Request
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 4. Verify reCAPTCHA token
    const verificationResponse = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `secret=${RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`,
      }
    );
    const verificationData = await verificationResponse.json();

    if (!verificationData.success) {
      console.warn("reCAPTCHA verification failed:", verificationData["error-codes"]);
      return new Response(JSON.stringify({ error: "reCAPTCHA verification failed." }), {
        status: 401, // Unauthorized
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 5. Initialize Supabase Admin client
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 6. Check for duplicate entries
    const { data: existingContact, error: checkError } = await supabaseAdmin
      .from("contacts")
      .select("id")
      .or(`email.eq.${contactData.email},phone.eq.${contactData.phone}`)
      .limit(1);
    
    if (checkError) {
      // This is a server error, not a user error
      throw checkError;
    }

    if (existingContact && existingContact.length > 0) {
      // **CRITICAL FIX**: Return a 409 Conflict status instead of throwing an error
      return new Response(JSON.stringify({ error: "A contact with this email or phone already exists." }), {
        status: 409, // Conflict
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 7. Insert new contact data into the database
    const { error: insertError } = await supabaseAdmin.from("contacts").insert([contactData]);
    if (insertError) {
      // This is a server error
      throw insertError;
    }

    // 8. Send email notification using Resend (your logic is preserved here)
    // ... imports and initial setup

// Inside the serve(async (req: Request) => { ... }) block, after a successful insert:

// 8. Send email notification using Resend
// 8. Send email notification using Resend
    const emailHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Lead Notification</title>
      <style>
        /* Client-specific styles */
        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { -ms-interpolation-mode: bicubic; }

        /* Reset styles */
        body { margin: 0; padding: 0; height: 100% !important; width: 100% !important; background-color: #f4f4f4; }
        
        /* Responsive styles */
        @media screen and (max-width: 600px) {
          .content-table {
            width: 100% !important;
          }
        }
      </style>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f4f4;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td align="center" style="background-color: #f4f4f4;">
            <!--[if (gte mso 9)|(IE)]>
            <table align="center" border="0" cellspacing="0" cellpadding="0" width="600">
            <tr>
            <td align="center" valign="top" width="600">
            <![endif]-->
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;" class="content-table">
              <!-- HEADER -->
              <tr>
                <td align="center" valign="top" style="padding: 40px 20px 20px 20px; border-radius: 8px 8px 0 0; background-color: #ffffff;">
                  <h1 style="margin: 0; font-family: Arial, sans-serif; font-size: 28px; font-weight: bold; color: #1a1a1a;">
                    🚀 New Website Lead
                  </h1>
                </td>
              </tr>
              <!-- CONTENT -->
              <tr>
                <td align="left" style="padding: 20px 30px 40px 30px; background-color: #ffffff;">
                  <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    <!-- Intro Text -->
                    <tr>
                      <td style="padding-bottom: 20px; font-family: Arial, sans-serif; font-size: 16px; line-height: 24px; color: #555555;">
                        A new submission has been received through your website's contact form.
                      </td>
                    </tr>
                    
                    <!-- Lead Details Section -->
                    <tr>
                      <td style="padding-top: 20px; border-top: 1px solid #eeeeee;">
                        <table border="0" cellpadding="0" cellspacing="0" width="100%">
                          <tr>
                            <td style="padding: 10px 0; font-family: Arial, sans-serif; font-size: 16px; line-height: 24px; color: #555555; width: 150px; vertical-align: top;"><strong>Full Name:</strong></td>
                            <td style="padding: 10px 0; font-family: Arial, sans-serif; font-size: 16px; line-height: 24px; color: #1a1a1a;">${contactData.full_name}</td>
                          </tr>
                          <tr>
                            <td style="padding: 10px 0; font-family: Arial, sans-serif; font-size: 16px; line-height: 24px; color: #555555; width: 150px; vertical-align: top;"><strong>Email:</strong></td>
                            <td style="padding: 10px 0; font-family: Arial, sans-serif; font-size: 16px; line-height: 24px; color: #1a1a1a;"><a href="mailto:${contactData.email}" style="color: #007bff; text-decoration: none;">${contactData.email}</a></td>
                          </tr>
                          <tr>
                            <td style="padding: 10px 0; font-family: Arial, sans-serif; font-size: 16px; line-height: 24px; color: #555555; width: 150px; vertical-align: top;"><strong>Phone:</strong></td>
                            <td style="padding: 10px 0; font-family: Arial, sans-serif; font-size: 16px; line-height: 24px; color: #1a1a1a;">${contactData.phone || "Not Provided"}</td>
                          </tr>
                          <tr>
                            <td style="padding: 10px 0; font-family: Arial, sans-serif; font-size: 16px; line-height: 24px; color: #555555; width: 150px; vertical-align: top;"><strong>Company:</strong></td>
                            <td style="padding: 10px 0; font-family: Arial, sans-serif; font-size: 16px; line-height: 24px; color: #1a1a1a;">${contactData.company_name || "Not Provided"}</td>
                          </tr>
                          <tr>
                            <td style="padding: 10px 0; font-family: Arial, sans-serif; font-size: 16px; line-height: 24px; color: #555555; width: 150px; vertical-align: top;"><strong>Service:</strong></td>
                            <td style="padding: 10px 0; font-family: Arial, sans-serif; font-size: 16px; line-height: 24px; color: #1a1a1a;">${contactData.service}</td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <!-- Message Section -->
                    <tr>
                      <td align="left" style="padding-top: 20px; border-top: 1px solid #eeeeee;">
                        <p style="margin-top: 0; font-family: Arial, sans-serif; font-size: 16px; line-height: 24px; font-weight: bold; color: #1a1a1a;">Message:</p>
                        <div style="background-color: #f8f9fa; border-radius: 4px; padding: 15px; font-family: Arial, sans-serif; font-size: 16px; line-height: 24px; color: #333333; border: 1px solid #e6ebf1;">
                          ${contactData.message}
                        </div>
                      </td>
                    </tr>

                    <!-- Marketing Details Section -->
                    <tr>
                      <td align="left" style="padding-top: 20px; border-top: 1px solid #eeeeee;">
                        <p style="margin-top: 0; font-family: Arial, sans-serif; font-size: 16px; line-height: 24px; font-weight: bold; color: #1a1a1a;">Marketing & Analytics:</p>
                        <table border="0" cellpadding="0" cellspacing="0" width="100%">
                          <tr>
                            <td style="padding: 4px 0; font-family: Arial, sans-serif; font-size: 14px; color: #555555; width: 100px;">Source:</td>
                            <td style="padding: 4px 0; font-family: Arial, sans-serif; font-size: 14px; color: #1a1a1a;">${contactData.utm_source || "Direct"}</td>
                          </tr>
                          <tr>
                            <td style="padding: 4px 0; font-family: Arial, sans-serif; font-size: 14px; color: #555555; width: 100px;">Medium:</td>
                            <td style="padding: 4px 0; font-family: Arial, sans-serif; font-size: 14px; color: #1a1a1a;">${contactData.utm_medium || "None"}</td>
                          </tr>
                          <tr>
                            <td style="padding: 4px 0; font-family: Arial, sans-serif; font-size: 14px; color: #555555; width: 100px;">Campaign:</td>
                            <td style="padding: 4px 0; font-family: Arial, sans-serif; font-size: 14px; color: #1a1a1a;">${contactData.utm_campaign || "None"}</td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <!-- FOOTER -->
              <tr>
                <td align="center" style="padding: 20px 30px; background-color: #f4f4f4; border-radius: 0 0 8px 8px;">
                  <p style="margin: 0; font-family: Arial, sans-serif; font-size: 12px; line-height: 18px; color: #999999;">
                    This is an automated notification from your website.
                  </p>
                </td>
              </tr>
            </table>
            <!--[if (gte mso 9)|(IE)]>
            </td>
            </tr>
            </table>
            <![endif]-->
          </td>
        </tr>
      </table>
    </body>
    </html>
    `;

// ... rest of the fetch call to Resend and the final response

    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: SEND_FROM_EMAIL,
        to: SEND_TO_EMAIL,
        subject: `New Contact Form Lead: ${contactData.full_name}`,
        html: emailHtml,
      }),
    });

    if (!emailRes.ok) {
      console.error("Resend API Error:", await emailRes.text());
      // The submission was saved, so don't fail the whole request.
      // In a real app, you might add this to a retry queue.
    }

    // 9. Return a final success response
    return new Response(JSON.stringify({ message: "Submission successful!" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    // 10. Catch any unexpected server errors
    console.error("❌ Unhandled Function Error:", error.message);
    return new Response(JSON.stringify({ error: "An unexpected server error occurred." }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});