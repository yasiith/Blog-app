pipeline {
    agent any

    environment {
        DOCKER_CREDENTIALS_ID = 'docker-hub-token'
        AWS_ACCESS_KEY_ID = credentials('aws-access-key')
        AWS_SECRET_ACCESS_KEY = credentials('aws-secret-access-key')
    }

    stages {
        stage('Clone Repository') {
            steps {
                git branch: 'main', url: 'https://github.com/yasiith/Blog-app.git'
            }
        }

        stage('Debug Environment') {
            steps {
                bat "dir"
                bat "dir backend"
                bat "dir next-blog-app"
                bat "type docker-compose.yml"
            }
        }

        stage('Build and Push Docker Images') {
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: DOCKER_CREDENTIALS_ID, usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                        // Login to Docker Hub securely
                        bat "echo %DOCKER_PASS% | docker login -u %DOCKER_USER% --password-stdin"
                        
                        // Build backend image
                        bat "docker build -t %DOCKER_USER%/blogapp:backend ./backend"
                        
                        // Build frontend image
                        bat "docker build -t %DOCKER_USER%/blogapp:frontend ./next-blog-app"
                        
                        // Push the images to Docker Hub
                        bat "docker push %DOCKER_USER%/blogapp:backend"
                        bat "docker push %DOCKER_USER%/blogapp:frontend"
                        
                        // Show pushed images for verification
                        bat "docker images"
                    }
                }
            }
        }

        stage('Terraform EC2 Instance') {
            steps {
                script {
                    dir('terraform') {
                        bat 'terraform init'
                        
                        // Check if state file exists and has the instance
                        def instanceExists = bat(script: 'terraform state list aws_instance.web', returnStatus: true) == 0
                        
                        if (instanceExists) {
                            echo "Instance exists, updating configuration..."
                            // Only update configuration, don't replace instance
                            bat 'terraform plan -out=tfplan -refresh-only'
                        } else {
                            echo "Creating new instance..."
                            bat 'terraform plan -out=tfplan'
                        }
                        
                        bat 'terraform apply -auto-approve tfplan'
                        
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
                    withCredentials([usernamePassword(credentialsId: DOCKER_CREDENTIALS_ID, usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                        dir('ansible') {
                            // Copy key to WSL's filesystem
                            bat 'powershell -Command "wsl -d Ubuntu -- mkdir -p ~/ansible-keys"'
                            bat 'powershell -Command "wsl -d Ubuntu -- cp /mnt/c/Users/MSI/Desktop/CV/SahanDevKeyPair.pem ~/ansible-keys/"'
                            bat 'powershell -Command "wsl -d Ubuntu -- chmod 600 ~/ansible-keys/SahanDevKeyPair.pem"'
                            
                            // Create inventory file with the correct IP
                            bat 'powershell -Command "wsl -d Ubuntu -- echo -n \"[web]\" > inventory.ini"'
                            bat "powershell -Command \"wsl -d Ubuntu -- echo -n \\\"\\n${env.SERVER_IP} ansible_user=ec2-user ansible_ssh_private_key_file=~/ansible-keys/SahanDevKeyPair.pem ansible_python_interpreter=/usr/bin/python3\\\" >> inventory.ini\""
                            
                            // Wait for SSH to become available
                            bat 'powershell -Command "Start-Sleep -s 60"'
                            
                            // Display inventory file for debugging
                            bat 'powershell -Command "wsl -d Ubuntu -- cat inventory.ini"'

                            // Test SSH connectivity
                            bat "powershell -Command \"wsl -d Ubuntu -- ssh -i ~/ansible-keys/SahanDevKeyPair.pem -o StrictHostKeyChecking=no -o ConnectionAttempts=5 -o ConnectTimeout=60 ec2-user@${env.SERVER_IP} echo Connection successful\""
                            
                            // Pass Docker username as extra vars to Ansible
                            bat "powershell -Command \"wsl -d Ubuntu -- ansible-playbook -i inventory.ini setup.yml -e 'docker_user=%DOCKER_USER% server_ip=${env.SERVER_IP}' -vvv\""
                        }
                    }
                }
            }
        }
    }
}
