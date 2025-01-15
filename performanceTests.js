import http from 'k6/http';
import { check, sleep } from 'k6';

// Utility function to generate payload
const generatePayload = (size) => {
    const text = 'Sample Description'.repeat(size / 20); // Approximate size
    return JSON.stringify({
        description: text,
        name: 'Sample Name',
    });
};

// Test configurations
export const options = {
    thresholds: {
        http_req_duration: ['p(95)<2000'], // 95% of requests must complete below 2s
        errors: ['rate<0.05'], // Error rate must be below 5%
    },
    scenarios: {
        test_suite: {
            executor: 'constant-vus',
            vus: 10,
            duration: '10m',
        },
    },
};

// 1. Load Test
export function loadTest() {
    const url = 'https://webservice.toscacloud.com/api/v1/Coffees';
    const res = http.get(url);
    check(res, {
        'is status 200': (r) => r.status === 200,
    });
    sleep(1);
}

// 2. Volume Test
export function volumeTest() {
    const url = 'https://webservice.toscacloud.com/api/v1/Coffees';
    const sizes = [1000, 5000, 10000, 50000];
    const payload = generatePayload(sizes[Math.floor(Math.random() * sizes.length)]);
    const params = { headers: { 'Content-Type': 'application/json' } };

    const res = http.post(url, payload, params);
    check(res, {
        'is status 201': (r) => r.status === 201,
    });
    sleep(1);
}

// 3. Endurance Test
export function enduranceTest() {
    const url = 'https://webservice.toscacloud.com/api/v1/Coffees';
    for (let i = 0; i < 100; i++) {
        const res = http.get(url);
        check(res, {
            'is status 200': (r) => r.status === 200,
        });
    }
    sleep(1);
}

// 4. Spike Test
export function spikeTest() {
    const url = 'https://webservice.toscacloud.com/api/v1/Coffees';
    const res = http.get(url);
    check(res, {
        'is status 200': (r) => r.status === 200,
    });
    sleep(0.1); // Short sleep to simulate spikes
}

// 5. Soak Test
export function soakTest() {
    const url = 'https://webservice.toscacloud.com/api/v1/Coffees';
    const payload = generatePayload(100);
    const params = { headers: { 'Content-Type': 'application/json' } };

    const res = http.post(url, payload, params);
    check(res, {
        'is status 201': (r) => r.status === 201,
    });
    sleep(1);
}

// 6. Stress Test
export function stressTest() {
    const url = 'https://webservice.toscacloud.com/api/v1/Coffees';
    const res = http.get(url);
    check(res, {
        'is status 200': (r) => r.status === 200,
    });
    sleep(0.5);
}

// 7. Ramp-Up Load Test
export function rampUpTest() {
    const url = 'https://webservice.toscacloud.com/api/v1/Coffees';
    const payload = generatePayload(100);
    const params = { headers: { 'Content-Type': 'application/json' } };

    const res = http.post(url, payload, params);
    check(res, {
        'is status 201': (r) => r.status === 201,
    });
    sleep(0.5);
}

// 8. Data Volume Impact Test
export function dataVolumeTest() {
    const url = 'https://webservice.toscacloud.com/api/v1/Coffees';
    const sizes = [100, 1000, 10000, 100000];
    const payload = generatePayload(sizes[Math.floor(Math.random() * sizes.length)]);
    const params = { headers: { 'Content-Type': 'application/json' } };

    const res = http.post(url, payload, params);
    check(res, {
        'is status 201': (r) => r.status === 201,
    });
    sleep(1);
}

// 9. Concurrent POST Test
export function concurrentPostTest() {
    const url = 'https://webservice.toscacloud.com/api/v1/Coffees';
    const payload = generatePayload(100);
    const params = { headers: { 'Content-Type': 'application/json' } };

    const res = http.post(url, payload, params);
    check(res, {
        'is status 201': (r) => r.status === 201,
    });
    sleep(1);
}

// 10. Error Rate and Recovery Test
export function errorRecoveryTest() {
    const url = 'https://webservice.toscacloud.com/api/v1/Coffees';
    const errorUrl = 'https://webservice.toscacloud.com/api/v1/Error';

    if (Math.random() < 0.2) {
        const errorRes = http.get(errorUrl);
        check(errorRes, {
            'is status 404': (r) => r.status === 404,
        });
    } else {
        const res = http.get(url);
        check(res, {
            'is status 200': (r) => r.status === 200,
        });
    }
    sleep(1);
}

// Default function to run all tests
export default function () {
    loadTest();
    volumeTest();
    enduranceTest();
    spikeTest();
    soakTest();
    stressTest();
    rampUpTest();
    dataVolumeTest();
    concurrentPostTest();
    errorRecoveryTest();
}
