# kindergarten-dev Deployment

OC Kindergarten dev is deployed from `/work/oc-projects/oc-kindergarten`.

## Port

Default host port: `3107`.

## Commands

```bash
cd /work/oc-projects/oc-kindergarten
oc-deploy oc-kindergarten deploy
oc-deploy oc-kindergarten status
oc-deploy oc-kindergarten logs
oc-domain bind kindergarten-dev.rococo.dev oc-kindergarten 3107
oc-domain status kindergarten-dev.rococo.dev
```

The app container exposes port `3000`; compose maps host `3107` to container `3000`.
