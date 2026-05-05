"""
Email sending via Gmail SMTP (Django built-in backend).
No third-party library needed.
"""
import logging
from django.core.mail import EmailMultiAlternatives
from django.conf import settings

logger = logging.getLogger(__name__)


def _send(to_email: str, subject: str, html: str) -> bool:
    try:
        msg = EmailMultiAlternatives(
            subject=subject,
            body=subject,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[to_email],
        )
        msg.attach_alternative(html, "text/html")
        msg.send()
        logger.info("Email sent → %s", to_email)
        return True
    except Exception as exc:
        logger.error("Email failed → %s: %s", to_email, exc)
        return False


def send_otp_email(user, otp_code: str) -> bool:
    subject = f"Your HRMS login code: {otp_code}"
    html = f"""
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;
                padding:32px;background:#f8fafc;border-radius:12px;">
      <div style="text-align:center;margin-bottom:24px;">
        <h1 style="color:#1e3a5f;font-size:22px;margin:0;">CBC Labs. Inc</h1>
        <p style="color:#64748b;font-size:13px;margin:4px 0 0;">HRMS Portal</p>
      </div>
      <div style="background:#fff;border-radius:10px;padding:28px;border:1px solid #e2e8f0;">
        <p style="color:#334155;font-size:15px;">Hi <strong>{user.full_name}</strong>,</p>
        <p style="color:#334155;font-size:14px;">Your login verification code is:</p>
        <div style="text-align:center;margin:24px 0;">
          <span style="font-size:42px;font-weight:900;letter-spacing:12px;
                       color:#1e3a5f;background:#eff6ff;padding:16px 28px;
                       border-radius:10px;display:inline-block;">{otp_code}</span>
        </div>
        <p style="color:#64748b;font-size:13px;text-align:center;">
          This code expires in <strong>10 minutes</strong>. Do not share it with anyone.
        </p>
      </div>
      <p style="color:#94a3b8;font-size:12px;text-align:center;margin-top:20px;">
        &copy; 2025 CBC Labs. Inc. All rights reserved.
      </p>
    </div>
    """
    return _send(user.email, subject, html)


def send_hr_approval_request(hr_user, admin_users: list) -> None:
    """Notify all admins that a new HR signed up and needs approval."""
    subject = f"[Action Required] New HR signup — {hr_user.full_name}"
    html = f"""
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;
                padding:32px;background:#f8fafc;border-radius:12px;">
      <div style="text-align:center;margin-bottom:24px;">
        <h1 style="color:#1e3a5f;font-size:22px;margin:0;">CBC Labs. Inc</h1>
        <p style="color:#64748b;font-size:13px;margin:4px 0 0;">HRMS Admin Notification</p>
      </div>
      <div style="background:#fff;border-radius:10px;padding:28px;border:1px solid #e2e8f0;">
        <p style="color:#334155;font-size:15px;">A new HR account is pending your approval:</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:14px;">
          <tr style="background:#f1f5f9;">
            <td style="padding:10px 14px;color:#64748b;font-weight:600;width:35%;">Name</td>
            <td style="padding:10px 14px;color:#1e293b;">{hr_user.full_name}</td>
          </tr>
          <tr>
            <td style="padding:10px 14px;color:#64748b;font-weight:600;">Email</td>
            <td style="padding:10px 14px;color:#1e293b;">{hr_user.email}</td>
          </tr>
          <tr style="background:#f1f5f9;">
            <td style="padding:10px 14px;color:#64748b;font-weight:600;">Signed up</td>
            <td style="padding:10px 14px;color:#1e293b;">
              {hr_user.date_joined.strftime('%B %d, %Y at %H:%M UTC')}
            </td>
          </tr>
        </table>
        <p style="color:#334155;font-size:14px;">
          Log in to the HRMS Admin Dashboard to approve or reject this request.
        </p>
      </div>
      <p style="color:#94a3b8;font-size:12px;text-align:center;margin-top:20px;">
        &copy; 2025 CBC Labs. Inc. All rights reserved.
      </p>
    </div>
    """
    for admin in admin_users:
        _send(admin.email, subject, html)


def send_hr_approved_email(hr_user) -> bool:
    subject = "Your HRMS account has been approved!"
    html = f"""
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;
                padding:32px;background:#f8fafc;border-radius:12px;">
      <div style="text-align:center;margin-bottom:24px;">
        <h1 style="color:#1e3a5f;font-size:22px;margin:0;">CBC Labs. Inc</h1>
        <p style="color:#64748b;font-size:13px;margin:4px 0 0;">HRMS Portal</p>
      </div>
      <div style="background:#fff;border-radius:10px;padding:28px;border:1px solid #e2e8f0;">
        <p style="color:#334155;font-size:15px;">Hi <strong>{hr_user.full_name}</strong>,</p>
        <p style="color:#334155;font-size:14px;">
          Your HRMS account has been <strong style="color:#16a34a;">approved!</strong>
          You can now log in to the portal.
        </p>
        <div style="text-align:center;margin:24px 0;">
          <a href="http://localhost:5173/login"
             style="background:#1e3a5f;color:#fff;padding:12px 32px;
                    border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">
            Login to HRMS
          </a>
        </div>
      </div>
      <p style="color:#94a3b8;font-size:12px;text-align:center;margin-top:20px;">
        &copy; 2025 CBC Labs. Inc. All rights reserved.
      </p>
    </div>
    """
    return _send(hr_user.email, subject, html)
