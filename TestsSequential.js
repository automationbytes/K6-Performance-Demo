import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Counter, Trend, Rate, Gauge } from 'k6/metrics';
import { randomString } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

// Metrics for tracking performance
const metrics = {
    errors: new Rate('errors'),
    successRate: new Rate('success_rate'),
    requestDuration: new Trend('request_duration'),
    throughput: new Counter('throughput'),
    dataTransferred: new Counter('data_transferred'),
    activeUsers: new Gauge('active_users'),
    failedTransactions: new Counter('failed_transactions'),
    responseTimeBuckets: {
        under1s: new Counter('responses_under_1s'),
        under3s: new Counter('responses_under_3s'),
        under5s: new Counter('responses_under_5s'),
        over5s: new Counter('responses_over_5s'),
    },
};

// Utility functions
const utils = {
    generatePayload: (size, type = 'default') => {
        const basePayload = {
            id: randomString(8),
            timestamp: new Date().toISOString(),
            data: randomString(size),
        };
        return basePayload;
    },

    checkResponse: (response, checkName) => {
        const responseTime = response.timings.duration;
        const checks = check(response, {
            'status is 200': (r) => r.status === 200,
            'response time < 2000ms': (r) => r.timings.duration < 2000,
        });

        if (!checks) {
            metrics.errors.add(1);
            if (response.status >= 500) {
                console.error(`Server Error in ${checkName}: ${response.body}`);
            }
        }

        if (responseTime < 1000) metrics.responseTimeBuckets.under1s.add(1);
        else if (responseTime < 3000) metrics.responseTimeBuckets.under3s.add(1);
        else if (responseTime < 5000) metrics.responseTimeBuckets.under5s.add(1);
        else metrics.responseTimeBuckets.over5s.add(1);

        return checks;
    },

    handleRequest: (method, url, payload = null, params = {}) => {
        const headers = {
            'Content-Type': 'application/json',
            ...params.headers,
        };

        const requestParams = { headers, timeout: params.timeout || '30s' };
        let response;
        if (method === 'GET') {
            response = http.get(url, requestParams);
        } else if (method === 'POST') {
            response = http.post(url, JSON.stringify(payload), requestParams);
        }

        return utils.checkResponse(response, params.testType);
    },
};

// Test Orchestrator
class TestOrchestrator {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
        this.testQueue = [];
        this.results = [];
    }

    addTest(testType, endpoint, method, options = {}) {
        this.testQueue.push({
            testType,
            endpoint,
            method,
            options,
        });
    }

    runTestsSequential() {
        for (const test of this.testQueue) {
            group(test.testType, () => {
                const url = `${this.baseUrl}${test.endpoint}`;
                const payload = test.method === 'POST' ? utils.generatePayload(100) : null;
                const result = utils.handleRequest(test.method, url, payload, test.options);
                this.results.push({
                    testType: test.testType,
                    success: result,
                    timestamp: new Date().toISOString(),
                });
            });
            sleep(5);
        }
        this.generateReport();
    }

    generateReport() {
        console.log('=== Test Execution Report ===');
        console.table(this.results);
    }
}

// Test script
export default function () {
    const baseUrl = 'https://api.coffee.com';
    const orchestrator = new TestOrchestrator(baseUrl);

    // Load Testing
    orchestrator.addTest('Load Test', '/coffees', 'GET');

    // Stress Testing
    orchestrator.addTest('Stress Test', '/orders', 'POST', {
        retries: 3,
        headers: { 'X-Test-Type': 'Stress' },
    });

    // Spike Testing
    orchestrator.addTest('Spike Test', '/products', 'GET', {
        simulateSlowResponse: true,
    });

    // Additional Performance Test Scenarios
    orchestrator.addTest('Volume Testing', '/coffees/volume', 'GET');
    orchestrator.addTest('Endurance Testing', '/coffees/endurance', 'GET');
    orchestrator.addTest('Soak Testing', '/orders/soak', 'POST', {
        payload: utils.generatePayload(500, 'soak'),
    });
    orchestrator.addTest('Ramp-Up Load Testing', '/coffees/ramp-up', 'GET');
    orchestrator.addTest('Data Volume Impact Testing', '/coffees/data-volume', 'POST', {
        payload: utils.generatePayload(1000, 'large'),
    });
    orchestrator.addTest('Concurrent POST Testing', '/orders/concurrent', 'POST', {
        payload: utils.generatePayload(200, 'concurrent'),
    });
    orchestrator.addTest('Error Rate and Recovery Testing', '/orders/recover', 'POST', {
        headers: { 'X-Test-Type': 'Error-Recovery' },
    });

    // API Functional Test Cases
    orchestrator.addTest('Get All Coffees', '/coffees', 'GET');
    orchestrator.addTest('Get Coffee by ID', '/coffees/12345', 'GET');
    orchestrator.addTest('Add New Coffee', '/coffees', 'POST', {
        payload: utils.generatePayload(100, 'small'),
    });
    orchestrator.addTest('Update Coffee Details', '/coffees/12345', 'POST', {
        payload: utils.generatePayload(200, 'medium'),
    });
    orchestrator.addTest('Delete Coffee', '/coffees/12345', 'POST');
    orchestrator.addTest('List Orders', '/orders', 'GET');
    orchestrator.addTest('Place New Order', '/orders', 'POST', {
        payload: utils.generatePayload(300, 'large'),
    });
    orchestrator.addTest('Cancel Order', '/orders/67890', 'POST');
    orchestrator.addTest('Get Product Info', '/products/abcde', 'GET');
    orchestrator.addTest('Search Products', '/products?query=espresso', 'GET');

    orchestrator.runTestsSequential();
}
