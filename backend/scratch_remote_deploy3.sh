cd /var/www/driver-ui/backend || exit 1
echo "---GIT PULL---"
cd /var/www/driver-ui && git pull origin main 2>&1 | tail -20
cd /var/www/driver-ui/backend || exit 1
echo "---MIGRATION (add startDetail/endDetail)---"
node migrate-add-fake-area.js 2>&1 | tail -20
echo "---SEED (theo anh 2)---"
node seed-fake-notifications.js 2>&1 | tail -20
echo "---PM2 RESTART---"
pm2 restart driver-backend --update-env 2>&1 | tail -20
echo "---DONE---"
