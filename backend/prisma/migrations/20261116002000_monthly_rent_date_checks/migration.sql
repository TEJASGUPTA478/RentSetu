ALTER TABLE "Lease"
  ADD CONSTRAINT "Lease_dueDay_range_check" CHECK ("dueDay" BETWEEN 1 AND 28);

ALTER TABLE "Payment"
  ADD CONSTRAINT "Payment_billingMonth_first_day_check" CHECK (EXTRACT(DAY FROM "billingMonth") = 1);
