# shannonmurdoch.com

Static portfolio site. Plain HTML + CSS, no build step.

## Local preview

Open `index.html` in a browser, or serve the folder over HTTP:

```bash
python -m http.server 8080
# then visit http://localhost:8080
```

## Deployment - Azure Static Web Apps (free tier)

### One-time setup

1. **Push this folder to a new GitHub repo** (private or public, either works).
2. In the [Azure Portal](https://portal.azure.com), create a new resource: **Static Web App**.
   - Plan type: **Free**
   - Region: **East Asia** or **Australia East** for proximity to AU users
   - Source: **GitHub**, authorise and select your repo, branch `main`
   - Build details: choose **Custom**, leave build command and output location empty (since this is plain HTML)
   - App location: `/`
3. Azure provisions a default URL like `<random>.azurestaticapps.net` and auto-deploys on every push to `main`.

### Custom domain (shannonmurdoch.com)

1. In Azure Portal: open the Static Web App > **Custom domains** > **Add**.
2. For the apex/root (`shannonmurdoch.com`), choose **Custom domain on other DNS** and Azure shows you the validation TXT record + the ALIAS/ANAME target.
3. At your domain registrar:
   - Add the TXT record Azure provides (validation).
   - Add an ALIAS or ANAME record on `@` pointing to the Azure default URL. (If your registrar does not support ALIAS/ANAME at the apex, use [Cloudflare](https://cloudflare.com) in front and configure a CNAME flattening / proxied record.)
   - For `www.shannonmurdoch.com`, add a CNAME pointing to the Azure default URL.
4. Once DNS validates (usually within a few minutes to a few hours), Azure auto-provisions a free TLS certificate.

### Free-tier limits

- 100 GB bandwidth / month
- 0.5 GB storage
- Custom domain + SSL included
- 2 staging environments

More than enough for a portfolio.
