const nodemailer = require('nodemailer');
require('dotenv').config();

// Create a transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  service: 'gmail', // or your email service
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

/**
 * Send a password reset email
 * @param {string} to - Recipient email address
 * @param {string} resetToken - Password reset token
 * @returns {Promise<Object>} - Result of the email sending operation
 */
const sendPasswordResetEmail = async (to, resetToken) => {
  try {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: `"Pathology Museum" <${process.env.EMAIL_USERNAME}>`,
      to,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>You requested a password reset for your account. Click the button below to reset your password:</p>
          <div style="text-align: center; margin: 25px 0;">
            <a href="${resetUrl}" 
               style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p>If you didn't request this, please ignore this email. The link will expire in 1 hour.</p>
          <p>Or copy and paste this link in your browser:</p>
          <p>${resetUrl}</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
};

/**
 * Send email notification when a new question is posted
 * @param {string} to - Recipient email address (admin/teacher)
 * @param {Object} questionData - Question details
 * @returns {Promise<Object>} - Result of the email sending operation
 */
const sendNewQuestionEmail = async (to, questionData) => {
  try {
    const { questionTitle, questionContent, specimenTitle, studentName, specimenId } = questionData;
    const specimenUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/specimens/${specimenId}`;
    
    const mailOptions = {
      from: `"Pathology Museum" <${process.env.EMAIL_USERNAME}>`,
      to,
      subject: `New Question: "${questionTitle}"`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <div style="border-left: 4px solid #3b82f6; padding-left: 16px; margin-bottom: 20px;">
              <h2 style="color: #1f2937; margin: 0 0 8px 0;">New Question Posted</h2>
              <p style="color: #6b7280; margin: 0; font-size: 14px;">A student needs your help</p>
            </div>
            
            <div style="background-color: #eff6ff; padding: 16px; border-radius: 6px; margin-bottom: 20px;">
              <h3 style="color: #1f2937; margin: 0 0 12px 0; font-size: 18px;">${questionTitle}</h3>
              <p style="color: #4b5563; margin: 0; line-height: 1.6;">${questionContent}</p>
            </div>
            
            <div style="margin-bottom: 20px; padding: 12px; background-color: #f3f4f6; border-radius: 4px;">
              <p style="margin: 0; color: #6b7280; font-size: 14px;">
                <strong>Posted by:</strong> ${studentName}<br>
                <strong>Specimen:</strong> ${specimenTitle}
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${specimenUrl}" 
                 style="background-color: #3b82f6; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
                View Question & Answer
              </a>
            </div>
            
            <div style="border-top: 1px solid #e5e7eb; padding-top: 16px; margin-top: 20px;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0; text-align: center;">
                This is an automated notification from Digital Pathology Museum.<br>
                You're receiving this because a student posted a question.
              </p>
            </div>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✉️ New question email sent to:', to);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending new question email:', error.message);
    // Don't throw - we don't want email failures to break the notification creation
    return { success: false, error: error.message };
  }
};

/**
 * Send email notification when a question is answered
 * @param {string} to - Recipient email address (student who asked)
 * @param {Object} answerData - Answer details
 * @returns {Promise<Object>} - Result of the email sending operation
 */
const sendQuestionAnsweredEmail = async (to, answerData) => {
  try {
    const { questionTitle, answerContent, answeredBy, specimenTitle, specimenId } = answerData;
    const specimenUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/specimens/${specimenId}`;
    
    const mailOptions = {
      from: `"Pathology Museum" <${process.env.EMAIL_USERNAME}>`,
      to,
      subject: `Your Question Has Been Answered: "${questionTitle}"`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <div style="border-left: 4px solid #10b981; padding-left: 16px; margin-bottom: 20px;">
              <h2 style="color: #1f2937; margin: 0 0 8px 0;">✅ Your Question Has Been Answered!</h2>
              <p style="color: #6b7280; margin: 0; font-size: 14px;">An expert has responded to your question</p>
            </div>
            
            <div style="background-color: #f3f4f6; padding: 16px; border-radius: 6px; margin-bottom: 16px;">
              <p style="color: #6b7280; margin: 0 0 8px 0; font-size: 13px; font-weight: 600; text-transform: uppercase;">Your Question:</p>
              <h3 style="color: #1f2937; margin: 0; font-size: 18px;">${questionTitle}</h3>
            </div>
            
            <div style="background-color: #ecfdf5; padding: 16px; border-radius: 6px; margin-bottom: 20px; border: 1px solid #10b981;">
              <p style="color: #059669; margin: 0 0 8px 0; font-size: 13px; font-weight: 600;">
                💬 Answer from ${answeredBy}:
              </p>
              <p style="color: #1f2937; margin: 0; line-height: 1.6;">${answerContent.substring(0, 200)}${answerContent.length > 200 ? '...' : ''}</p>
            </div>
            
            <div style="margin-bottom: 20px; padding: 12px; background-color: #f3f4f6; border-radius: 4px;">
              <p style="margin: 0; color: #6b7280; font-size: 14px;">
                <strong>Specimen:</strong> ${specimenTitle}
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${specimenUrl}" 
                 style="background-color: #10b981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
                Read Full Answer
              </a>
            </div>
            
            <div style="border-top: 1px solid #e5e7eb; padding-top: 16px; margin-top: 20px;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0; text-align: center;">
                This is an automated notification from Digital Pathology Museum.<br>
                You're receiving this because your question was answered.
              </p>
            </div>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✉️ Question answered email sent to:', to);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending question answered email:', error.message);
    // Don't throw - we don't want email failures to break the notification creation
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendPasswordResetEmail,
  sendNewQuestionEmail,
  sendQuestionAnsweredEmail,
};
