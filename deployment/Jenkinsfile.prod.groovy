pipeline {
    agent any
    environment {
        //
        // Build config
        //
        // prefix of the image to build, config triplet
        //  <project>-<service>-<stage>
        //  juanpablo-backend-prod
        PROJECT_NAME = "juanpablo"
        PROJECT_SERVICE = "backend"
        PROJECT_STAGE = "prod"
        PROJECT_TRIPLET = "${PROJECT_NAME}-${PROJECT_SERVICE}-${PROJECT_STAGE}"

        //
        // VPS setup
        //
        REMOTE_USER = "docker_admin"
        REMOTE_IP = credentials("juanpablo-vps-prod")
        REMOTE_FOLDER = "/opt/docker/compose/core/cmjuanpabloii/"

        //
        // Docker registry setup
        //
        REGISTRY_CREDENTIALS = "dockerhub-digitalesacide-credentials"
        REGISTRY_URL = "docker.io"
        REGISTRY_USER = "digitalesacide"
        REGISTRY_REPO = "${PROJECT_TRIPLET}"
        // docker.io/digitalesacide/juanpablo-backend-prod
        FULL_REGISTRY_URL = "${REGISTRY_URL}/${REGISTRY_USER}/${REGISTRY_REPO}"
        ESCAPED_REGISTRY_URL = "${REGISTRY_URL}\\/${REGISTRY_USER}\\/${REGISTRY_REPO}"

        // SSH command
        SSH_COM = "ssh ${REMOTE_USER}@${REMOTE_IP}"
    }

    stages {
        stage("Build & push image") {
            steps {
                script {
                    withDockerRegistry(credentialsId: "${REGISTRY_CREDENTIALS}") {
                        def image = docker.build("${FULL_REGISTRY_URL}:${BUILD_NUMBER}")
                        image.push()
                    }
                }
            }
        }
        stage("Restart backend service") {
            steps {
                script {
                    def config = readYaml file: 'deployment/env.yaml'
                    def env = config.prod.backend

                    def nonSensitiveVars = env.nonsensitive.collect { k, v -> "${k}=${v}" }
                    def sensitiveVars = env.sensitive

                    def credentialsList = sensitiveVars.collect { 
                        string(credentialsId: it, variable: it)
                    }

                    withCredentials(credentialsList) {
                        sshagent(['juanpablo-ssh-prod']) {
                            // Create a temporary script that will create the .env file
                            // This enables us to use shell variables to properly handle 
                            // the credentials without using binding.getVariable()
                            sh """
                                cat > ${WORKSPACE}/create_env.sh << 'EOL'
#!/bin/bash
cat << EOF
# Non-sensitive variables
JUANPABLO_BACKEND_VERSION=${BUILD_NUMBER}
${nonSensitiveVars.join('\n')}
# Sensitive variables
${sensitiveVars.collect { varName -> "${varName}=\${${varName}}" }.join('\n')}
EOF
EOL
                                chmod +x ${WORKSPACE}/create_env.sh
                            """

                            // Execute the script to generate env content and send it to remote
                            sh """
                                ${WORKSPACE}/create_env.sh | ${SSH_COM} 'umask 077 && cat > ${REMOTE_FOLDER}/.env.backend'
                            """

                            // populate & restart
                            sh """
                                ${SSH_COM} 'cd ${REMOTE_FOLDER} && \
                                docker pull ${FULL_REGISTRY_URL}:${BUILD_NUMBER} && \
                                (rm .env || true) && \
                                touch .env.backend && \
                                touch .env.frontend && \
                                cat .env.backend >> .env && \
                                cat .env.frontend >> .env && \
                                docker compose up -d'
                            """
                        }
                    }
                }
            }
        }
    }
}
