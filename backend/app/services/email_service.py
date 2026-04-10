"""
Email service for Monteeq platform.
Uses Python stdlib smtplib — no extra dependencies required.
"""
import smtplib
import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from app.core.config import (
    SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM, SMTP_FROM_NAME
)

logger = logging.getLogger(__name__)


def _build_verification_email(to_email: str, code: str) -> MIMEMultipart:
    """Build a branded HTML verification email."""
    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"{code} is your Monteeq verification code"
    msg["From"] = f"{SMTP_FROM_NAME} <{SMTP_FROM}>"
    msg["To"] = to_email

    plain_text = f"""
Welcome to Monteeq!

Your email verification code is: {code}

This code expires in 10 minutes. Do not share it with anyone.

If you did not create a Monteeq account, please ignore this email.

— The Monteeq Team
"""
    html = f"""
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Verify your Monteeq account</title>
</head>
<body style="margin:0;padding:0;background:#000000;font-family:'Inter','Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#000000;padding:60px 0;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table width="560" cellpadding="0" cellspacing="0"
               style="background:#0a0a0a;
                      border-radius:24px;
                      border:1px solid rgba(255,255,255,0.08);
                      box-shadow: 0 20px 50px rgba(0,0,0,0.8);
                      overflow:hidden;">

          <!-- Header Section -->
          <tr>
            <td style="padding:48px 48px 32px; text-align:center;">
               <div style="display:inline-block; margin-bottom:12px;">
                 <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/play-square.svg" width="48" height="48" alt="Logo" style="filter: invert(1); opacity: 0.9;" />
               </div>
               <h1 style="margin:0;font-family:'Outfit','Segoe UI',sans-serif;font-size:32px;font-weight:900;letter-spacing:4px;color:#FF3B30;">
                 MONTEEQ
               </h1>
               <div style="height:2px; width:40px; background:#FF3B30; margin:16px auto; opacity:0.6;"></div>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding:0 60px 44px;">
              <p style="margin:0 0 12px;font-family:'Outfit',sans-serif;font-size:26px;font-weight:800;color:#ffffff;text-align:center;">
                Confirm Your Email
              </p>
              <p style="margin:0 0 36px;font-size:16px;color:#8e8e93;line-height:1.6;text-align:center;">
                Enter the secret code below to unlock your <br/>
                <span style="color:#ffffff;">Monteeq Creator Experience</span>.
              </p>

              <!-- Verification Code Box -->
              <div style="background:rgba(255,59,48,0.04);
                          border:1px solid rgba(255,59,48,0.25);
                          border-radius:20px;
                          padding:40px 20px;
                          text-align:center;
                          margin-bottom:36px;
                          position:relative;
                          overflow:hidden;">
                <!-- Decorative Sheen -->
                <div style="position:absolute; top:0; left:0; right:0; height:1px; background:linear-gradient(90deg, transparent, rgba(255,59,48,0.3), transparent);"></div>
                
                <p style="margin:0 0 12px;font-size:12px;font-weight:700;letter-spacing:3px;
                           color:#FF3B30;text-transform:uppercase;opacity:0.8;">
                  Security Token
                </p>
                <p style="margin:0;font-family:'Courier New',monospace;font-size:54px;font-weight:900;letter-spacing:14px;
                           color:#ffffff; text-shadow: 0 0 20px rgba(255,59,48,0.3);">
                  {code}
                </p>
              </div>

              <div style="background:rgba(255,255,255,0.03); border-radius:12px; padding:16px; text-align:center;">
                <p style="margin:0;font-size:14px;color:#8e8e93;">
                  This code expires in <span style="color:#FF3B30;font-weight:700;">10 minutes</span>.
                </p>
              </div>

              <p style="margin:40px 0 0;font-size:13px;color:rgba(255,255,255,0.25);line-height:1.6;text-align:center;">
                If you didn't initiate this request, you can safely ignore this email.
                For your security, never share this code with anyone.
              </p>
            </td>
          </tr>

          <!-- Footer Section -->
          <tr>
            <td style="padding:32px 48px;
                       background:rgba(0,0,0,0.5);
                       border-top:1px solid rgba(255,255,255,0.05);
                       text-align:center;">
              <p style="margin:0 0 12px; font-size:11px; font-weight:700; color:rgba(255,255,255,0.15); letter-spacing:1px; text-transform:uppercase;">
                Monteeq · High-Performance Creator Ecosystem
              </p>
              <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.15);">
                © 2025 Monteeq Platform · Gombe, Nigeria
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""

    msg.attach(MIMEText(plain_text, "plain"))
    msg.attach(MIMEText(html, "html"))
    return msg


def send_verification_email(to_email: str, code: str) -> bool:
    """
    Send a verification code email.
    Returns True on success, False on failure (so callers can fall back to logging).
    """
    if not SMTP_HOST or not SMTP_USER or not SMTP_PASS:
        logger.warning(
            "SMTP not configured — skipping email send. "
            f"VERIFICATION CODE FOR {to_email}: {code}"
        )
        return False

    try:
        msg = _build_verification_email(to_email, code)

        with smtplib.SMTP(SMTP_HOST, int(SMTP_PORT)) as server:
            server.ehlo()
            server.starttls()
            server.login(SMTP_USER, SMTP_PASS)
            server.sendmail(SMTP_FROM, to_email, msg.as_string())

        logger.info(f"Verification email sent to {to_email}")
        return True

    except Exception as exc:
        logger.error(f"Failed to send verification email to {to_email}: {exc}")
        # Fallback: print to console so dev mode still works
        print(f"[EMAIL FALLBACK] VERIFICATION CODE FOR {to_email}: {code}")
        return False
