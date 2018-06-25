# Robinbase AWS Integration

This file adds integration with AWS to a Robinbase project

## Usage

This extension is enabled by default in a new Robinbase project.
If it has been removed you may add it back in by installing it from npm and adding it to your extensions.js file.

Install from npm:

```sh
npm install --save @robinsage/rb-aws
```

Then add to project:

```javascript
// In extensions.js
module.exports = {
    // .. other extensions
    require("@robinsage/rb-aws")
}
```

## What it provides

### AWS Service

The extension provides an aws service.
The most important functionality it includes is the ability to send emails.

```javascript
// in config.js
Config.sendEmail = require_robinbase("aws:service:communication:AWS").sendEmail;
```

### AWS S3 Uploader

The uploader allows easy uploading to s3, usually from models.

This functionality will be automatically added to your project.