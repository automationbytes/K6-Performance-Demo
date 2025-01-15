
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

// Test functions for different load types
function loadTest() {
    const url = 'https://webservice.toscacloud.com/api/v1/Coffees';
    const res = http.get(url);
    const success = check(res, {
        'status is 200': r => r.status === 200,
        'response time < 3000ms': r => r.timings.duration < 3000,
    });
    recordResult('Load Test', success, res.timings.duration, res.status);
}

function volumeTest() {
    const url = 'https://webservice.toscacloud.com/api/v1/Coffees';
    const res = http.get(url);
    const success = check(res, {
        'status is 200': r => r.status === 200,
        'response time < 3000ms': r => r.timings.duration < 3000,
    });
    recordResult('Volume Testing', success, res.timings.duration, res.status);
}

function enduranceTest() {
    const url = 'https://webservice.toscacloud.com/api/v1/Coffees';
    const res = http.get(url);
    const success = check(res, {
        'status is 200': r => r.status === 200,
        'response time < 3000ms': r => r.timings.duration < 3000,
    });
    recordResult('Endurance Testing', success, res.timings.duration, res.status);
}

function spikeTest() {
    const url = 'https://webservice.toscacloud.com/api/v1/Coffees';
    const res = http.get(url);
    const success = check(res, {
        'status is 200': r => r.status === 200,
        'response time < 3000ms': r => r.timings.duration < 3000,
    });
    recordResult('Spike Testing', success, res.timings.duration, res.status);
}

function soakTest() {
    const url = 'https://webservice.toscacloud.com/api/v1/Coffees';
    const res = http.get(url);
    const success = check(res, {
        'status is 200': r => r.status === 200,
        'response time < 3000ms': r => r.timings.duration < 3000,
    });
    recordResult('Soak Testing', success, res.timings.duration, res.status);
}

function stressTest() {
    const url = 'https://webservice.toscacloud.com/api/v1/Coffees';
    const res = http.get(url);
    const success = check(res, {
        'status is 200': r => r.status === 200,
        'response time < 3000ms': r => r.timings.duration < 3000,
    });
    recordResult('Stress Testing', success, res.timings.duration, res.status);
}

function rampUpLoadTest() {
    const url = 'https://webservice.toscacloud.com/api/v1/Coffees';
    const res = http.get(url);
    const success = check(res, {
        'status is 200': r => r.status === 200,
        'response time < 3000ms': r => r.timings.duration < 3000,
    });
    recordResult('Ramp-Up Load Testing', success, res.timings.duration, res.status);
}

function dataVolumeImpactTest() {
    const url = 'https://webservice.toscacloud.com/api/v1/Coffees';
    const res = http.get(url);
    const success = check(res, {
        'status is 200': r => r.status === 200,
        'response time < 3000ms': r => r.timings.duration < 3000,
    });
    recordResult('Data Volume Impact Testing', success, res.timings.duration, res.status);
}

function concurrentPostTest() {
    const url = 'https://webservice.toscacloud.com/api/v1/Coffees';
    const res = http.post(url, JSON.stringify({ test: 'data' }), {
        headers: { 'Content-Type': 'application/json' },
    });
    const success = check(res, {
        'status is 200': r => r.status === 200,
        'response time < 3000ms': r => r.timings.duration < 3000,
    });
    recordResult('Concurrent POST Testing', success, res.timings.duration, res.status);
}

function errorRateAndRecoveryTest() {
    const url = 'https://webservice.toscacloud.com/api/v1/InvalidEndpoint';
    const res = http.get(url);
    const success = check(res, {
        'status is 404': r => r.status === 404,
    });
    recordResult('Error Rate and Recovery Testing', success, res.timings.duration, res.status);
}

// Test configuration
export const options = {
    thresholds: {
        http_req_duration: ['p(95)<5000'], // 95% of requests must complete below 3s
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
    loadTest();
    volumeTest();
    enduranceTest();
    spikeTest();
    soakTest();
    stressTest();
    rampUpLoadTest();
    dataVolumeImpactTest();
    concurrentPostTest();
    errorRateAndRecoveryTest();
    generateReport();
}
