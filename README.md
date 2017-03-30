# Company Tree

Provides an API endpoint for company data with car and driver details.


## Running

Install modules

    npm install

In this project's root, run:

    node index.js

In your web browser, fire up

    http://localhost:8080/company/tree

Use JSONView or similar Google Chrome Extension to format its output.

## Limiting output size

The following query parameters are supported for limiting output:

| Parameter name      | Default value |
|---------------------|---------------|
| companiesOffset     |             0 |
| companiesLimit      |           100 |
| companyDriversLimit |           100 |
| companyCarsLimit    |           100 |

Example parameter usage:
http://localhost:8080/company/tree?companiesOffset=1&companiesLimit=2&companyDriversLimit=1&companyCarsLimit=1
