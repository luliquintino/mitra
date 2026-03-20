import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class ResendProvider {
  private resend: Resend;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  async sendNotificationEmail(
    toEmail: string,
    titulo: string,
    mensagem: string,
    deepLink?: string,
  ): Promise<void> {
    try {
      // Verificar se email foi configurado (dev mode)
      if (!process.env.RESEND_API_KEY) {
        console.warn(
          `[NOTIFICATION] Email not sent (RESEND_API_KEY not configured): ${toEmail}`,
        );
        return;
      }

      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #243b53; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
              .content { color: #333; line-height: 1.6; }
              .button {
                display: inline-block;
                padding: 12px 24px;
                background: #243b53;
                color: white;
                text-decoration: none;
                border-radius: 6px;
                margin-top: 16px;
              }
              .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h2 style="margin: 0;">MITRA</h2>
              </div>
              <div class="content">
                <h3>${titulo}</h3>
                <p>${mensagem}</p>
                ${
                  deepLink
                    ? `<a href="${process.env.FRONTEND_URL}${deepLink}" class="button">Ver no MITRA</a>`
                    : ''
                }
              </div>
              <div class="footer">
                <p>Você recebeu esta notificação do MITRA - Sistema de Gestão de Saúde e Bem-estar de Pets.</p>
                <p><a href="${process.env.FRONTEND_URL}/notificacoes">Gerenciar notificações</a></p>
              </div>
            </div>
          </body>
        </html>
      `;

      await this.resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'notifications@mitra.com',
        to: toEmail,
        subject: titulo,
        html: htmlContent,
      });

      console.log(`[NOTIFICATION] Email sent to ${toEmail}: ${titulo}`);
    } catch (error) {
      console.error(
        `[NOTIFICATION] Failed to send email to ${toEmail}:`,
        error,
      );
      // Não lançar erro - notificações não devem bloquear fluxo principal
    }
  }
}
