// Welcome email for the waiting list. Pure text building, no network: the
// sending lives in ./send.ts. Nothing typed by the visitor goes into the
// message, so there is nothing to escape.
//
// The pictures are in public/email/ and are drawn from emails/arte/ (see
// render.mjs there). An email can only show images that are already published,
// so they are linked from the live site.

export type EmailContent = {
  subject: string;
  html: string;
  text: string;
};

const intro =
  "Ya estás en la lista de OpoLab. Te escribiremos el día que abramos, antes que a nadie.";
const what =
  "OpoLab es un planificador para quien prepara las oposiciones a profesorado de Secundaria. Empezamos por Biología y Geología.";

const bombo = {
  title: "Tu temario en bolas",
  body: "Cada tema es una bola y cambia de color según lo preparado que lo tengas.",
};

const legend = [
  { color: "#c4b5fd", label: "Elegido" },
  { color: "#fbbf24", label: "En marcha" },
  { color: "#3b82f6", label: "Estudiado" },
  { color: "#10b981", label: "Dominado" },
];

// Same three ideas, in the same words, as the public page.
const facts = [
  {
    icon: "icono-plan.png",
    title: "Un plan que se hace solo",
    body: "Le dices tu fecha de examen y tus horas. OpoLab reparte temas, repasos, prácticos y simulacros hasta el día del examen.",
  },
  {
    icon: "icono-repasos.png",
    title: "Repasos cuando toca",
    body: "Cada tema vuelve a los 3, 7, 14 y 30 días, que es cuando empieza a olvidarse.",
  },
  {
    icon: "icono-racha.png",
    title: "Constancia que se ve",
    body: "Racha, experiencia y niveles para los días en que cuesta sentarse.",
  },
];

const price = {
  title: "¿Y cuánto costará?",
  body: "El planificador será gratis. Más adelante llegará un Coach de pago para ensayar la exposición del tema; todavía no tiene precio, y te lo contaremos antes de que salga.",
};

const cta = "Ver OpoLab en un minuto";
const privacy =
  "Solo usaremos tu correo para avisarte del lanzamiento. Si prefieres que lo borremos, responde a este mensaje y lo quitamos.";
const closing = "Hasta entonces, a por el siguiente tema.";
const signature = "Dani, de OpoLab";
const legal =
  "Recibes este correo porque te apuntaste a la lista de espera en opolab.net. Responsable: Daniel González López.";

const font = "font-family:Helvetica,Arial,sans-serif;";
const p = `margin:0 0 16px;font-size:16px;line-height:26px;color:#3d375c;${font}`;
const h2 = `margin:0 0 6px;font-size:22px;line-height:28px;font-weight:800;color:#14112a;${font}`;

export function buildWaitlistWelcome(siteUrl: string): EmailContent {
  const site = siteUrl.replace(/\/+$/, "");
  const art = `${site}/email`;
  const subject = "Estás dentro: te avisamos cuando abra OpoLab";

  const text = [
    "Hola:",
    intro,
    what,
    `${bombo.title}. ${bombo.body}`,
    ...facts.map((fact) => `${fact.title}. ${fact.body}`),
    `${price.title} ${price.body}`,
    privacy,
    closing,
    signature,
    site,
    legal,
  ].join("\n\n");

  const legendHtml = legend
    .map(
      (item) =>
        `<span style="white-space:nowrap;"><span style="color:${item.color};font-size:15px;">&#9679;</span>&nbsp;${item.label}</span>`,
    )
    .join(" &nbsp; ");

  const factsHtml = facts
    .map(
      (fact) => `<tr>
<td width="48" valign="top" style="padding:0 16px 22px 0;"><img src="${art}/${fact.icon}" width="48" height="51" alt="" style="display:block;border:0;"></td>
<td valign="top" style="padding:0 0 22px;">
<p style="margin:0;font-size:17px;line-height:24px;font-weight:800;color:#14112a;${font}">${fact.title}</p>
<p style="margin:2px 0 0;font-size:15px;line-height:23px;color:#514a72;${font}">${fact.body}</p>
</td>
</tr>`,
    )
    .join("\n");

  const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light only">
<title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#f4efff;">
<div style="display:none;max-height:0;overflow:hidden;">Te avisaremos el día que abramos, antes que a nadie.</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4efff;">
<tr><td align="center" style="padding:28px 12px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;">

<tr><td bgcolor="#8b5cf6" style="background:#8b5cf6;border-radius:24px 24px 0 0;">
<a href="${site}"><img src="${art}/cabecera.png" width="600" alt="OpoLab. Estás dentro. Que la bola que salga sea una de las tuyas." style="display:block;width:100%;height:auto;border:0;border-radius:24px 24px 0 0;color:#ffffff;font-size:26px;font-weight:800;${font}"></a>
</td></tr>

<tr><td bgcolor="#ffffff" style="background:#ffffff;padding:32px 32px 8px;">
<p style="${p}">Hola:</p>
<p style="${p}font-size:18px;line-height:28px;font-weight:700;color:#14112a;">${intro}</p>
<p style="${p}margin-bottom:28px;">${what}</p>

<p style="${h2}">${bombo.title}</p>
<p style="${p}margin-bottom:12px;">${bombo.body}</p>
<img src="${art}/bombo.png" width="536" alt="Un bombo de 40 bolas numeradas, cada una del color de su estado." style="display:block;width:100%;height:auto;border:0;">
<p style="margin:10px 0 30px;font-size:13px;line-height:22px;font-weight:700;color:#514a72;${font}">${legendHtml}</p>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
${factsHtml}
</table>
</td></tr>

<tr><td bgcolor="#ffffff" style="background:#ffffff;padding:0 32px 28px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
<tr><td bgcolor="#f4efff" style="background:#f4efff;border-radius:18px;padding:20px 22px;">
<p style="margin:0 0 4px;font-size:17px;line-height:24px;font-weight:800;color:#14112a;${font}">${price.title}</p>
<p style="margin:0;font-size:15px;line-height:23px;color:#3d375c;${font}">${price.body}</p>
</td></tr>
</table>
</td></tr>

<tr><td bgcolor="#ffffff" align="center" style="background:#ffffff;padding:0 32px 30px;">
<a href="${site}" style="display:inline-block;background:#8b5cf6;border-bottom:5px solid #6a3fe0;border-radius:16px;padding:14px 28px;font-size:17px;line-height:22px;font-weight:800;color:#ffffff;text-decoration:none;${font}">${cta}</a>
</td></tr>

<tr><td bgcolor="#ffffff" style="background:#ffffff;border-radius:0 0 24px 24px;padding:0 32px 32px;">
<p style="${p}font-size:14px;line-height:22px;color:#6e6690;">${privacy}</p>
<p style="${p}">${closing}</p>
<p style="margin:0;font-size:16px;line-height:26px;font-weight:800;color:#14112a;${font}">${signature}</p>
</td></tr>

<tr><td style="padding:20px 32px 0;">
<p style="margin:0;font-size:12px;line-height:18px;color:#6e6690;${font}">${legal}</p>
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;

  return { subject, html, text };
}
