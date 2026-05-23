export interface DigestTemplateData {
  name: string;
  taskCount: number;
  date: string;
}

export function buildDailyDigestTemplate(data: DigestTemplateData): string {
  const { name, taskCount, date } = data;

  const taskWord = taskCount === 1 ? 'task' : 'tasks';
  const urgencyColor = taskCount >= 5 ? '#e53e3e' : '#3182ce';

  return /* html */ `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Your Daily Digest</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f7fafc;font-family:'Segoe UI',Arial,sans-serif;">

    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f7fafc;padding:40px 0;">
      <tr>
        <td align="center">

          <!-- Card -->
          <table width="560" cellpadding="0" cellspacing="0"
            style="background-color:#ffffff;border-radius:8px;
                   box-shadow:0 2px 8px rgba(0,0,0,0.08);overflow:hidden;">

            <!-- Header -->
            <tr>
              <td style="background-color:#2d3748;padding:28px 40px;">
                <p style="margin:0;font-size:13px;color:#a0aec0;letter-spacing:1px;
                           text-transform:uppercase;">AI Bridge</p>
                <h1 style="margin:6px 0 0;font-size:22px;color:#ffffff;font-weight:600;">
                  Daily Digest
                </h1>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:36px 40px;">
                <p style="margin:0 0 16px;font-size:16px;color:#4a5568;">
                  Hi <strong style="color:#2d3748;">${name}</strong>,
                </p>
                <p style="margin:0 0 28px;font-size:15px;color:#718096;line-height:1.6;">
                  Here is your summary for <strong style="color:#2d3748;">${date}</strong>.
                </p>

                <!-- Stat box -->
                <table width="100%" cellpadding="0" cellspacing="0"
                  style="background-color:#f7fafc;border-left:4px solid ${urgencyColor};
                         border-radius:4px;margin-bottom:28px;">
                  <tr>
                    <td style="padding:20px 24px;">
                      <p style="margin:0 0 4px;font-size:13px;color:#718096;
                                 text-transform:uppercase;letter-spacing:0.5px;">
                        Pending Tasks
                      </p>
                      <p style="margin:0;font-size:36px;font-weight:700;color:${urgencyColor};">
                        ${taskCount}
                        <span style="font-size:16px;font-weight:400;color:#718096;">
                          ${taskWord} left
                        </span>
                      </p>
                    </td>
                  </tr>
                </table>

                <p style="margin:0 0 28px;font-size:15px;color:#718096;line-height:1.6;">
                  ${
                    taskCount === 0
                      ? '🎉 Great work — your task list is clear! Enjoy the rest of your day.'
                      : `You still have <strong style="color:#2d3748;">${taskCount} ${taskWord}</strong> waiting for your attention. Stay focused and keep moving forward!`
                  }
                </p>

                <!-- CTA -->
                <table cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="background-color:#2d3748;border-radius:6px;">
                      <a href="#" style="display:inline-block;padding:12px 28px;
                                         font-size:15px;font-weight:600;
                                         color:#ffffff;text-decoration:none;">
                        View My Tasks →
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background-color:#f7fafc;padding:20px 40px;
                          border-top:1px solid #e2e8f0;">
                <p style="margin:0;font-size:12px;color:#a0aec0;text-align:center;">
                  You are receiving this email because you have daily digests enabled.<br/>
                  © ${new Date().getFullYear()} AI Bridge. All rights reserved.
                </p>
              </td>
            </tr>

          </table>
          <!-- /Card -->

        </td>
      </tr>
    </table>

  </body>
</html>
  `.trim();
}