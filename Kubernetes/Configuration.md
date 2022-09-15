## Infrastructure

### Refernces
[https://github.com/longhorn/longhorn/issues/2714](https://github.com/longhorn/longhorn/issues/2714) <br>
[https://stackoverflow.com/questions/61616203/nginx-ingress-controller-failed-calling-webhook](https://stackoverflow.com/questions/61616203/nginx-ingress-controller-failed-calling-webhook)

### Fix CoreDNS (test first if you ever start fresh, as I may have made some prior hard-coded modifications)
```
kubectl create configmap coredns-custom -n kube-system --from-file=coredns/configmap/ --dry-run=client -o yaml | kubectl apply -f -
kubectl rollout restart deploy -n kube-system
```

### Custom ca-certificates.cer
```
kubectl create configmap ca-cert --from-file=common/ca-certificates.cer --dry-run=client -o yaml -n default | kubectl apply -f -
kubectl create configmap ca-cert --from-file=common/ca-certificates.cer --dry-run=client -o yaml -n devops | kubectl apply -f -
```

### nginx
```
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.3.0/deploy/static/provider/cloud/deploy.yaml
```

### Authelia
<<Warn("Don't install authelia.")>>
```
helm repo add authelia https://charts.authelia.com
helm repo update
helm install authelia authelia/authelia --version 0.8.38
```

### metallb
```
kubectl delete -f https://raw.githubusercontent.com/metallb/metallb/v0.13.5/config/manifests/metallb-native.yaml
kubectl apply -f metallb/resources.yml
```

### Longhorn
```
kubectl apply -f https://raw.githubusercontent.com/longhorn/longhorn/v1.3.1/deploy/longhorn.yaml
kubectl create configmap longhorn-default-setting -n longhorn-system --from-file=longhorn/configmap/ --dry-run=client -o yaml | kubectl apply -f -
kubectl rollout restart deploy -n longhorn-system
kubectl apply -f longhorn
# From here you should restore volumes from backup if needed
```

### step-ca
```
kubectl apply -Rf step-ca
```

### cert-manager
```
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.8.2/cert-manager.yaml
kubectl apply -f .\cert-manager\ca-cert.yml
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
kubectl create secret generic registry-cert --from-file=./registry.k.crt  --from-file=./registry.k.key
```

### Devops
```
kubectl apply -Rf .\devops\
```

### Logging
https://helm.sh/docs/intro/using_helm/#customizing-the-chart-before-installing
https://github.com/techno-tim/launchpad/tree/master/kubernetes/kube-prometheus-stack
```
kubectl apply -f logging/namespace.yml
#kubectl create secret generic grafana-admin-credentials --from-literal=admin-user=admin --from-literal=admin-password=<PASSWORD HERE!> -n logging
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
helm install -f logging/values.yml prometheus prometheus-community/kube-prometheus-stack -n logging
kubectl apply -f logging/ingress.yml

helm upgrade -f logging/values.yml prometheus prometheus-community/kube-prometheus-stack -n logging
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
