# Supershield Backend

This is the backend server for the Supershield application. It is built with Node.js and Express, providing API endpoints to handle form submissions, send notifications via email, and store records in a MongoDB database.

## 🚀 Technologies

- **Runtime:** [Node.js](https://nodejs.org/)
- **Framework:** [Express.js](https://expressjs.com/)
- **Database:** [MongoDB](https://www.mongodb.com/) (using native driver)
- **Email Service:** [Nodemailer](https://nodemailer.com/)
- **Environment:** [Dotenv](https://github.com/motdotla/dotenv)

## 📂 Project Structure

```
Supershield-backend/
├── lib/
│   └── mongodb.js       # MongoDB connection helper
├── routes/
│   └── send-email.js    # API route for handling emails and DB storage
├── .env                 # Environment variables (not committed)
├── server.js            # Main entry point
└── package.json         # Dependencies and scripts
```

## 🛠️ Prerequisites

Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v14+ recommended)
- [MongoDB](https://www.mongodb.com/) (URI required)

## 📥 Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd Supershield-backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

## ⚙️ Configuration

Create a `.env` file in the root directory and configure the following variables:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
EMAIL_TO=recipient_email@example.com
```

> **Note:** For Gmail `EMAIL_PASS`, you must use an **App Password** if 2-Factor Authentication is enabled.

## ▶️ Running the Server

Start the development server:

```bash
npm start
```
The server will start on `http://localhost:5000` (or your configured PORT).

## 📡 API Endpoints

### POST `/api/send-email`

Handles various types of form submissions.

**Headers:**
- `Content-Type: application/json`

**Body Parameters:**

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `type` | `string` | Form type: `"contact"`, `"career"`, or `"enquiry"` (Default: `"contact"`) |
| `email` | `string` | User's email address |
| `phone` | `string` | User's phone number |
| `firstName` | `string` | User's first name |
| `lastName` | `string` | User's last name |
| `message` | `string` | Message content |
| `resume` | `string` | Base64 encoded string (Required if `type` is `"career"`) |
| ... | ... | Other fields: `companyName`, `country`, `city`, `product`, `position`, etc. |

**Example Request (Contact):**
```json
{
  "type": "contact",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "message": "Hello, I am interested in your services."
}
```

**Response:**
```json
{
  "success": true,
  "id": "67a3..."
}
```

## 📝 Features

- **Email Notifications:** Automatically sends formatted emails for contact requests, career applications, and product enquiries.
- **Database Logging:** Stores all submissions in the `enquire-management` collection in MongoDB.
- **Resume Handling:** Decodes and attaches Base64-encoded resumes (PDF/Docs) to emails for career applications.
