export const emailTemplates = {
  baseLayout: (content: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>sedā</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f5f5f5;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 32px;
      text-align: center;
    }
    .header h1 {
      color: #ffffff;
      margin: 0;
      font-size: 32px;
      letter-spacing: 2px;
    }
    .content {
      padding: 32px;
    }
    .content h2 {
      color: #333;
      margin-top: 0;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #ffffff !important;
      padding: 14px 28px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin: 16px 0;
    }
    .footer {
      background: #f9f9f9;
      padding: 24px;
      text-align: center;
      font-size: 14px;
      color: #666;
    }
    .footer a {
      color: #667eea;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>sedā</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} sedā. All rights reserved.</p>
      <p><a href="https://seda.fm">seda.fm</a></p>
    </div>
  </div>
</body>
</html>
  `,

  verificationApproved: (displayName: string, frontendUrl: string) =>
    emailTemplates.baseLayout(`
      <h2>Congratulations, ${displayName}!</h2>
      <p>Your artist verification has been <strong>approved</strong>. You now have access to all verified artist features on sedā.</p>
      <p>As a verified artist, you can:</p>
      <ul>
        <li>Create and manage your artist profile</li>
        <li>Upload and sell your music</li>
        <li>Access advanced analytics</li>
        <li>Connect with your fans</li>
      </ul>
      <p style="text-align: center;">
        <a href="${frontendUrl}/dashboard" class="button">Go to Your Dashboard</a>
      </p>
      <p>Welcome to the sedā community!</p>
    `),

  verificationDenied: (displayName: string, reason: string, frontendUrl: string) =>
    emailTemplates.baseLayout(`
      <h2>Hi ${displayName},</h2>
      <p>We've reviewed your artist verification request and unfortunately, we weren't able to approve it at this time.</p>
      <p><strong>Reason:</strong> ${reason}</p>
      <p>You can submit a new verification request after addressing the feedback above.</p>
      <p style="text-align: center;">
        <a href="${frontendUrl}/verification/apply" class="button">Submit New Request</a>
      </p>
      <p>If you have any questions, please reach out to our support team.</p>
    `),

  verificationExpired: (displayName: string, frontendUrl: string) =>
    emailTemplates.baseLayout(`
      <h2>Hi ${displayName},</h2>
      <p>Your artist verification request has expired. Verification requests are valid for 7 days.</p>
      <p>If you're still interested in becoming a verified artist, please submit a new request.</p>
      <p style="text-align: center;">
        <a href="${frontendUrl}/verification/apply" class="button">Submit New Request</a>
      </p>
    `),

  welcome: (displayName: string, frontendUrl: string) =>
    emailTemplates.baseLayout(`
      <h2>Welcome to sedā, ${displayName}!</h2>
      <p>Thanks for joining the music community that puts artists first.</p>
      <p>Here's what you can do on sedā:</p>
      <ul>
        <li>Discover new music and connect with artists</li>
        <li>Create and share playlists</li>
        <li>Join listening rooms and chat with fans</li>
        <li>Support your favorite artists directly</li>
      </ul>
      <p style="text-align: center;">
        <a href="${frontendUrl}/discover" class="button">Start Exploring</a>
      </p>
    `),

  newFollower: (displayName: string, followerName: string, followerUrl: string) =>
    emailTemplates.baseLayout(`
      <h2>New Follower!</h2>
      <p>Hi ${displayName},</p>
      <p><strong>${followerName}</strong> is now following you on sedā.</p>
      <p style="text-align: center;">
        <a href="${followerUrl}" class="button">View Profile</a>
      </p>
    `),

  newMessage: (displayName: string, senderName: string, messagePreview: string, messagesUrl: string) =>
    emailTemplates.baseLayout(`
      <h2>New Message</h2>
      <p>Hi ${displayName},</p>
      <p>You have a new message from <strong>${senderName}</strong>:</p>
      <blockquote style="background: #f5f5f5; padding: 16px; border-left: 4px solid #667eea; margin: 16px 0;">
        "${messagePreview.substring(0, 150)}${messagePreview.length > 150 ? '...' : ''}"
      </blockquote>
      <p style="text-align: center;">
        <a href="${messagesUrl}" class="button">Reply</a>
      </p>
    `),

  purchaseConfirmation: (
    displayName: string,
    itemName: string,
    itemType: string,
    price: string,
    downloadUrl: string
  ) =>
    emailTemplates.baseLayout(`
      <h2>Purchase Confirmed!</h2>
      <p>Hi ${displayName},</p>
      <p>Thank you for your purchase!</p>
      <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0;"><strong>Item:</strong> ${itemName}</p>
        <p style="margin: 8px 0 0;"><strong>Type:</strong> ${itemType}</p>
        <p style="margin: 8px 0 0;"><strong>Price:</strong> ${price}</p>
      </div>
      <p style="text-align: center;">
        <a href="${downloadUrl}" class="button">Download Now</a>
      </p>
      <p style="font-size: 14px; color: #666;">Your download link will be available for 30 days.</p>
    `),

  newSale: (artistName: string, itemName: string, buyerName: string, amount: string, dashboardUrl: string) =>
    emailTemplates.baseLayout(`
      <h2>You Made a Sale!</h2>
      <p>Hi ${artistName},</p>
      <p>Great news! <strong>${buyerName}</strong> just purchased your ${itemName}.</p>
      <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
        <p style="margin: 0; font-size: 24px; color: #667eea;"><strong>${amount}</strong></p>
        <p style="margin: 8px 0 0; color: #666;">Added to your balance</p>
      </div>
      <p style="text-align: center;">
        <a href="${dashboardUrl}" class="button">View Dashboard</a>
      </p>
    `),
};
