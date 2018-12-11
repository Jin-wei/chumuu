#!/bin/bash
# backup
sudo rm -r /opt/trumenu/dist_old || true
sudo cp -r /opt/trumenu/dist /opt/trumenu/dist_old || true
sudo rm -r /opt/trumenu/dist || true
scp -r root@45.33.38.191:/var/lib/jenkins/jobs/Production_trumenu/workspace/dist /opt/trumenu
#copy sitemap back
cp -f /opt/trumenu/dist_old/public/web/customer/sitemap.xml /opt/trumenu/dist/public/web/customer || true
sudo chown trumenu:trumenu -R /opt/trumenu/dist
# for restart the service
sudo stop trumenu || true
sudo start trumenu