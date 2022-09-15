# Installation and Uninstallation
```
export TOKEN=YOUR_TOKEN_HERE
```

## New k3s Cluster
```
curl -sfL https://get.k3s.io | sh -s - server \
--token=$TOKEN \
--tls-san k.lab.mi --tls-san k --tls-san kube --tls-san kube.lab.mi --tls-san k3s --tls-san k3s.lab.mi --tls-san 192.168.7.1 \
--disable traefik --disable servicelb \
--kube-controller-manager-arg bind-address=0.0.0.0 --kube-proxy-arg metrics-bind-address=0.0.0.0 --kube-scheduler-arg bind-address=0.0.0.0 --etcd-expose-metrics true \
--cluster-init
```

## Join k3s Cluster as another Master (with etcd and control plane)
```
curl -sfL https://get.k3s.io | sh -s - server \
--token=$TOKEN \
--tls-san k.lab.mi --tls-san k --tls-san kube --tls-san kube.lab.mi --tls-san k3s --tls-san k3s.lab.mi --tls-san 192.168.7.1 \
--server https://k.lab.mi:6443/ \
--disable traefik --disable servicelb \
--kube-controller-manager-arg bind-address=0.0.0.0 --kube-proxy-arg metrics-bind-address=0.0.0.0 --kube-scheduler-arg bind-address=0.0.0.0 --etcd-expose-metrics true

#--disable-scheduler
#--no-deploy traefik,servicelb
```

## Install Agents (worker nodes)
```
#/usr/local/bin/k3s-agent-uninstall.sh && \
curl -sfL https://get.k3s.io | sh -s - agent \
--token=$TOKEN \
--server https://k.lab.mi:6443/
```

## Uninstall to reinstall (without redownloading binary)
```
cp /usr/local/bin/k3s /usr/local/bin/k3s.bak
/usr/local/bin/k3s-uninstall.sh
cp /usr/local/bin/k3s.bak /usr/local/bin/k3s
reboot
```

## Uninstall Completely
```
/usr/local/bin/k3s-uninstall.sh
```

## Just kill all containers of a Node
```
k3s-killall.sh
```

## Notes:
1. On the pi i got the following error once it ran too many containers : `"Failed to allocate directory watch: Too many open files"`
do [this](https://forum.proxmox.com/threads/failed-to-allocate-directory-watch-too-many-open-files.28700/) when making an automated installation.
I did the following (x4):
```
sysctl fs.inotify.max_user_instances=512
sysctl fs.inotify.max_queued_events=65536
sysctl fs.inotify.max_user_watches=119720
```

2. Using etcdctl
([Source](https://rancher.com/docs/k3s/latest/en/advanced/#using-etcdctl))
```
VERSION="v3.5.0"
curl -L https://github.com/etcd-io/etcd/releases/download/${VERSION}/etcd-${VERSION}-linux-amd64.tar.gz --output etcdctl-linux-amd64.tar.gz
tar -zxvf etcdctl-linux-amd64.tar.gz --strip-components=1 -C /usr/local/bin etcd-${VERSION}-linux-amd64/etcdctl
etcdctl --cacert=/var/lib/rancher/k3s/server/tls/etcd/server-ca.crt --cert=/var/lib/rancher/k3s/server/tls/etcd/client.crt --key=/var/lib/rancher/k3s/server/tls/etcd/client.key version

```

# Random Junk
```
curl -sfL https://get.k3s.io | sh -s - server \
--cluster-reset \
--cluster-reset-restore-path=file:///var/lib/rancher/k3s/server/db/snapshots/etcd-snapshot-lab1kube3v-1657454460

curl -sfL https://get.k3s.io | sh -s - server \
--token=$TOKEN \
--tls-san k.lab.mi --tls-san k.lab.mi --tls-san kube --tls-san kube.lab.mi --tls-san labXkubeX --tls-san labXkubeX.lab.mi --tls-san k3s --tls-san k3s.lab.mi --tls-san 192.168.7.1 \
--disable traefik --disable servicelb \
--kube-controller-manager-arg bind-address=0.0.0.0 --kube-proxy-arg metrics-bind-address=0.0.0.0 --kube-scheduler-arg bind-address=0.0.0.0 --etcd-expose-metrics true \
--cluster-init

https://github.com/k3s-io/k3s/issues/1160
kubectl -n kube-system delete helmcharts.helm.cattle.io traefik
systemctl stop k3s
'nano /etc/systemd/system/k3s.service' and add "'--disable=traefik' \"
systemctl daemon-reload
mv /var/lib/rancher/k3s/server/manifests/traefik.yaml /var/lib/rancher/k3s/server/manifests/traefik.yaml.skip
systemctl start k3s
```