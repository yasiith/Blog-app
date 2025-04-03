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
                    bat "set DOCKER_USER=${DOCKER_CREDS_USR} && docker-compose -f docker-compose.yml build"
                }
            }
        }

        stage('Push Docker Images') {
            steps {
                script {
                    bat "echo ${DOCKER_CREDS_PSW} | docker login -u ${DOCKER_CREDS_USR} --password-stdin"
                    bat "set DOCKER_USER=${DOCKER_CREDS_USR} && docker-compose -f docker-compose.yml push"
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
    }
}
