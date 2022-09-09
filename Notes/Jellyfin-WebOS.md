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
./dev.sh ares-launch -d tv org.jellyfin.webos
```

Taken from: [https://github.com/jellyfin/jellyfin-webos](https://github.com/jellyfin/jellyfin-webos)
