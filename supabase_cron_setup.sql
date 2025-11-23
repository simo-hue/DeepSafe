-- Enable required extensions
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Schedule the job to run every day at 9:00 AM UTC
-- NOTE: Replace 'YOUR_APP_URL' and 'YOUR_CRON_SECRET' with actual values
-- Example: https://deepsafe.vercel.app/api/cron/daily-reminder

select cron.schedule(
  'daily-reminder', -- Job name
  '0 9 * * *',      -- Schedule (9:00 AM daily)
  $$
  select
    net.http_get(
      url:='YOUR_APP_URL/api/cron/daily-reminder',
      headers:='{"Authorization": "Bearer YOUR_CRON_SECRET"}'::jsonb
    ) as request_id;
  $$
);

-- To check scheduled jobs:
-- select * from cron.job;

-- To unschedule:
-- select cron.unschedule('daily-reminder');
