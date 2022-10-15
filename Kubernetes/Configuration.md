## Infrastructure

### Refernces
[https://github.com/longhorn/longhorn/issues/2714](https://github.com/longhorn/longhorn/issues/2714) <br>
[https://stackoverflow.com/questions/61616203/nginx-ingress-controller-failed-calling-webhook](https://stackoverflow.com/questions/61616203/nginx-ingress-controller-failed-calling-webhook)

### Install Node Feature Discovery (NFD) and Intel GPU Drivers
```
kubectl apply -k https://github.com/kubernetes-sigs/node-feature-discovery/deployment/overlays/default?ref=v0.11.2

# Start NFD with GPU related configuration changes
kubectl apply -k https://github.com/intel/intel-device-plugins-for-kubernetes/deployments/nfd/overlays/gpu

# Create NodeFeatureRules for detecting GPUs on nodes
kubectl apply -k https://github.com/intel/intel-device-plugins-for-kubernetes/deployments/nfd/overlays/node-feature-rules?ref=v0.24.0

# Create GPU plugin daemonset
kubectl apply -k https://github.com/intel/intel-device-plugins-for-kubernetes/deployments/gpu_plugin/overlays/nfd_labeled_nodes?ref=v0.24.0

# Create GPU plugin daemonset with Fractional Resources support
#kubectl apply -k https://github.com/intel/intel-device-plugins-for-kubernetes/deployments/gpu_plugin/overlays/fractional_resources?ref=v0.24.0
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
```

### Custom ca-certificates.cer
```
kubectl create configmap ca-cert --from-file=common/ca-certificates.crt --dry-run=client -o yaml -n default | kubectl apply -f -
kubectl create configmap ca-cert --from-file=common/ca-certificates.crt --dry-run=client -o yaml -n devops | kubectl apply -f -
kubectl create configmap ca-cert --from-file=common/ca-certificates.crt --dry-run=client -o yaml -n logging | kubectl apply -f -
kubectl create configmap ca-cert --from-file=common/ca-certificates.crt --dry-run=client -o yaml -n authentik | kubectl apply -f -
kubectl create configmap ca-cert --from-file=common/ca-certificates.crt --dry-run=client -o yaml -n cert-manager | kubectl apply -f -
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
```
Also need to patch the `cert-manager` deployment to mount `ca-cert` to `/etc/ssl/certs`
```
volumeMounts:
  - name: ca
    mountPath: /etc/ssl/certs
```
```
volumes:
  - name: ca
    configMap:
      name: ca-cert
```
Than
```
kubectl apply -f .\cert-manager\issuer.yml
```

### registry
After this, gradually restart all k3s services to apply custom registry
```
kubectl apply -Rf container-registry
```

### Devops
```
kubectl apply -Rf devops
```

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

## Apps
### Gollum
```
kubectl create secret generic gollum-git-creds --from-file=gollum/secret/ --dry-run=client -o yaml | kubectl apply -f -
kubectl create configmap gollum-cm --from-file=gollum/configmap/ --dry-run=client -o yaml | kubectl apply -f -
kubectl apply -f gollum
```

### NextCloud
(Hopefully you won't have to) Follow the instrcutions at [this page](/Notes/Nextcloud%20Migration.md), and also the official Backup/Restore/Migration docs. But to deploy:
```
kubectl apply -f nextcloud
```

### Heimdall
```
kubectl apply -f heimdall
```

### qbittorrent
```
kubectl apply -f qbittorrent
```

### SpotiLike
```
kubectl apply -f spotilike
```

### Mealie
```
kubectl apply -f mealie
```

### HRConvert2
```
kubectl create configmap hrconvert-config --from-file=hrconvert2/configmap/ --dry-run=client -o yaml | kubectl apply -f -
kubectl apply -f hrconvert2
```

### Cyberchef
```
kubectl apply -f cyberchef
```

### YoutubeDL
```
kubectl apply -f youtubedl
```

### your_spotify
```
kubectl create secret generic urspotify-secrets --from-file=urspotify/secret/ --dry-run=client -o yaml | kubectl apply -f -
kubectl apply -f urspotify
```

### Hebits Gift Collector (lightweight cron curl)
```
kubectl create secret generic hebits-secrets --from-file=hebits-gift/secret/ --dry-run=client -o yaml | kubectl apply -f -
kubectl apply -f hebits-gift
```
