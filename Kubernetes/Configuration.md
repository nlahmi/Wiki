## Infrastructure

### Refernces
[https://github.com/longhorn/longhorn/issues/2714](https://github.com/longhorn/longhorn/issues/2714) <br>
[https://stackoverflow.com/questions/61616203/nginx-ingress-controller-failed-calling-webhook](https://stackoverflow.com/questions/61616203/nginx-ingress-controller-failed-calling-webhook)

### Install Node Feature Discovery (NFD), Intel GPU Drivers and nVidia Operator
```
kubectl apply -k https://github.com/kubernetes-sigs/node-feature-discovery/deployment/overlays/default?ref=v0.11.2

# Shintel
# Start NFD with GPU related configuration changes
kubectl apply -k https://github.com/intel/intel-device-plugins-for-kubernetes/deployments/nfd/overlays/gpu
# Create NodeFeatureRules for detecting GPUs on nodes
kubectl apply -k https://github.com/intel/intel-device-plugins-for-kubernetes/deployments/nfd/overlays/node-feature-rules?ref=v0.24.0
# Create GPU plugin daemonset
kubectl apply -k https://github.com/intel/intel-device-plugins-for-kubernetes/deployments/gpu_plugin/overlays/nfd_labeled_nodes?ref=v0.24.0

# Create GPU plugin daemonset with Fractional Resources support
#kubectl apply -k https://github.com/intel/intel-device-plugins-for-kubernetes/deployments/gpu_plugin/overlays/fractional_resources?ref=v0.24.0

# NoVideo
helm repo add nvidia https://helm.ngc.nvidia.com/nvidia
helm repo update

helm upgrade --install -f gpu-operator/values.yml gpu-operator --create-namespace nvidia/gpu-operator -n gpu-operator
kubectl apply -f gpu-operator/timeslicing-configmap.yml

kubectl patch clusterpolicy/cluster-policy    -n gpu-operator --type merge    -p '{"spec": {"devicePlugin": {"config": {"name": "time-slicing-config", "default": "a100-40gb"}}}}'
```

Then, run the following on the host with the GPU (or consider a better solution) - [source](https://discourse.linuxserver.io/t/gpu-support-in-container/3139/16#:~:text=libnvidia%2Dencode%2D460%2Dserver):
```
apt update && apt install -y libnvidia-encode-515-server
```

### Label Nodes
Do this once all nodes are joined
```
kubectl label nodes lab1laptop1 lab1rpi1 nlahmi.connectivity/type=wifi
kubectl label nodes lab1kube1v lab1kube2v lab1kube3v nlahmi.connectivity/type=ethernet
```

### Create Custom Namespaces
```
kubectl create namespace devops
kubectl create namespace logging
kubectl create namespace cert-manager
kubectl create namespace authentik
kubectl create namespace portainer
kubectl create namespace diun
kubectl create namespace elastic
kubectl create namespace nfs-provisioner
kubectl create namespace democratic-csi
```

### Custom ca-certificates.cer
```
kubectl create configmap ca-cert --from-file=common/ca-certificates.crt --dry-run=client -o yaml -n default | kubectl apply -f -
kubectl create configmap ca-cert --from-file=common/ca-certificates.crt --dry-run=client -o yaml -n devops | kubectl apply -f -
kubectl create configmap ca-cert --from-file=common/ca-certificates.crt --dry-run=client -o yaml -n logging | kubectl apply -f -
kubectl create configmap ca-cert --from-file=common/ca-certificates.crt --dry-run=client -o yaml -n authentik | kubectl apply -f -
kubectl create configmap ca-cert --from-file=common/ca-certificates.crt --dry-run=client -o yaml -n cert-manager | kubectl apply -f -
kubectl create configmap ca-cert --from-file=common/ca-certificates.crt --dry-run=client -o yaml -n portainer | kubectl apply -f -
kubectl create configmap ca-cert --from-file=common/ca-certificates.crt --dry-run=client -o yaml -n diun | kubectl apply -f -
kubectl create configmap ca-cert --from-file=common/ca-certificates.crt --dry-run=client -o yaml -n elastic | kubectl apply -f -
kubectl create configmap ca-cert --from-file=common/ca-certificates.crt --dry-run=client -o yaml -n democratic-csi | kubectl apply -f -
```

### Fix CoreDNS
```
kubectl create configmap coredns-custom -n kube-system --from-file=coredns/configmap/ --dry-run=client -o yaml | kubectl apply -f -
kubectl rollout restart deploy/coredns -n kube-system
```

### nginx
```
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.3.1/deploy/static/provider/cloud/deploy.yaml
kubectl patch deployment ingress-nginx-controller -n ingress-nginx --patch-file ingress-nginx\deployment-patch.yml
```

### metallb
```
kubectl apply -f https://raw.githubusercontent.com/metallb/metallb/v0.13.5/config/manifests/metallb-native.yaml
# You may need to wait a few seconds here
kubectl apply -f metallb/resources.yml
```

### Longhorn
```
kubectl apply -f https://raw.githubusercontent.com/longhorn/longhorn/v1.3.1/deploy/longhorn.yaml
kubectl create configmap longhorn-default-setting -n longhorn-system --from-file=longhorn/configmap/ --dry-run=client -o yaml | kubectl apply -f -
kubectl rollout restart deploy -n longhorn-system
kubectl apply -f longhorn

# Disable the local-path StorageClass from being the default
kubectl patch storageclass local-path -p '{\"metadata\": {\"annotations\":{\"storageclass.kubernetes.io/is-default-class\":\"false\"}}}'
```
From here you should: 
1. Manually set up longhorn settings (or set it up to be automatic) according to the yaml file
2. Restore volumes from backup (Make sure to set Access Mode to RWX)
3. Ceate PV/PVC for all of them (Select Previous PVC)

### step-ca
```
kubectl apply -f step-ca
kubectl create secret generic step-secrets --from-file=step-ca/secret/ --dry-run=client -o yaml | kubectl apply -f -
kubectl create configmap step-config-cm --from-file=step-ca/configmap/config/ --dry-run=client -o yaml | kubectl apply -f -
kubectl create configmap step-certs-cm --from-file=step-ca/configmap/certs/ --dry-run=client -o yaml | kubectl apply -f -
```

### cert-manager
```
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.9.1/cert-manager.yaml
kubectl patch deployment cert-manager -n cert-manager --patch-file cert-manager\deployment-patch.yml
kubectl apply -f .\cert-manager\issuer.yml
```

### Devops
```
kubectl apply -Rf devops
```
#### registry
This is not necessary if you ran devops recursively
```
kubectl apply -Rf devops/container-registry
```
Then, gradually restart all k3s services to apply custom registry

### Logging
https://helm.sh/docs/intro/using_helm/#customizing-the-chart-before-installing
https://github.com/techno-tim/launchpad/tree/master/kubernetes/kube-prometheus-stack
```
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

kubectl apply -f logging
kubectl create secret generic grafana-secret --from-file=logging/secret/ --dry-run=client -o yaml -n logging | kubectl apply -f -
helm upgrade --install -f logging/values.yml prometheus prometheus-community/kube-prometheus-stack -n logging
```

### Authentik
```
kubectl apply -f authentik
kubectl create secret generic authentik-secrets --from-file=authentik/secret/ --dry-run=client -o yaml -n authentik | kubectl apply -f -

# Powershell Only
kubectl get namespace -o=custom-columns=NAME:.metadata.name | Select-Object -Skip 1 | foreach { kubectl create service externalname --external-name authentik-service.authentik.svc.cluster.local authentik-proxy-outpost -n $_ }
```

### Diun
```
kubectl apply -f diun
```

### NFS-Subdir-Provisioner
```
kubectl create namespace nfs-provisioner
helm repo add nfs-subdir-external-provisioner https://kubernetes-sigs.github.io/nfs-subdir-external-provisioner/
helm install nfs-provisioner -n nfs-provisioner nfs-subdir-external-provisioner/nfs-subdir-external-provisioner -f nfs-provisioner/values.yml
```

### Democratic-CSI
TrueNAS Pre:
1. Create a user (I named it csi with ID 9000) and give it sudo permissions
2. Go to console, then:
```
cli

account user query select=id,username,uid,sudo_nopasswd
account user update id=<id> sudo_nopasswd=true

# ctrl+d
# Confirm by
cat /usr/local/etc/sudoers
```

Run on all hosts:
```
# Install the following system packages
sudo apt-get install -y open-iscsi lsscsi sg3-utils multipath-tools scsitools

# Enable multipathing
sudo tee /etc/multipath.conf <<-'EOF'
defaults {
    user_friendly_names yes
    find_multipaths yes
}
blacklist {
    devnode "^sd[a-z0-9]+"
}
EOF

sudo systemctl enable multipath-tools.service
sudo service multipath-tools restart

# Ensure that open-iscsi and multipath-tools are enabled and running
sudo systemctl status multipath-tools
sudo systemctl enable open-iscsi.service
sudo service open-iscsi start
sudo systemctl status open-iscsi
```

To install on cluster:
```
helm repo add democratic-csi https://democratic-csi.github.io/charts/
helm repo update
helm search repo democratic-csi/

helm upgrade --install -f democratic-csi/values.yml democratic-csi democratic-csi/democratic-csi  --create-namespace -n democratic-csi
kubectl create secret generic democratic-csi-driver-config --from-file=democratic-csi/secret/ --dry-run=client -o yaml -n democratic-csi | kubectl apply -f -
kubectl rollout restart deployment -n democratic-csi democratic-csi-controller
```

## Apps
### Gollum
```
kubectl create secret generic gollum-git-creds --from-file=default/gollum/secret/ --dry-run=client -o yaml | kubectl apply -f -
kubectl create configmap gollum-cm --from-file=default/gollum/configmap/ --dry-run=client -o yaml | kubectl apply -f -
kubectl apply -f default/gollum
```

### NextCloud
(Hopefully you won't have to) Follow the instrcutions at [this page](/Notes/Nextcloud%20Migration.md), and also the official Backup/Restore/Migration docs. But to deploy:
```
kubectl apply -f default/nextcloud
```

### Heimdall
```
kubectl apply -f default/heimdall
```

### qbittorrent
```
kubectl apply -f default/qbittorrent
```

### SpotiLike
```
kubectl apply -f default/spotilike
```

### Mealie
```
kubectl apply -f default/mealie
```

### HRConvert2
```
kubectl create configmap hrconvert-config --from-file=default/hrconvert2/configmap/ --dry-run=client -o yaml | kubectl apply -f -
kubectl apply -f default/hrconvert2
```

### Cyberchef
```
kubectl apply -f default/cyberchef
```

### YoutubeDL
```
kubectl apply -f default/youtubedl
```

### your_spotify
```
kubectl create secret generic urspotify-secrets --from-file=default/urspotify/secret/ --dry-run=client -o yaml | kubectl apply -f -
kubectl apply -f default/urspotify
```

### Hebits Gift Collector (lightweight cron curl)
```
kubectl create secret generic hebits-secrets --from-file=default/hebits-gift/secret/ --dry-run=client -o yaml | kubectl apply -f -
kubectl apply -f default/hebits-gift
```

### LG Developer Mode Watcher (lightweight cron curl)
```
kubectl create secret generic devmode-watcher-secrets --from-file=default/devmode-watcher/secret/ --dry-run=client -o yaml | kubectl apply -f -
kubectl apply -f default/devmode-watcher
```

### ElasticSearch
```
# Elastic
kubectl apply -Rf elastic/elastic

# Jupyter
kubectl create configmap jupyter-config --from-file=elastic/jupyter/configmap/ --dry-run=client -o yaml -n elastic | kubectl apply -f -
kubectl apply -f elastic/jupyter
```
You than have to run `echo vm.max_map_count = 262144 >> /etc/sysctl.conf` on all nodes and restart them


### Kasm (Kali)
```
kubectl apply -f kasm
kubectl create secret generic kasm-kali-secret --from-file=kasm/kali/secret/ --dry-run=client -o yaml -n kasm | kubectl apply -f -
kubectl apply -f kasm/kali
```
