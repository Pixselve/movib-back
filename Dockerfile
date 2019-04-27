# First stage
FROM node:10-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
# Second stage
FROM node:10-alpine
WORKDIR /usr/src/app
COPY package*.json ./

RUN npm install --only=production

COPY --from=0 /usr/src/app/dist ./dist
COPY --from=0 /usr/src/app/src/.env ./dist

ENV PORT 8080
ENV HOST 0.0.0.0

CMD npm run start
