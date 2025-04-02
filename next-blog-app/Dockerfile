# Use a base image for frontend
FROM node:latest

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy project files
COPY . .

# Build the frontend
RUN npm run build

# Expose the port (if needed)
EXPOSE 3000

# Run the app in production mode
CMD ["npm", "run", "start"]
