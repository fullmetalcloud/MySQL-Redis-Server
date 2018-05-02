FROM web_base

RUN npm install mysql redis express --save

COPY ./dbserver.js /app/dbserver.js
COPY ./init_script_dbserver.sh /app/init_script_dbserver
COPY ./dbserver-test.json /app/dbserver-test.json

CMD ["bash", "/app/init_script_dbserver"]