# Use a base image with Node.js (or the backend language of your choice)
FROM node:latest

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install -g npm@latest

# Copy all project files
COPY . .

# Expose the backend port (change according to your setup)
EXPOSE 5000

# Start the backend service
CMD ["npm", "run", "dev"]
