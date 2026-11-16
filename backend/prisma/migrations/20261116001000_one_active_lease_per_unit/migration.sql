CREATE UNIQUE INDEX one_active_lease_per_unit ON "Lease"("unitId") WHERE status = 'ACTIVE';
