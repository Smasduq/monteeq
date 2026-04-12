import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core import config
import logging

logger = logging.getLogger(__name__)

HTML_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 12px; }}
        .header {{ text-align: center; padding-bottom: 20px; border-bottom: 1px solid #eee; }}
        .content {{ padding: 20px 0; }}
        .footer {{ text-align: center; font-size: 0.8rem; color: #999; padding-top: 20px; border-top: 1px solid #eee; }}
        .btn {{ display: inline-block; padding: 12px 24px; background-color: #ff3e3e; color: #fff; text-decoration: none; border-radius: 50px; font-weight: bold; }}
        .logo {{ font-size: 24px; font-weight: 800; color: #ff3e3e; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">MONTEEQ</div>
        </div>
        <div class="content">
            <h2>{title}</h2>
            <p>{message}</p>
            {action_html}
        </div>
        <div class="footer">
            &copy; 2026 Monteeq Platform. All rights reserved.
        </div>
    </div>
</body>
</html>
"""

def send_email(to_email: str, subject: str, title: str, message: str, action_text: str = None, action_url: str = None):
    if not config.SMTP_HOST or not config.SMTP_USER:
        logger.warning(f"Skipping email to {to_email} - SMTP not configured")
        return False

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"{config.SMTP_FROM_NAME} <{config.SMTP_FROM}>"
        msg["To"] = to_email

        action_html = ""
        if action_text and action_url:
            full_url = f"{config.BASE_URL}{action_url}" if action_url.startswith("/") else action_url
            action_html = f'<div style="text-align: center; margin-top: 30px;"><a href="{full_url}" class="btn">{action_text}</a></div>'

        html_content = HTML_TEMPLATE.format(
            title=title,
            message=message,
            action_html=action_html
        )

        msg.attach(MIMEText(message, "plain"))
        msg.attach(MIMEText(html_content, "html"))

        with smtplib.SMTP(config.SMTP_HOST, config.SMTP_PORT) as server:
            if config.SMTP_PORT == 587:
                server.starttls()
            server.login(config.SMTP_USER, config.SMTP_PASS)
            server.sendmail(config.SMTP_FROM, to_email, msg.as_string())
        
        return True
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {e}")
        return False
