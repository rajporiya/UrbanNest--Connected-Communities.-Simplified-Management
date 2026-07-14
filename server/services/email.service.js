import { Resend } from "resend"

import ApiError from "../utils/ApiError.js"

function getEmailClient() {
  const resendApiKey = process.env.RESEND_API_KEY

  if (!resendApiKey) {
    throw new ApiError(500, "Email service is not configured.")
  }

  return new Resend(resendApiKey)
}

function getEmailFrom() {
  const emailFrom = process.env.EMAIL_FROM

  if (!emailFrom) {
    throw new ApiError(500, "Sender email is not configured.")
  }

  return emailFrom
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
}

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
    const resendClient = getEmailClient()
    const emailFrom = getEmailFrom()

    const html = buildResetPasswordEmailTemplate({ firstName, resetUrl, expiresInMinutes })

    const result = await resendClient.emails.send({
      from: emailFrom,
      to,
      subject: "Reset your Society Management System password",
      html,
      text: `Hi ${firstName || "Member"},\n\nReset your password using this link: ${resetUrl}\n\nThis link will expire in ${expiresInMinutes} minutes.\n\nIf you did not request this, ignore this email.`,
    })

    if (result.error) {
      throw new ApiError(502, result.error.message || "Email provider rejected the request.")
    }

    return result.data
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }

    throw new ApiError(500, error.message || "Failed to send reset password email.")
  }
}

export function buildVerificationEmailTemplate({ firstName, verificationUrl, expiresInHours = 24 }) {
  const displayName = escapeHtml(firstName || "Member")
  const safeVerificationUrl = escapeHtml(verificationUrl)

  return `
    <div style="margin:0;padding:0;background:#f5f7fb;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
      <div style="max-width:640px;margin:0 auto;padding:24px;">
        <div style="overflow:hidden;border-radius:16px;background:#ffffff;box-shadow:0 10px 30px rgba(15,23,42,0.08);">
          <div style="padding:28px 32px;text-align:center;background:linear-gradient(135deg,#0f172a,#1e293b);">
            <div style="display:inline-flex;width:56px;height:56px;align-items:center;justify-content:center;border-radius:16px;background:#ffffff;color:#0f172a;font-size:22px;font-weight:700;letter-spacing:.08em;">UN</div>
            <h1 style="margin:18px 0 0;color:#ffffff;font-size:24px;line-height:32px;">UrbanNest</h1>
            <p style="margin:6px 0 0;color:#cbd5e1;font-size:13px;">Society Management System</p>
          </div>
          <div style="padding:32px;">
            <p style="margin:0 0 16px;font-size:16px;line-height:28px;">Hi ${displayName},</p>
            <p style="margin:0 0 24px;color:#334155;font-size:15px;line-height:26px;">Welcome to UrbanNest. Please verify your email address to finish setting up your society account.</p>
            <div style="margin:32px 0;text-align:center;">
              <a href="${safeVerificationUrl}" style="display:inline-block;border-radius:12px;background:#0f172a;padding:14px 28px;color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;">Verify Email</a>
            </div>
            <div style="margin-bottom:24px;border:1px solid #e2e8f0;border-radius:12px;background:#f8fafc;padding:16px 18px;">
              <p style="margin:0 0 8px;font-size:14px;line-height:24px;">This verification link expires in <strong>${expiresInHours} hours</strong>.</p>
              <p style="margin:0;color:#475569;font-size:13px;line-height:22px;word-break:break-all;">If the button does not work, copy and paste this URL into your browser:<br><a href="${safeVerificationUrl}" style="color:#2563eb;">${safeVerificationUrl}</a></p>
            </div>
            <p style="margin:0;color:#64748b;font-size:13px;line-height:22px;">If you did not create this account, you can safely ignore this email.</p>
          </div>
          <div style="border-top:1px solid #e2e8f0;padding:20px 32px 28px;text-align:center;color:#94a3b8;font-size:12px;line-height:20px;">
            <p style="margin:0;">This is an automated email from UrbanNest.</p>
            <p style="margin:8px 0 0;">&copy; ${new Date().getFullYear()} UrbanNest. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  `
}

export async function sendVerificationEmail({ to, firstName, verificationUrl, expiresInHours = 24 }) {
  try {
    const resendClient = getEmailClient()
    const emailFrom = getEmailFrom()
    const html = buildVerificationEmailTemplate({ firstName, verificationUrl, expiresInHours })

    const result = await resendClient.emails.send({
      from: emailFrom,
      to,
      subject: "Verify your UrbanNest email address",
      html,
      text: `Hi ${firstName || "Member"},\n\nVerify your email address using this link: ${verificationUrl}\n\nThis link expires in ${expiresInHours} hours.\n\nIf you did not create this account, ignore this email.`,
    })

    if (result.error) {
      throw new ApiError(502, result.error.message || "Email provider rejected the request.")
    }

    return result.data
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }

    throw new ApiError(500, error.message || "Failed to send verification email.")
  }
}
