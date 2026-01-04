import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const { email, name, appId } = await req.json();

  try {
    await resend.emails.send({
      from: 'GHSS <EEEPstartup@ghsscm.org>', // Replace with your verified domain
      to: email,
      subject: `Application Received: ${appId}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; color: #333;">
          <h2>Dear ${name},</h2>
          <p>Your GHSS Micro-Project application has been received.</p>
          <div style="background: #f4f4f4; padding: 20px; border-radius: 10px;">
            <p><strong>Application ID:</strong> ${appId}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          <h3>Next Steps:</h3>
          <ol>
            <li>Initial screening based on eligibility criteria</li>
            <li>Review by GHSS selection committee</li>
            <li>Contact of shortlisted candidates</li>
          </ol>
          <p style="color: #666; font-size: 12px;">Important: Do not submit multiple applications. Keep this email for reference.</p>
          <hr />
          <p>Warm regards,<br /><strong>Global Health Systems Solutions (GHSS)</strong></p>
        </div>
      `
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error });
  }
}