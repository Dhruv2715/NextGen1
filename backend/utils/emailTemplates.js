const generateEmailTemplate = (title, message, ctaText, ctaLink) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: 'Inter', system-ui, -apple-system, sans-serif; background-color: #f4f7f9; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; shadow: 0 4px 6px rgba(0,0,0,0.05); }
            .header { background: #2563eb; padding: 40px; text-align: center; }
            .content { padding: 40px; color: #1f2937; line-height: 1.6; }
            .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 12px; }
            h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.025em; }
            .button { display: inline-block; padding: 14px 28px; background-color: #2563eb; color: #ffffff !important; text-decoration: none; border-radius: 10px; font-weight: 700; margin-top: 24px; transition: all 0.2s; }
            .logo-text { color: #ffffff; font-weight: 900; font-size: 20px; margin-bottom: 20px; display: block; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <span class="logo-text">NextGen</span>
                <h1>${title}</h1>
            </div>
            <div class="content">
                ${message}
                ${ctaText && ctaLink ? `
                    <div style="text-align: center;">
                        <a href="${ctaLink}" class="button">${ctaText}</a>
                    </div>
                ` : ''}
            </div>
            <div class="footer">
                &copy; ${new Date().getFullYear()} NextGen AI Platforms. All rights reserved.<br>
                San Francisco, CA
            </div>
        </div>
    </body>
    </html>
    `;
};

module.exports = { generateEmailTemplate };
