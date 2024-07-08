#This sets the base image for the build stage. It uses the official Node.js image, version 20.9.0-alpine, as a starting point.
#Naming it as ‘build’ allows us to refer to this stage later in the Dockerfile.
FROM node:20.9.0-alpine AS base

#This instruction is like telling the container, “Hey, for the rest of the instructions,
#consider ‘/app’ as your main working directory.”
WORKDIR /app

#Copies the package.json and package-lock.json files from your local directory
#(where the Dockerfile is) to the ‘/app’ directory in the container.
COPY package*.json ./

RUN npm install

RUN npm install -g @angular/cli

#This command copies all files from your local directory to the ‘/app’ directory inside the container.
COPY . .

#This instruction sets the base image for the development stage.
FROM base AS dev
EXPOSE 4200
CMD ["npm", "run", "start"]

#-------------------
#This instruction sets the base image for the build stage.
FROM base AS build
RUN ng build

#Since we’ve successfully installed Angular CLI , let’s executes
#this command to build the Angular application in production mode.
#The resulting output will be stored in the ‘dist’ directory.

#So basically with this command we starts a new stage in the Dockerfile,
#using the official Nginx image as the base image for the runtime environment.
FROM nginx:1.25.1-alpine AS prod

#Copies the production-ready Angular application files from the build stage to
#the `/usr/share/nginx/html`directory inside the Nginx container.
COPY --from=build /app/dist/sc_dashboard/browser /usr/share/nginx/html
COPY ./deployment/config/nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
