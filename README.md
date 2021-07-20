# Github Action - Deploy to an S3-backed Cloudfront distribution

Prevent deployments when the commit SHA and deployment SHA is the same

## Usage
```
jobs:
  deploy:
    steps:
      - name: Should Deploy?
        id: should-deploy
        uses: utrustdev/action-should-deploy@v0.1.0
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
```

## Output
```
jobs:
  deploy:
    steps:
      ....
      - name: Get output
        run: |
          echo "output: ${{ steps.should-deploy.outputs.is_deployable }}"
          echo "sha: ${{ steps.should-deploy.outputs.sha }}"
```

## Example
```
jobs:
  deploy:
    steps:
      ....
      - name: Trigger Deploy
        if: ${{ steps.should-deploy.outputs.is_deployable == 'true' }}
        uses: ....
        with:
          ....
```
