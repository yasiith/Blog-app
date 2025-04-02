pipeline {
    agent any

    environment{
        DOCKER_HUB_USER = 'yasiith'
        DOCKER_HUB_PASS = credentials('docker-hub-credentials')
    }

    stages {
        stage('Clone Repository') {
            steps {
                git branch: 'main', url: 'https://github.com/yasiith/Blog-app.git'
            }
        }

        stage('Build Docker Images'){
            steps{
                script{
                    bat 'docker-compose -f docker-compose.yml build'
                }
            }
        }

        stage('Push Docker Images'){
            steps{
                script{
                    // Login to Docker Hub
                    bat "echo %DOCKER_HUB_PASS% | docker login -u %DOCKER_HUB_USER% --password-stdin"

                    // Push the images to Docker Hub
                    bat 'docker-compose -f docker-compose.yml push'
                }
            }
        }
    }
}
