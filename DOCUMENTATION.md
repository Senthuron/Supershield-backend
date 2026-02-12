# Supershield Backend - Technical & Functional Documentation

This document provides a comprehensive technical overview of the Supershield Backend application.

## 1. High-Level System Architecture

The Supershield Backend is a monolithic **Node.js** application built with **Express.js**. It serves as the processing unit for frontend contact forms, career applications, and product enquiries.

### Key Components:
*   **API Server**: Built on Express.js, handling HTTP requests.
*   **Database**: **MongoDB** is used for persistent storage of form submissions. The application connects using the native `mongodb` driver.
*   **Email Notification Service**: **Nodemailer** is integrated to send email notifications to administrators upon form submission. Currently configured to use Gmail SMTP.

### Data Flow:
1.  **Incoming Request**: The frontend sends a `POST` request to `/api/send-email` with JSON payload.
2.  **Processing**: The server parses the payload, validates the form type (Contact, Career, Enquiry), and decodes any attachments (e.g., resumes).
3.  **Persistence**: The submission data is structured and inserted into the MongoDB collection `enquire-management`.
4.  **Notification**: An HTML email is generated and sent to the configured recipient (`EMAIL_TO`) with any attachments.
5.  **Response**: The server responds with success/failure status and the database ID of the record.

## 2. Folder and File Structure

```
Supershield-backend/
├── lib/
│   └── mongodb.js        # MongoDB connection module (Singleton pattern)
├── routes/
│   └── send-email.js     # Core route handler for form processing
├── .env                  # Environment variables (Credentials, Config)
├── server.js             # Application entry point & Server configuration
├── package.json          # Project dependencies and scripts
└── README.md             # Project overview
```

*   **`server.js`**: Initialized the Express app, configures middleware (CORS, JSON parsing), and mounts the API routes.
*   **`lib/mongodb.js`**: Manages the database connection. It implements a caching mechanism to reuse the `MongoClient` across requests, which is crucial for performance in serverless or high-load environments.
*   **`routes/send-email.js`**: Contains the bulk of the business logic. It handles the single API endpoint used for all form submissions.

## 3. Core Logic Areas

### 3.1 Authentication
*   **Status**: Currently, the API endpoints are public. There is **no authentication mechanism** (like API keys or JWT) preventing unauthorized access to the `send-email` endpoint.
*   **Security Note**: This is a potential risk for spam and abuse.

### 3.2 Form Handling Logic (`/api/send-email`)
The endpoint accepts a `type` parameter to switch logic:
*   **Career**: Handles job applications. Parses `resume` (Base64 encoded string), validates size (< 2.5MB), and attaches it to the email.
*   **Enquiry**: Handles product-specific questions.
*   **Contact**: General contact form submissions.

**Resume Parsing:**
The backend expects the resume as a Base64 Data URI string. It manually extracts the MIME type and binary data buffers for email attachment.

### 3.3 Integrations
*   **MongoDB**: Data is stored in the `supershield` database, inside the `enquire-management` collection.
*   **Nodemailer**: Uses `service: 'Gmail'` for transport. Requires `EMAIL_USER` and `EMAIL_PASS`.

## 4. Deployment and Rollback Procedure

### prerequisites
*   Node.js (v18 or higher recommended)
*   MongoDB Instance (URI required)
*   Gmail Account with App Password enabled

### Deployment Steps
1.  **Clone the Repository**:
    ```bash
    git clone <repository_url>
    cd Supershield-backend
    ```
2.  **Install Dependencies**:
    ```bash
    npm install
    ```
3.  **Environment Configuration**:
    Create a `.env` file in the root directory:
    ```env
    PORT=5000
    MONGODB_URI=<your_mongodb_connection_string>
    EMAIL_USER=<your_gmail_address>
    EMAIL_PASS=<your_gmail_app_password>
    EMAIL_TO=<recipient_email_address>
    ```
4.  **Start the Server**:
    For production, it is recommended to use a process manager like PM2.
    ```bash
    npm start
    # OR with PM2
    pm2 start server.js --name "supershield-backend"
    ```

### Rollback Procedure
If a deployment introduces critical bugs:
1.  **Identify Last Stable Commit**: Checks git log.
2.  **Revert Code**:
    ```bash
    git reset --hard <previous_commit_hash>
    ```
3.  **Re-install Dependencies** (if `package.json` changed):
    ```bash
    npm install
    ```
4.  **Restart Service**:
    ```bash
    npm start
    ```

## 5. Known Risks and Technical Debt

### 5.1 Security Risks
*   **CORS Policy**: `app.use(cors())` is currently set to allow **all origins**. This allows any website to make requests to your backend. *Recommendation: Restrict to specific frontend domains.*
*   **No Rate Limiting**: There is no protection against spam attacks. A malicious user could flood the email service and database.
*   **Input Validation**: Input validation is minimal. Malformed data could potentially cause issues or be stored in the database.

### 5.2 Technical Debt
*   **Hardcoded Email Service**: The code explicitly uses `service: "Gmail"`. Switching to a transactional email provider like SendGrid or AWS SES would require code changes.
*   **Fail-Open DB Logic**: If the database insertion fails (e.g., connection error), the system **still attempts to send the email**. While this ensures the admin gets the message, it results in data inconsistency where the record exists in email but not in the database.
*   **Synchronous Processing**: Email sending is done within the request-response cycle. If the SMTP server is slow, the HTTP request hangs. *Recommendation: Move email sending to a background queue.*
