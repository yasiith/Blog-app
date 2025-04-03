pipeline {
    agent any

    environment {
        DOCKER_CREDENTIALS_ID = 'docker-hub-token'
        AWS_ACCESS_KEY_ID = credentials('aws-access-key')
        AWS_SECRET_ACCESS_KEY = credentials('aws-secret-access-key')
        DOCKER_USER = credentials('docker-hub-token').username
        DOCKER_PASS = credentials('docker-hub-token').password
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
                    bat "set DOCKER_USER=${DOCKER_USER}&& docker-compose -f docker-compose.yml build"
                }
            }
        }

        stage('Push Docker Images') {
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: DOCKER_CREDENTIALS_ID, usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                        bat "echo %DOCKER_PASS% | docker login -u %DOCKER_USER% --password-stdin"
                        bat "set DOCKER_USER=%DOCKER_USER%&& docker-compose -f docker-compose.yml push"
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
                        withCredentials([usernamePassword(credentialsId: DOCKER_CREDENTIALS_ID, usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                            // Set environment variables for Ansible
                            bat "set SERVER_IP=${env.SERVER_IP}&& set DOCKER_USER=%DOCKER_USER%&& set DOCKER_PASS=%DOCKER_PASS%"
                            
                            // Copy key to WSL's own filesystem for proper permissions
                            bat 'powershell -Command "wsl -d Ubuntu -- mkdir -p ~/ansible-keys"'
                            bat 'powershell -Command "wsl -d Ubuntu -- cp /mnt/c/Users/MSI/Desktop/CV/SahanDevKeyPair.pem ~/ansible-keys/"'
                            bat 'powershell -Command "wsl -d Ubuntu -- chmod 600 ~/ansible-keys/SahanDevKeyPair.pem"'
                            
                            // Create inventory file
                            bat 'powershell -Command "wsl -d Ubuntu -- echo -n \"[web]\" > inventory.ini"'
                            bat "powershell -Command \"wsl -d Ubuntu -- echo -n \\\"\\n${env.SERVER_IP} ansible_user=ec2-user ansible_ssh_private_key_file=~/ansible-keys/SahanDevKeyPair.pem ansible_python_interpreter=/usr/bin/python3\\\" >> inventory.ini\""
                            
                            // Wait for SSH to become available
                            bat 'powershell -Command "Start-Sleep -s 60"'
                            
                            // Run ansible with environment variables passed through
                            bat "powershell -Command \"wsl -d Ubuntu -- DOCKER_USER=%DOCKER_USER% DOCKER_PASS=%DOCKER_PASS% ansible-playbook -i inventory.ini setup.yml -e 'server_ip=${env.SERVER_IP}' -vvv\""
                        }
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
