pipeline {
    agent any

    environment {
        DOCKER_CREDENTIALS_ID = 'docker-hub-token' // Update this with the actual Jenkins credentials ID
        AWS_ACCESS_KEY_ID = credentials('aws-access-key') // Update this with the actual Jenkins credentials ID
        AWS_SECRET_ACCESS_KEY = credentials('aws-secret-access-key')
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
                    bat 'docker-compose -f docker-compose.yml build'
                }
            }
        }

        stage('Push Docker Images') {
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: DOCKER_CREDENTIALS_ID, usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                        // Login to Docker Hub securely
                        bat "echo %DOCKER_PASS% | docker login -u %DOCKER_USER% --password-stdin"
                        
                        // Push the images to Docker Hub
                        bat 'docker-compose -f docker-compose.yml push'
                    }
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
                        
                        // Capture the IP address from terraform output - fixed
                        def output = bat(script: 'terraform output -raw server_ip', returnStdout: true).trim()
                        // Extract just the IP address from the output
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
                    dir('ansible') {  // Navigate to ansible directory
                        // Copy key to WSL's own filesystem for proper permissions
                        bat 'powershell -Command "wsl -d Ubuntu -- mkdir -p ~/ansible-keys"'
                        bat 'powershell -Command "wsl -d Ubuntu -- cp /mnt/c/Users/MSI/Desktop/CV/SahanDevKeyPair.pem ~/ansible-keys/"'
                        bat 'powershell -Command "wsl -d Ubuntu -- chmod 600 ~/ansible-keys/SahanDevKeyPair.pem"'
                        
                        // Create a new inventory file with the correct IP - fixing UTF-8 BOM issue
                        bat 'powershell -Command "wsl -d Ubuntu -- echo -n \"[web]\" > inventory.ini"'
                        bat "powershell -Command \"wsl -d Ubuntu -- echo -n \\\"\\n${env.SERVER_IP} ansible_user=ec2-user ansible_ssh_private_key_file=~/ansible-keys/SahanDevKeyPair.pem ansible_python_interpreter=/usr/bin/python3\\\" >> inventory.ini\""
                        
                        // Wait for SSH to become available (EC2 instances take time to initialize)
                        bat 'powershell -Command "Start-Sleep -s 60"' // Increased to 60 seconds
                        
                        // Display the inventory file for debugging
                        bat 'powershell -Command "wsl -d Ubuntu -- cat inventory.ini"'

                        // Test SSH connectivity with the new key location
                        bat "powershell -Command \"wsl -d Ubuntu -- ssh -i ~/ansible-keys/SahanDevKeyPair.pem -o StrictHostKeyChecking=no -o ConnectionAttempts=5 -o ConnectTimeout=60 ec2-user@${env.SERVER_IP} echo Connection successful\""
                        
                        // Then run ansible with the updated inventory - using -e to pass parameters
                        bat "powershell -Command \"wsl -d Ubuntu -- ansible-playbook -i inventory.ini setup.yml -vvv\""
                    }
                }
            }
        }

        stage('Pull Docker Images and Run Containers') {
            steps {
                script {
                    // Pull Docker images from Docker Hub to the deployment environment
                    bat 'docker-compose -f docker-compose.yml pull'

                    // Run the containers using the pulled images
                    bat 'docker-compose -f docker-compose.yml up -d'  // Use -d for detached mode
                }
            }
        }
        
        
    }
}
