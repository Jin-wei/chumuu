1.  ssh-agent -s
2.  eval $(ssh-agent -s)
3.  ssh-add /root/ssl/aliyun  (need password after this command)
4.  git pull
5.  forever restart main.js
