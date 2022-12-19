On a linux machine with Docker installed, run:
```
git clone https://github.com/jellyfin/jellyfin-webos.git
wget https://github.com/jellyfin/jellyfin-webos/releases/download/v1.1.0/org.jellyfin.webos_1.1.0_all.ipk  # Check for newer version
```

Make sure the Developer app on the TV is installed, get its IP and Passphrase
```
./dev.sh ares-setup-device -a HomeTV -i "host=192.168.6.117"
./dev.sh ares-novacom --device HomeTV --getkey
```
Type your passphrase, then:
```
# To verify connectivity
./dev.sh ares-device-info -d HomeTV

# To install app
./dev.sh ares-install -d HomeTV org.jellyfin.webos_*.ipk

# To launch app
./dev.sh ares-launch -d HomeTV org.jellyfin.webos
```

Taken from: [https://github.com/jellyfin/jellyfin-webos](https://github.com/jellyfin/jellyfin-webos)

---
To keep it refreshing, I set up a cron on k8s, using this basic URL: `https://developer.lge.com/secure/ResetDevModeSession.dev?sessionToken=`
which you can check by: `https://developer.lge.com/secure/CheckDevModeSession.dev?sessionToken=`
the session token is taken from the file: `cat /var/luna/preferences/devmode_enabled`. You can get it by SSH-ing to a developer-mode-enabled tv.
[Source](https://www.reddit.com/r/jellyfin/comments/ryowwb/i_created_a_simple_script_to_renew_the_devmode_on/)

