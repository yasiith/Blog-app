pipeline {
    agent any

    stages {
        stage('Clone Repository') {
            steps {
                git branch: 'main', url: 'https://github.com/yasiith/Blog-app.git'
            }
        }

        stage('Build Docker Images'){
            steps{
                script{
                    sh 'docker-compose -f docker-compose.yml build'
                }
            }
        }

        
    }
}
