# Use a base image for frontend
FROM node:latest

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install -g npm@latest

# Copy project files
COPY . .

# Build the frontend
RUN npm run build

# Install a simple web server and serve the frontend
RUN npm install -g serve
CMD ["serve", "-s", "build", "-l", "3000"]
CMD ["npm", "run", "dev"]

