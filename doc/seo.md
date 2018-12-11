1.	Install pre-render server
git clone https://github.com/prerender/prerender.git
cd prerender
npm install
node server.js

2.	Test pre-render server
http://localhost:3000/https://www.google.com/

3.	Test pre-render server on tru-menu
http://localhost:8080/top_dish?_escaped_fragment_

4. command for generate sitemap.xml
cd ~/bizwise/src/tool (directory could be different on your local)
node sitemap-generator-new.js
