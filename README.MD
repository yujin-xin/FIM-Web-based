# Web-Based File Integrity Monitoring (FIM) System – Express.js

## Overview
This is the **web-based version** of the original [CLI-based FIM tool](https://github.com/yujin-xin/File-integrity-monitoring/tree/main), built using **Node.js and Express.js**. It allows users to monitor, generate, and verify file checksums (SHA1, SHA256, SHA512) via a browser interface, combining accessibility with core security functionality.

Link: https://fim-web-based-production.up.railway.app/

## Key Features
* Web Interface: Provides a user-friendly dashboard for generating and verifying file hashes directly in the browser.
* Hashing Support: Calculates and compares checksums using algorithms such as SHA1, SHA256, and SHA512.
* Baseline Comparison: Enables storage of known-good hashes and detection of any discrepancies with current file states.
* Cross-Platform: Runs on any system with Node.js, accessible via any modern web browser.

## Use Cases
* Web-accessible tool for small teams needing lightweight compliance or tamper detection
* Educational and internal tools demonstrating real-world FIM concepts in a browser

# How to install on my local machine
Make sure you have nodeJs and npm installed in your operating system
```bash
git clone https://github.com/yujin-xin/FIM-Web-based
cd FIM-Web-based
```
```bash
npm install express
node start app.js
```
Go to your browser and type localhost:8080

## Technical Stack
* Backend: Node.js with Express.js
* Hashing Logic: Node’s crypto module for SHA-based hashing
* Frontend: Minimal web interface (HTML/CSS/JS)
* latform: Cross-platform (Linux, Windows, macOS)