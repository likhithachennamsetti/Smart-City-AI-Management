import os
import smtplib
from email.message import EmailMessage

from dotenv import load_dotenv

load_dotenv()


def send_complaint_email(
    recipient_email,
    complaint_id,
    title,
    category,
    priority,
    description
):
    sender_email = os.getenv("EMAIL_ADDRESS")
    sender_password = os.getenv("EMAIL_PASSWORD")

    if not sender_email or not sender_password:
        print("Email credentials are not configured.")
        return False

    message = EmailMessage()

    message["Subject"] = f"Smart City Complaint #{complaint_id}"
    message["From"] = sender_email
    message["To"] = recipient_email

    message.set_content(
        f"""
Smart City AI Complaint Management

Your complaint has been submitted successfully.

Complaint ID: {complaint_id}

Title: {title}
Category: {category}
Priority: {priority}

Description:
{description}

Status: Pending

Thank you for helping improve your city.
"""
    )

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:

            server.login(
                sender_email,
                sender_password
            )

            server.send_message(message)

        print(
            f"Complaint notification sent to {recipient_email}"
        )

        return True

    except Exception as e:

        print(
            f"Failed to send email: {e}"
        )

        return False
def send_status_update_email(
    recipient_email,
    complaint_id,
    title,
    new_status
):
    sender_email = os.getenv("EMAIL_ADDRESS")
    sender_password = os.getenv("EMAIL_PASSWORD")

    if not sender_email or not sender_password:
        print("Email credentials are not configured.")
        return False

    message = EmailMessage()

    message["Subject"] = (
        f"Smart City Complaint #{complaint_id} - Status Updated"
    )

    message["From"] = sender_email
    message["To"] = recipient_email

    status_text = new_status.replace(
        "_",
        " "
    ).title()

    message.set_content(
        f"""
Smart City AI Complaint Management

Your complaint status has been updated.

Complaint ID: {complaint_id}

Title:
{title}

New Status:
{status_text}

Please log in to your Smart City dashboard
to view your complaint details.

Thank you for helping improve your city.

Regards,
Smart City Complaint Management System
"""
    )

    try:

        with smtplib.SMTP_SSL(
            "smtp.gmail.com",
            465
        ) as server:

            server.login(
                sender_email,
                sender_password
            )

            server.send_message(message)

        print(
            f"Status notification sent to {recipient_email}"
        )

        return True

    except Exception as e:

        print(
            f"Failed to send status email: {e}"
        )

        return False