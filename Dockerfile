FROM node:alpine

RUN apk update && apk upgrade && \
    apk add --no-cache bash git

WORKDIR /usr/src/app
COPY package.json .
RUN yarn install

# Bundle app source
COPY . .

ENV TZ=America/Sao_Paulo
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

EXPOSE 3000

# Run the command on container startup
CMD ["yarn", "app"]
