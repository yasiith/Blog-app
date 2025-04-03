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
                        bat 'terraform apply -auto-approve'
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
                        
                        // Create a new inventory file directly instead of using sed
                        bat 'powershell -Command "wsl -d Ubuntu -- echo \\"[web]\\" > inventory.ini"'
                        bat 'powershell -Command "wsl -d Ubuntu -- echo \\"16.171.196.13 ansible_user=ec2-user ansible_ssh_private_key_file=~/ansible-keys/SahanDevKeyPair.pem ansible_python_interpreter=/usr/bin/python3\\" >> inventory.ini"'
                        
                        // Test SSH connectivity with the new key location
                        bat 'powershell -Command "wsl -d Ubuntu -- ssh -i ~/ansible-keys/SahanDevKeyPair.pem -o StrictHostKeyChecking=no ec2-user@16.171.196.13 echo Connection successful"'
                        
                        // Then run ansible with the updated inventory
                        bat 'powershell -Command "wsl -d Ubuntu -- ansible-playbook -i inventory.ini setup.yml -vvv"'
                    }
                }
            }
        }
        
        stage('Deploy Docker Containers') {
            steps {
                script {
                    dir('ansible') {
                        // Create a docker-compose.yml deployment playbook
                        bat 'powershell -Command "wsl -d Ubuntu -- cat > deploy.yml << \\"EOF\\""'
                        bat 'powershell -Command "wsl -d Ubuntu -- echo \\"---\\" >> deploy.yml"'
                        bat 'powershell -Command "wsl -d Ubuntu -- echo \\"- hosts: web\\" >> deploy.yml"'
                        bat 'powershell -Command "wsl -d Ubuntu -- echo \\"  become: yes\\" >> deploy.yml"'
                        bat 'powershell -Command "wsl -d Ubuntu -- echo \\"  tasks:\\" >> deploy.yml"'
                        bat 'powershell -Command "wsl -d Ubuntu -- echo \\"    - name: Login to Docker Hub\\" >> deploy.yml"'
                        bat 'powershell -Command "wsl -d Ubuntu -- echo \\"      shell: docker login -u {{ docker_user }} -p {{ docker_password }}\\" >> deploy.yml"'
                        bat 'powershell -Command "wsl -d Ubuntu -- echo \\"      no_log: true\\" >> deploy.yml"'
                        bat 'powershell -Command "wsl -d Ubuntu -- echo \\"    - name: Pull Docker images\\" >> deploy.yml"'
                        bat 'powershell -Command "wsl -d Ubuntu -- echo \\"      shell: docker pull yasiith/first-job-backend:latest && docker pull yasiith/first-job-frontend:latest\\" >> deploy.yml"'
                        bat 'powershell -Command "wsl -d Ubuntu -- echo \\"    - name: Create docker-compose.yml file\\" >> deploy.yml"'
                        bat 'powershell -Command "wsl -d Ubuntu -- echo \\"      copy:\\" >> deploy.yml"'
                        bat 'powershell -Command "wsl -d Ubuntu -- echo \\"        dest: /home/ec2-user/docker-compose.yml\\" >> deploy.yml"'
                        bat 'powershell -Command "wsl -d Ubuntu -- echo \\"        content: |\\" >> deploy.yml"'
                        bat 'powershell -Command "wsl -d Ubuntu -- echo \\"          version: \\\\\\"3\\\\\\"\\" >> deploy.yml"'
                        bat 'powershell -Command "wsl -d Ubuntu -- echo \\"          services:\\" >> deploy.yml"'
                        bat 'powershell -Command "wsl -d Ubuntu -- echo \\"            backend:\\" >> deploy.yml"'
                        bat 'powershell -Command "wsl -d Ubuntu -- echo \\"              image: yasiith/first-job-backend:latest\\" >> deploy.yml"'
                        bat 'powershell -Command "wsl -d Ubuntu -- echo \\"              ports:\\" >> deploy.yml"'
                        bat 'powershell -Command "wsl -d Ubuntu -- echo \\"                - \\\\\\"8080:8080\\\\\\"\\" >> deploy.yml"'
                        bat 'powershell -Command "wsl -d Ubuntu -- echo \\"              restart: always\\" >> deploy.yml"'
                        bat 'powershell -Command "wsl -d Ubuntu -- echo \\"            frontend:\\" >> deploy.yml"'
                        bat 'powershell -Command "wsl -d Ubuntu -- echo \\"              image: yasiith/first-job-frontend:latest\\" >> deploy.yml"'
                        bat 'powershell -Command "wsl -d Ubuntu -- echo \\"              ports:\\" >> deploy.yml"'
                        bat 'powershell -Command "wsl -d Ubuntu -- echo \\"                - \\\\\\"3000:3000\\\\\\"\\" >> deploy.yml"'
                        bat 'powershell -Command "wsl -d Ubuntu -- echo \\"              depends_on:\\" >> deploy.yml"'
                        bat 'powershell -Command "wsl -d Ubuntu -- echo \\"                - backend\\" >> deploy.yml"'
                        bat 'powershell -Command "wsl -d Ubuntu -- echo \\"              restart: always\\" >> deploy.yml"'
                        bat 'powershell -Command "wsl -d Ubuntu -- echo \\"    - name: Run Docker Compose\\" >> deploy.yml"'
                        bat 'powershell -Command "wsl -d Ubuntu -- echo \\"      shell: cd /home/ec2-user && docker-compose up -d\\" >> deploy.yml"'
                        bat 'powershell -Command "wsl -d Ubuntu -- echo \\"EOF\\""'
                        
                        // Run the deploy playbook with Docker Hub credentials
                        withCredentials([usernamePassword(credentialsId: DOCKER_CREDENTIALS_ID, usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                            bat "powershell -Command \"wsl -d Ubuntu -- ansible-playbook -i inventory.ini deploy.yml -e docker_user='${DOCKER_USER}' -e docker_password='${DOCKER_PASS}' -vvv\""
                        }
                    }
                }
            }
        }
    }
}
