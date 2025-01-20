import http from 'k6/http';
import { check } from 'k6';

// Test results storage
const testResults = [];

// Utility to record results
function recordResult(testType, success, responseTime, status) {
    testResults.push({
        testType,
        success,
        responseTime,
        status,
        timestamp: new Date().toISOString(),
    });
}

// Enhanced Report Generation
function generateReport() {
    console.log('\n=== Test Execution Report ===');
    const groupedResults = testResults.reduce((acc, result) => {
        if (!acc[result.testType]) {
            acc[result.testType] = [];
        }
        acc[result.testType].push(result);
        return acc;
    }, {});

    for (const [testType, results] of Object.entries(groupedResults)) {
        const successCount = results.filter(r => r.success).length;
        const failCount = results.length - successCount;
        const successRate = Math.floor((successCount / results.length) * 100) || 0;

        console.log(`\n  █ ${testType}`);
        results.forEach(result => {
            const statusIcon = result.success ? '✓' : '✗';
            console.log(`    ${statusIcon} status ${result.status}, response time ${result.responseTime}ms`);
        });
        console.log(`    ↳  ${successRate}% — ✓ ${successCount} / ✗ ${failCount}`);
    }
}

// Function to authenticate and get JWT token
function getJwtToken() {
    const url = 'https://your-authentication-endpoint.com/api/auth'; // Replace with your auth endpoint
    const payload = JSON.stringify({
        username: 'your-username', // Replace with your username
        password: 'your-password', // Replace with your password
    });

    const res = http.post(url, payload, {
        headers: { 'Content-Type': 'application/json' },
        insecure: true, // Disable SSL verification
    });

    const success = check(res, {
        'is status 200': (r) => r.status === 200,
    });

    if (success) {
        return res.json().token; // Adjust based on your response structure
    } else {
        console.error('Failed to obtain JWT token');
        return null;
    }
}

// Test functions for different load types
function loadTest(token) {
    const url = 'https://webservice.toscacloud.com/api/v1/Coffees';
    const res = http.get(url, {
        headers: { Authorization: `Bearer ${token}` },
        insecure: true, // Disable SSL verification
    });
    const success = check(res, {
        'status is 200': r => r.status === 200,
        'response time < 3000ms': r => r.timings.duration < 3000,
    });
    recordResult('Load Test', success, res.timings.duration, res.status);
}

// Repeat the same for other test functions
function volumeTest(token) {
    const url = 'https://webservice.toscacloud.com/api/v1/Coffees';
    const res = http.get(url, {
        headers: { Authorization: `Bearer ${token}` },
        insecure: true,
    });
    const success = check(res, {
        'status is 200': r => r.status === 200,
        'response time < 3000ms': r => r.timings.duration < 3000,
    });
    recordResult('Volume Testing', success, res.timings.duration, res.status);
}

// ... (Repeat for other test functions)

function errorRateAndRecoveryTest(token) {
    const url = 'https://webservice.toscacloud.com/api/v1/InvalidEndpoint';
    const res = http.get(url, {
        headers: { Authorization: `Bearer ${token}` },
        insecure: true,
    });
    const success = check(res, {
        'status is 404': r => r.status === 404,
    });
    recordResult('Error Rate and Recovery Testing', success, res.timings.duration, res.status);
}

// Test configuration
export const options = {
    thresholds: {
        http_req_duration: ['p(95)<5000'], // 95% of requests must complete below 5s
    },
    scenarios: {
        test_suite: {
            executor: 'constant-vus',
            vus: 10,
            duration: '10m',
        },
    },
};

// Main function
export default function () {
    const token = getJwtToken(); // Get the JWT token

    if (token) {
        loadTest(token);
        volumeTest(token);
        enduranceTest(token);
        spikeTest(token);
        soakTest(token);
        stressTest(token);
        rampUpLoadTest(token);
        dataVolumeImpactTest(token);
        concurrentPostTest(token);
        errorRateAndRecoveryTest(token);
        generateReport();
    }
}
