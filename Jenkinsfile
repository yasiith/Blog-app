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
                    withCredentials([usernamePassword(credentialsId: DOCKER_CREDENTIALS_ID, usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                        dir('ansible') {  // Navigate to ansible directory
                            // Copy key to WSL's own filesystem for proper permissions
                            bat 'powershell -Command "wsl -d Ubuntu -- mkdir -p ~/ansible-keys"'
                            bat 'powershell -Command "wsl -d Ubuntu -- cp /mnt/c/Users/MSI/Desktop/CV/SahanDevKeyPair.pem ~/ansible-keys/"'
                            bat 'powershell -Command "wsl -d Ubuntu -- chmod 600 ~/ansible-keys/SahanDevKeyPair.pem"'
                            
                            // Create inventory file without BOM using a temporary file and cat
                            bat 'powershell -Command "wsl -d Ubuntu -- rm -f inventory.ini temp_inventory.txt"'
                            bat 'powershell -Command "wsl -d Ubuntu -- echo [web] > temp_inventory.txt"'
                            bat "powershell -Command \"wsl -d Ubuntu -- echo ${env.SERVER_IP} ansible_user=ec2-user ansible_ssh_private_key_file=~/ansible-keys/SahanDevKeyPair.pem ansible_python_interpreter=/usr/bin/python3 >> temp_inventory.txt\""
                            bat 'powershell -Command "wsl -d Ubuntu -- cat temp_inventory.txt > inventory.ini"'
                            bat 'powershell -Command "wsl -d Ubuntu -- rm temp_inventory.txt"'
                            
                            // Wait for SSH to become available (EC2 instances take time to initialize)
                            bat 'powershell -Command "Start-Sleep -s 60"' // 60 seconds wait time
                            
                            // Display the inventory file for debugging
                            bat 'powershell -Command "wsl -d Ubuntu -- cat inventory.ini"'

                            // Test SSH connectivity with the new key location
                            bat "powershell -Command \"wsl -d Ubuntu -- ssh -i ~/ansible-keys/SahanDevKeyPair.pem -o StrictHostKeyChecking=no -o ConnectionAttempts=5 -o ConnectTimeout=60 ec2-user@${env.SERVER_IP} echo Connection successful\""
                            
                            // Create a variables file to pass Docker credentials to Ansible
                            bat 'powershell -Command "wsl -d Ubuntu -- rm -f ansible_vars.yml"'
                            bat "powershell -Command \"wsl -d Ubuntu -- echo docker_user: ${DOCKER_USER} > ansible_vars.yml\""
                            bat "powershell -Command \"wsl -d Ubuntu -- echo docker_password: ${DOCKER_PASS} >> ansible_vars.yml\""
                            
                            // Run Ansible with variable file
                            bat 'powershell -Command "wsl -d Ubuntu -- ansible-playbook -i inventory.ini setup.yml -e @ansible_vars.yml -vvv"'
                            
                            // Clean up the variables file for security
                            bat 'powershell -Command "wsl -d Ubuntu -- rm -f ansible_vars.yml"'
                        }
                    }
                }
            }
        }

        stage('Final Verification') {
            steps {
                script {
                    echo "Deployment completed. Application should be running at http://${env.SERVER_IP}/"
                    echo "Please wait a few minutes for all services to initialize properly."
                }
            }
        }
    }
    
    post {
        success {
            echo "Pipeline executed successfully! The blog application is now available at http://${env.SERVER_IP}/"
        }
        failure {
            echo "Pipeline failed. Please check the logs for more information."
        }
    }
}
