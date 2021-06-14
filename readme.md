# Instagram Parser with Puppeteer

### Parser for Instagram user posts using Puppeteer in Vercel. 

Parses Instagram posts for required profile and returns post link, alt and image as data url.

This script **will fail** on any cloud server because Facebook detects cloud provider IP's and request Login to show profile page. 

Use this script with proxies to bypass Facebook validations.

*Note: To verify the script working on your local machine use `vercel dev` to run local server.*