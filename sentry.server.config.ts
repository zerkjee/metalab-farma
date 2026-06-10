// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";
import { sentryBeforeSend } from "./lib/sentryUtils";

Sentry.init({
  dsn: process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Amostragem menor em produção para reduzir volume/custo.
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1,

  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Não enviar PII por padrão; beforeSend mascara o que restar (CPF, email, telefone,
  // endereço, PIX, cookies, authorization, tokens).
  sendDefaultPii: false,
  beforeSend: sentryBeforeSend,
});
