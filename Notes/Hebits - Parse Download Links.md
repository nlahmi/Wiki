SearchAll
```
"torrents.php?action=download&amp;id=79617&amp;authkey=c26f7c47e48c76c5d151c7142ca56d8d&amp;torrent_pass=a8e13746587e97b75a6bdc35ccd26b7a"
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