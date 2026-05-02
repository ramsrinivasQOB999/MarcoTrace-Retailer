-- Mercotrace Retailer — create the app database (run once as postgres superuser)
--
-- PowerShell:
--   $env:PGPASSWORD = 'NewStrongPass123!'
--   psql -U postgres -h localhost -p 5433 -f setup-database.sql
--
-- This uses database name mercotraceretailer (separate from glow_business_board).
-- Spring Boot dev profile is wired to: localhost:5433, user postgres, DB mercotraceretailer.

CREATE DATABASE mercotraceretailer OWNER postgres;
