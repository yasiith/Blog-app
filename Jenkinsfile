pipeline {
    agent any

    environment {
        DOCKER_CREDENTIALS_ID = 'docker-hub-token'
        AWS_ACCESS_KEY_ID = credentials('aws-access-key')
        AWS_SECRET_ACCESS_KEY = credentials('aws-secret-access-key')
        DOCKER_CREDS = credentials('docker-hub-token')
    }

    stages {
        stage('Clone Repository') {
            steps {
                git branch: 'main', url: 'https://github.com/yasiith/Blog-app.git'
            }
        }

        stage('Build Docker Images') {
            steps {
                script {
                    bat "set DOCKER_USER=${DOCKER_CREDS_USR}&& docker-compose -f docker-compose.yml build"
                }
            }
        }

        stage('Push Docker Images') {
            steps {
                script {
                    bat "echo ${DOCKER_CREDS_PSW} | docker login -u ${DOCKER_CREDS_USR} --password-stdin"
                    bat "set DOCKER_USER=${DOCKER_CREDS_USR}&& docker-compose -f docker-compose.yml push"
                }
            }
        }

        stage('Terraform EC2 Instance') {
            steps {
                script {
                    dir('terraform') {
                        bat 'terraform init'
                        bat 'terraform plan -out=tfplan'
                        bat 'terraform apply -auto-approve'
                        
                        def output = bat(script: 'terraform output -raw server_ip', returnStdout: true).trim()
                        def server_ip = output.readLines().last()
                        env.SERVER_IP = server_ip
                        echo "Set SERVER_IP to ${env.SERVER_IP}"
                    }
                }
            }
        }

        stage('Ansible Deployment') {
            steps {
                script {
                    dir('ansible') {
                        // Set environment variables for Ansible
                        bat "set SERVER_IP=${env.SERVER_IP}&& set DOCKER_USER=${DOCKER_CREDS_USR}&& set DOCKER_PASS=${DOCKER_CREDS_PSW}"
                        
                        // Copy key to WSL's own filesystem for proper permissions
                        bat 'powershell -Command "wsl -d Ubuntu -- mkdir -p ~/ansible-keys"'
                        bat 'powershell -Command "wsl -d Ubuntu -- cp /mnt/c/Users/MSI/Desktop/CV/SahanDevKeyPair.pem ~/ansible-keys/"'
                        bat 'powershell -Command "wsl -d Ubuntu -- chmod 600 ~/ansible-keys/SahanDevKeyPair.pem"'
                        
                        // Create inventory file - FIXED
                        bat 'powershell -Command "wsl -d Ubuntu -- bash -c \'echo \"[web]\" > inventory.ini\'"'
                        bat "powershell -Command \"wsl -d Ubuntu -- bash -c 'echo \"${env.SERVER_IP} ansible_user=ec2-user ansible_ssh_private_key_file=~/ansible-keys/SahanDevKeyPair.pem ansible_python_interpreter=/usr/bin/python3\" >> inventory.ini'\""
                        
                        // Print inventory file for debugging
                        bat 'powershell -Command "wsl -d Ubuntu -- cat inventory.ini"'
                        
                        // Create a separate wait-for-ssh script file
                        bat "powershell -Command \"wsl -d Ubuntu -- bash -c 'cat > wait-for-ssh.sh << EOF\\n#!/bin/bash\\nMAX_ATTEMPTS=30\\nCOUNTER=0\\necho \"Waiting for SSH connection to ${env.SERVER_IP}...\"\\nwhile [ \\$COUNTER -lt \\$MAX_ATTEMPTS ]; do\\n  COUNTER=\\$((COUNTER+1))\\n  echo \"Attempt \\$COUNTER of \\$MAX_ATTEMPTS\"\\n  ssh -i ~/ansible-keys/SahanDevKeyPair.pem -o ConnectTimeout=5 -o StrictHostKeyChecking=no -o BatchMode=yes ec2-user@${env.SERVER_IP} exit 2>/dev/null\\n  if [ \\$? -eq 0 ]; then\\n    echo \"SSH connection successful!\"\\n    exit 0\\n  fi\\n  echo \"Waiting 5 seconds before next attempt...\"\\n  sleep 5\\ndone\\necho \"Failed to establish SSH connection after \\$MAX_ATTEMPTS attempts\"\\nexit 1\\nEOF'\""
                        
                        // Make the script executable
                        bat 'powershell -Command "wsl -d Ubuntu -- chmod +x wait-for-ssh.sh"'
                        
                        // Run the script to wait for SSH
                        bat 'powershell -Command "wsl -d Ubuntu -- ./wait-for-ssh.sh"'
                        
                        // Run ansible with environment variables passed through
                        bat "powershell -Command \"wsl -d Ubuntu -- DOCKER_USER=${DOCKER_CREDS_USR} DOCKER_PASS=${DOCKER_CREDS_PSW} ansible-playbook -i inventory.ini setup.yml -e 'server_ip=${env.SERVER_IP}' -vvv\""
                    }
                }
            }
        }

        stage('Deploy Application') {
            steps {
                script {
                    dir('ansible') {
                        // Copy docker-compose.yml to remote server
                        bat "powershell -Command \"wsl -d Ubuntu -- scp -i ~/ansible-keys/SahanDevKeyPair.pem -o StrictHostKeyChecking=no ../docker-compose.yml ec2-user@${env.SERVER_IP}:/home/ec2-user/\""
                        
                        // Install Docker Compose if not already installed
                        bat "powershell -Command \"wsl -d Ubuntu -- ssh -i ~/ansible-keys/SahanDevKeyPair.pem -o StrictHostKeyChecking=no ec2-user@${env.SERVER_IP} 'sudo yum install -y docker && sudo systemctl start docker && sudo systemctl enable docker && sudo curl -L \\\"https://github.com/docker/compose/releases/download/v2.22.0/docker-compose-linux-x86_64\\\" -o /usr/local/bin/docker-compose && sudo chmod +x /usr/local/bin/docker-compose'\""
                        
                        // Deploy containers using the installed Docker Compose
                        bat "powershell -Command \"wsl -d Ubuntu -- ssh -i ~/ansible-keys/SahanDevKeyPair.pem -o StrictHostKeyChecking=no ec2-user@${env.SERVER_IP} 'cd /home/ec2-user && sudo DOCKER_USER=${DOCKER_CREDS_USR} SERVER_IP=${env.SERVER_IP} /usr/local/bin/docker-compose -f docker-compose.yml pull && sudo DOCKER_USER=${DOCKER_CREDS_USR} SERVER_IP=${env.SERVER_IP} /usr/local/bin/docker-compose -f docker-compose.yml up -d'\""
                        
                        // Verify deployment
                        bat "powershell -Command \"wsl -d Ubuntu -- ssh -i ~/ansible-keys/SahanDevKeyPair.pem -o StrictHostKeyChecking=no ec2-user@${env.SERVER_IP} 'sudo docker ps'\""
                    }
                }
            }
        }
        
        stage('Deployment Success') {
            steps {
                script {
                    echo "===================================================="
                    echo "Application deployed successfully to: http://${env.SERVER_IP}"
                    echo "===================================================="
                    echo "Backend API URL: http://${env.SERVER_IP}:5000"
                    echo "===================================================="
                }
            }
        }
    }
}
