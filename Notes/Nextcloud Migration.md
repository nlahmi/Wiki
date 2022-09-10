
## Backup
```
mysqldump --single-transaction --default-character-set=utf8mb4 -h localhost -u dbadmin -pNxguVUX2jUhJnYxL nextcloud > nextcloud-sqlbkp_`date +"%Y%m%d"`.bak
```

## Restore
Edit the backup file - change the line that looks like `SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '586365d0-0500-11ec-b20e-020c29bab582:1-18095638';` to `SET @@GLOBAL.GTID_PURGED=""`. Then:

```
kubectl cp "./nextcloud-sqlbkp_20220910.bak" nextcloud-ffbc5d4c-cgww8:/tmp/

mysql -h localhost -u root -p6y0VpJFW6izty980mHpW -e "DROP DATABASE nextcloud"
mysql -h localhost -u root -p6y0VpJFW6izty980mHpW -e "CREATE DATABASE nextcloud CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci"
mysql -h localhost -u root -p6y0VpJFW6izty980mHpW nextcloud < /tmp/nextcloud-sqlbkp_20220910.bak
```
