# K6 Performance Testing for Coffee API

This project contains a set of performance tests for the Coffee API hosted at `https://webservice.toscacloud.com/api/v1/Coffees`. The tests are implemented using K6, a modern load testing tool that provides a powerful scripting environment for performance testing.

## Table of Contents

- [Features](#features)
- [Getting Started](#getting-started)
- [Running the Tests](#running-the-tests)
- [Test Scenarios](#test-scenarios)
- [Metrics and Thresholds](#metrics-and-thresholds)
- [Contributing](#contributing)
- [License](#license)

## Features

- Load Testing
- Volume Testing
- Endurance Testing
- Spike Testing
- Soak Testing
- Stress Testing
- Ramp-Up Load Testing
- Data Volume Impact Testing
- Concurrent POST Testing
- Error Rate and Recovery Testing

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (for installing K6)
- [K6](https://k6.io/docs/getting-started/installation/) (install via Homebrew, Chocolatey, or download from the official site)

### Run

1. **Set the Environment Variable**:
   ```powershell
   $env:K6_WEB_DASHBOARD = "true"
   $env:K6_WEB_DASHBOARD_EXPORT = "test-report.html"
   ```

2. **Run Your K6 Test**:
   ```powershell
   k6 run performanceTests.js
   ```


