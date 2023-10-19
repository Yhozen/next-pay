-- CreateTable
CREATE TABLE "NextPayOrder" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "serviceName" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "clientName" TEXT,
    "referenceId" TEXT NOT NULL,

    CONSTRAINT "NextPayOrder_pkey" PRIMARY KEY ("id")
);
