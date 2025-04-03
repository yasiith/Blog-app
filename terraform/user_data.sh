#!/bin/bash

# Update and install dependencies
#sudo apt update -y
#sudo apt install -y docker.io docker-compose  

sudo yum update -y
sudo yum install -y docker

# Start Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Add user to the docker group (requires logout/login to take effect)
sudo usermod -aG docker ec2-user
echo "Please log out and log back in for Docker group changes to take effect."

# Secure Docker Hub login (Use manual login instead)
docker login -u "yasiith"

# Pull Docker images from Docker Hub
docker pull yasiith/blogapp:frontend
docker pull yasiith/blogapp:backend
docker pull sahanmihikalpa/blogapp:mongo

# Create a Docker network if it doesn't exist
docker network ls | grep mynetwork || docker network create mynetwork

# Run the backend container (Removed duplicate backend container run)
docker run -d --name backend_container --network mynetwork \
  -e MONGODB_URI="mongodb+srv://SahanM:Sahan2001@blogger.3xdjq.mongodb.net/?retryWrites=true&w=majority&appname=blogger" \
  -p 5000:5000 \
  yasiith/blogapp:backend

# Run the frontend container
docker run -d --name frontend_container --network mynetwork \
  -p 80:3000 \
  yasiith/blogapp:frontend
