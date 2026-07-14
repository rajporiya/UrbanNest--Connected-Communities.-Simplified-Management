import { Resend } from "resend"

import ApiError from "../utils/ApiError.js"

const resendApiKey = process.env.RESEND_API_KEY
const emailFrom = process.env.EMAIL_FROM
const resendClient = resendApiKey ? new Resend(resendApiKey) : null

function buildResetPasswordEmailTemplate({ firstName, resetUrl, expiresInMinutes }) {
  const displayName = firstName || "Member"

  return `
    <div style="margin:0;padding:0;background-color:#f5f7fb;font-family:Arial,Helvetica,sans-serif;">
      <div style="max-width:640px;margin:0 auto;padding:24px;">
        <div style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 10px 30px rgba(15,23,42,0.08);">
          <div style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%);padding:28px 32px;text-align:center;">
            <div style="width:56px;height:56px;border-radius:16px;background:#ffffff;color:#0f172a;display:inline-flex;align-items:center;justify-content:center;font-size:22px;font-weight:700;letter-spacing:0.08em;">
              SN
            </div>
            <h1 style="margin:18px 0 0;color:#ffffff;font-size:24px;line-height:32px;">Society Management System</h1>
          </div>

          <div style="padding:32px;">
            <p style="margin:0 0 16px;font-size:16px;line-height:28px;color:#0f172a;">Hi ${displayName},</p>
            <p style="margin:0 0 24px;font-size:15px;line-height:26px;color:#334155;">
              We received a request to reset your password. Click the button below to continue with a secure password reset.
            </p>

            <div style="text-align:center;margin:32px 0;">
              <a href="${resetUrl}" style="display:inline-block;background:#0f172a;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:12px;font-size:15px;font-weight:700;">
                Reset Password
              </a>
            </div>

            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px 18px;margin-bottom:24px;">
              <p style="margin:0 0 8px;font-size:14px;line-height:24px;color:#0f172a;">
                This link will expire in <strong>${expiresInMinutes} minutes</strong>.
              </p>
              <p style="margin:0;font-size:13px;line-height:22px;color:#475569;word-break:break-all;">
                If the button does not work, copy and paste this URL into your browser:
                <br />
                <a href="${resetUrl}" style="color:#2563eb;">${resetUrl}</a>
              </p>
            </div>

            <p style="margin:0 0 12px;font-size:13px;line-height:22px;color:#ef4444;font-weight:700;">
              Security warning: If you did not request this password reset, you can safely ignore this email.
            </p>
            <p style="margin:0;font-size:13px;line-height:22px;color:#64748b;">
              For your security, do not share this link with anyone.
            </p>
          </div>

          <div style="padding:20px 32px 28px;border-top:1px solid #e2e8f0;text-align:center;">
            <p style="margin:0;font-size:12px;line-height:20px;color:#94a3b8;">
              This is an automated email from Society Management System.
            </p>
            <p style="margin:8px 0 0;font-size:12px;line-height:20px;color:#94a3b8;">
              © ${new Date().getFullYear()} Society Management System. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  `
}

export async function sendResetPasswordEmail({ to, firstName, resetUrl, expiresInMinutes = 15 }) {
  try {
    if (!resendClient) {
      throw new ApiError(500, "Email service is not configured.")
    }

    if (!emailFrom) {
      throw new ApiError(500, "Sender email is not configured.")
    }

    const html = buildResetPasswordEmailTemplate({ firstName, resetUrl, expiresInMinutes })

    return await resendClient.emails.send({
      from: emailFrom,
      to,
      subject: "Reset your Society Management System password",
      html,
      text: `Hi ${firstName || "Member"},\n\nReset your password using this link: ${resetUrl}\n\nThis link will expire in ${expiresInMinutes} minutes.\n\nIf you did not request this, ignore this email.`,
    })
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }

    throw new ApiError(500, error.message || "Failed to send reset password email.")
  }
}
