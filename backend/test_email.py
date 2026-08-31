import os
import smtplib
from email.message import EmailMessage
from dotenv import load_dotenv

load_dotenv()

sender_email = os.getenv("EMAIL_ADDRESS")
sender_password = os.getenv("EMAIL_PASSWORD")

print("Sender:", sender_email)
print("Password configured:", bool(sender_password))

message = EmailMessage()

message["Subject"] = "TCN Project Email Test"
message["From"] = sender_email
message["To"] = sender_email

message.set_content(
    "This is a test email from the Smart City AI Complaint Management project."
)

try:

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:

        print("Connecting to Gmail...")

        server.login(
            sender_email,
            sender_password
        )

        print("Gmail login successful!")

        server.send_message(message)

        print("Test email sent successfully!")

except Exception as e:

    print("Email test failed:")
    print(e)