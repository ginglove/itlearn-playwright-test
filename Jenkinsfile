pipeline {
    agent any

    environment {
        CI = 'true'
        // Playwright ghi kết quả JUnit ra file này để Jenkins đọc
        PLAYWRIGHT_JUNIT_OUTPUT_NAME = 'results.xml'
        // Cache browser của Playwright trong workspace agent
        PLAYWRIGHT_BROWSERS_PATH = "${WORKSPACE}/.pw-browsers"
    }

    options {
        timeout(time: 30, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '20'))
        timestamps()
    }

    triggers {
        // Poll SCM mỗi 5 phút (bỏ đi nếu dùng webhook)
        pollSCM('H/5 * * * *')
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install dependencies') {
            steps {
                sh 'node --version && npm --version'
                sh 'npm ci'
            }
        }

        stage('Install Playwright browsers') {
            steps {
                sh 'npx playwright install --with-deps chromium'
            }
        }

        stage('Run tests') {
            steps {
                sh 'npx playwright test --reporter=html,junit,line,./tests/csv-status-reporter.ts'
            }
        }
    }

    post {
        always {
            junit allowEmptyResults: true, testResults: 'results.xml'

            archiveArtifacts artifacts: 'playwright-report/**, test-results/**',
                             allowEmptyArchive: true,
                             fingerprint: false

            // Cần plugin "HTML Publisher"
            publishHTML(target: [
                reportName           : 'Playwright HTML Report',
                reportDir            : 'playwright-report',
                reportFiles          : 'index.html',
                keepAll              : true,
                alwaysLinkToLastBuild: true,
                allowMissing         : true
            ])
        }
        failure {
            echo "Build FAILED: ${env.JOB_NAME} #${env.BUILD_NUMBER}"
        }
    }
}
