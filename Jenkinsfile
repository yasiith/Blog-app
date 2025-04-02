pipeline {
    agent any

    environment {
        DOCKERHUB_CREDENTIALS = credentials('docker-hub')
    }

    stages {
        stage('Clone Repository') {
            steps {
                git 'https://github.com/yasiith/Blog-app.git'
            }
        }

        
    }
}
