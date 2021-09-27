FROM node:14.17.2-stretch
WORKDIR '/app'
COPY ./package.json ./
RUN npm install
COPY . .
EXPOSE 80 443 8090 
CMD ["npm", "run", "start"]