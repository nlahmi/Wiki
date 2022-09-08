### Shell into container
```
kubectl exec -it $(kubectl get pod -l app=qbittorrent -o name) -- /bin/sh
```

### Build (and Push) multi arch
```
docker buildx create --driver docker-container --platform linux/386,linux/amd64,linux/arm64,linux/arm/v7,linux/arm/v6 --name mybuilder --use
docker buildx build --platform linux/386,linux/amd64,linux/arm64,linux/arm/v7,linux/arm/v6 -t registry.k/n.lahmi/spotilike --push .
```

### Copy a folder into a container (and other way around)
```
kubectl cp --retries=10 ./ $(kubectl get pod -l app=step -o name):/home/step
kubectl cp --retries=10 pod:/config ./
```

### Force delete something
```
kubectl delete --grace-period=0 --force
```

### Restart all pods in a namespace
```
kubectl rollout restart deploy -n {NAMESPACE}
```

### Restart all namespaces
#### Powershell
```
kubectl get namespace -o=custom-columns=NAME:.metadata.name | Select-Object -Skip 1 | foreach { kubectl rollout restart deploy -n $_}
```
#### Bash (Untested)
```
kubectl rollout restart deploy -n `kubectl get namespace -o=custom-columns=NAME:.metadata.name`
```

### Delete all "Evicted" Pods (or other statuses as well (linux)
```
kubectl get pods | grep Evicted | awk '{print $1}' | xargs kubectl delete pod
kubectl get pods -n longhorn-system | grep Evicted | awk '{print $1}' | xargs kubectl delete pod -n longhorn-system
```

### misc
```
kubectl create deployment --image=nlahmi/spotilike spotilike
kubectl create ingress demo-localhost --class=nginx --rule=*.lab.mi/*=demo:80
kubectl create deployment --image=registry:2 registry
```
