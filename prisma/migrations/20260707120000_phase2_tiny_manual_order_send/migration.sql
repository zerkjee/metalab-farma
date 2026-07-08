ALTER TYPE "TinySyncStatus" ADD VALUE IF NOT EXISTS 'NOT_SENT_TO_TINY';
ALTER TYPE "TinySyncStatus" ADD VALUE IF NOT EXISTS 'VALIDATION_ERROR';
ALTER TYPE "TinySyncStatus" ADD VALUE IF NOT EXISTS 'SENDING_TO_TINY';
ALTER TYPE "TinySyncStatus" ADD VALUE IF NOT EXISTS 'TINY_ORDER_CREATED';
ALTER TYPE "TinySyncStatus" ADD VALUE IF NOT EXISTS 'SYNC_ERROR';

CREATE TABLE IF NOT EXISTS "tiny_integration_logs" (
  "id" TEXT NOT NULL,
  "orderId" TEXT,
  "action" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "requestPayload" JSONB,
  "responsePayload" JSONB,
  "errorMessage" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "tiny_integration_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "tiny_integration_logs_orderId_idx" ON "tiny_integration_logs"("orderId");
CREATE INDEX IF NOT EXISTS "tiny_integration_logs_action_idx" ON "tiny_integration_logs"("action");
CREATE INDEX IF NOT EXISTS "tiny_integration_logs_status_idx" ON "tiny_integration_logs"("status");
CREATE INDEX IF NOT EXISTS "tiny_integration_logs_createdAt_idx" ON "tiny_integration_logs"("createdAt");
