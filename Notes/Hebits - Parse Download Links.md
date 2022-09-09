SearchAll
```
\"torrents.php\?action=download\S+?torrent_pass\=\w+\"
```

Take results to new file, than Replace:
```
.+?\"(.+?)\".+
https://hebits.net/\1
```

Replace (non regex):
```
&amp;
&
```