-- Strangler-Fig FOUNDATION — outbox / inbox / integration_failures / service_reconciliation.
-- ADDITIVE ONLY. Tabelas self-contained (sem FK para tabelas existentes). Idempotente.

-- CreateEnum
CREATE TYPE "OutboxStatus" AS ENUM ('PENDING', 'PUBLISHED', 'FAILED');

-- CreateEnum
CREATE TYPE "InboxStatus" AS ENUM ('RECEIVED', 'PROCESSED', 'FAILED');

-- CreateTable
CREATE TABLE IF NOT EXISTS "outbox_events" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "eventVersion" TEXT NOT NULL,
    "aggregateType" TEXT,
    "aggregateId" TEXT,
    "payload" JSONB NOT NULL,
    "correlationId" TEXT,
    "causationId" TEXT,
    "idempotencyKey" TEXT,
    "producer" TEXT NOT NULL,
    "status" "OutboxStatus" NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedAt" TIMESTAMP(3),

    CONSTRAINT "outbox_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "inbox_events" (
    "eventId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "consumer" TEXT NOT NULL,
    "status" "InboxStatus" NOT NULL DEFAULT 'RECEIVED',
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,

    CONSTRAINT "inbox_events_pkey" PRIMARY KEY ("eventId")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "integration_failures" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "eventId" TEXT,
    "eventType" TEXT,
    "payload" JSONB,
    "error" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "integration_failures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "service_reconciliation" (
    "id" TEXT NOT NULL,
    "service" TEXT NOT NULL,
    "runAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "checked" INTEGER NOT NULL DEFAULT 0,
    "mismatches" INTEGER NOT NULL DEFAULT 0,
    "repaired" INTEGER NOT NULL DEFAULT 0,
    "details" JSONB,
    "status" TEXT NOT NULL,

    CONSTRAINT "service_reconciliation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "outbox_events_eventId_key" ON "outbox_events"("eventId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "outbox_events_status_createdAt_idx" ON "outbox_events"("status", "createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "outbox_events_aggregateType_aggregateId_idx" ON "outbox_events"("aggregateType", "aggregateId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "inbox_events_consumer_status_idx" ON "inbox_events"("consumer", "status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "integration_failures_source_resolvedAt_idx" ON "integration_failures"("source", "resolvedAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "service_reconciliation_service_runAt_idx" ON "service_reconciliation"("service", "runAt");
