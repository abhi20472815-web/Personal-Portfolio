require('dotenv').config();
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Database file path
const dbPath = path.join(__dirname, 'messages.db');

// Initialize database
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error connecting to the SQLite database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        // Create messages table if it doesn't exist
        db.run(`
            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                message TEXT NOT NULL,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                is_read INTEGER DEFAULT 0
            )
        `, (err) => {
            if (err) {
                console.error('Error creating messages table:', err.message);
            } else {
                console.log('Messages table ready.');
            }
        });
    }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Admin Authorization Middleware
const adminAuth = (req, res, next) => {
    const password = req.headers['x-admin-password'];
    const expectedPassword = process.env.ADMIN_PASSWORD || 'admin123';
    
    if (!password || password !== expectedPassword) {
        return res.status(401).json({ success: false, message: 'Unauthorized. Invalid password.' });
    }
    next();
};

// --- CONTACT FORM ENDPOINT ---
app.post('/api/contact', async (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ success: false, message: 'All fields (name, email, message) are required.' });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }

    // 1. Save to Database
    const sql = 'INSERT INTO messages (name, email, message) VALUES (?, ?, ?)';
    db.run(sql, [name, email, message], function(err) {
        if (err) {
            console.error('Database insert error:', err.message);
            return res.status(500).json({ success: false, message: 'Failed to save message to database.' });
        }

        const messageId = this.lastID;
        console.log(`Saved message ID ${messageId} from ${name} (${email})`);

        // 2. Send Email Notification
        sendEmailNotification(name, email, message)
            .then((info) => {
                res.status(200).json({ 
                    success: true, 
                    message: 'Your message has been received and saved! An email notification has been sent.',
                    messageId
                });
            })
            .catch((emailErr) => {
                console.warn('Email notification skipped/failed:', emailErr.message);
                // Return success anyway, since the database save succeeded
                res.status(200).json({ 
                    success: true, 
                    message: 'Your message was saved successfully! (Email notification skipped)',
                    messageId
                });
            });
    });
});

// Helper: Send Email Notification
async function sendEmailNotification(senderName, senderEmail, messageText) {
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const receiverEmail = process.env.RECEIVER_EMAIL || smtpUser;

    // Check if SMTP is configured. If not, log to console and simulate success.
    if (!smtpPass || smtpPass.trim() === '') {
        console.log('\n==================================================');
        console.log('📧 SIMULATED EMAIL NOTIFICATION (No App Password Configured)');
        console.log(`To:       ${receiverEmail}`);
        console.log(`From:     Portfolio Contact Form`);
        console.log(`Subject:  New Portfolio Message from ${senderName}`);
        console.log('--------------------------------------------------');
        console.log(`Sender:   ${senderName} <${senderEmail}>`);
        console.log(`Message:\n${messageText}`);
        console.log('==================================================\n');
        return 'Email simulated successfully';
    }

    // Configure SMTP transport
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
        auth: {
            user: smtpUser,
            pass: smtpPass
        }
    });

    const mailOptions = {
        from: `"${senderName} via Portfolio" <${smtpUser}>`, // Send as verified user but show sender's name
        to: receiverEmail,
        replyTo: senderEmail, // So clicking reply goes to the actual sender
        subject: `💼 New Portfolio Message from ${senderName}`,
        text: `You received a new message from your portfolio contact form:\n\nName: ${senderName}\nEmail: ${senderEmail}\n\nMessage:\n${messageText}`,
        html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #fcfcfc;">
                <h2 style="color: #ff6b35; border-bottom: 2px solid #ff6b35; padding-bottom: 10px; margin-top: 0;">💼 New Message Received</h2>
                <p style="font-size: 16px; color: #333;">You have received a new contact form submission from your portfolio website.</p>
                
                <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                    <tr>
                        <td style="padding: 8px 0; font-weight: bold; color: #555; width: 80px;">Name:</td>
                        <td style="padding: 8px 0; color: #222;">${senderName}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; font-weight: bold; color: #555;">Email:</td>
                        <td style="padding: 8px 0; color: #222;"><a href="mailto:${senderEmail}" style="color: #ff6b35; text-decoration: none;">${senderEmail}</a></td>
                    </tr>
                </table>
                
                <div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #ff6b35; border-radius: 4px; font-style: italic; color: #444; white-space: pre-wrap; margin-bottom: 20px;">${messageText}</div>
                
                <p style="font-size: 12px; color: #888; border-top: 1px solid #eee; padding-top: 15px; margin-bottom: 0;">
                    This email was sent automatically from your Portfolio server. To reply to this message, simply hit reply in your email client.
                </p>
            </div>
        `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: %s', info.messageId);
    return info;
}


// --- ADMIN API ENDPOINTS (PASSWORD PROTECTED) ---

// Get stats (total, read, unread)
app.get('/api/admin/stats', adminAuth, (req, res) => {
    const sql = `
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN is_read = 1 THEN 1 ELSE 0 END) as read,
            SUM(CASE WHEN is_read = 0 THEN 1 ELSE 0 END) as unread
        FROM messages
    `;
    db.get(sql, [], (err, row) => {
        if (err) {
            console.error('Database query error:', err.message);
            return res.status(500).json({ success: false, message: 'Failed to retrieve stats.' });
        }
        res.status(200).json({
            success: true,
            stats: {
                total: row.total || 0,
                read: row.read || 0,
                unread: row.unread || 0
            }
        });
    });
});

// Get all messages
app.get('/api/admin/messages', adminAuth, (req, res) => {
    const sql = 'SELECT * FROM messages ORDER BY timestamp DESC';
    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error('Database query error:', err.message);
            return res.status(500).json({ success: false, message: 'Failed to retrieve messages.' });
        }
        res.status(200).json({ success: true, messages: rows });
    });
});

// Update message read status
app.put('/api/admin/messages/:id/read', adminAuth, (req, res) => {
    const { id } = req.params;
    const { is_read } = req.body; // should be 0 or 1

    if (is_read === undefined || (is_read !== 0 && is_read !== 1)) {
        return res.status(400).json({ success: false, message: 'Invalid read status. Must be 0 or 1.' });
    }

    const sql = 'UPDATE messages SET is_read = ? WHERE id = ?';
    db.run(sql, [is_read, id], function(err) {
        if (err) {
            console.error('Database update error:', err.message);
            return res.status(500).json({ success: false, message: 'Failed to update message status.' });
        }
        if (this.changes === 0) {
            return res.status(404).json({ success: false, message: 'Message not found.' });
        }
        res.status(200).json({ success: true, message: `Message status updated to ${is_read === 1 ? 'read' : 'unread'}.` });
    });
});

// Delete a message
app.delete('/api/admin/messages/:id', adminAuth, (req, res) => {
    const { id } = req.params;

    const sql = 'DELETE FROM messages WHERE id = ?';
    db.run(sql, [id], function(err) {
        if (err) {
            console.error('Database delete error:', err.message);
            return res.status(500).json({ success: false, message: 'Failed to delete message.' });
        }
        if (this.changes === 0) {
            return res.status(404).json({ success: false, message: 'Message not found.' });
        }
        res.status(200).json({ success: true, message: 'Message deleted successfully.' });
    });
});

// Serve admin dashboard at /admin.html
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Portfolio server is running at http://localhost:${PORT}`);
});
