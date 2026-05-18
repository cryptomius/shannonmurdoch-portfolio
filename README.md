# shannonmurdoch.com

Static portfolio site. Plain HTML + CSS, no build step.

## Local preview

Open `index.html` in a browser, or serve the folder over HTTP:

```bash
python -m http.server 8080
# then visit http://localhost:8080
```

## Deployment

Hosted on **GitHub Pages** from the `main` branch (root). The `CNAME` file binds the site to `shannonmurdoch.com`. DNS is managed via Cloudflare (DNS-only, not proxied) with four A records pointing to GitHub Pages' IPs (`185.199.108-111.153`) and a `www` CNAME to `cryptomius.github.io`. Pushes to `main` auto-deploy.
