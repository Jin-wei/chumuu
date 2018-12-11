#!/bin/bash
# backup
scp $1:/var/lib/jenkins/jobs/$2/workspace/dist.tar.gz .
sudo rm -r /opt/trumenu/dist_old || true
sudo cp -r /opt/trumenu/dist /opt/trumenu/dist_old || true
sudo rm -r /opt/trumenu/dist || true
tar -zxvf /root/dist.tar.gz -C /opt/trumenu
sudo chown trumenu:trumenu -R /opt/trumenu/dist
# for restart the service
sudo stop trumenu || true
sudo start trumenu