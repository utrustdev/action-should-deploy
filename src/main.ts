import * as core from '@actions/core'
import * as github from '@actions/github'
import head from 'lodash.head'
import get from 'lodash.get'

import {GetResponseTypeFromEndpointMethod} from '@octokit/types'

const VALID_DEPLOYMENT_STATUSES = ['success', 'pending', 'in_progress']

async function run(): Promise<void> {
  try {
    const ctx = github.context
    const token = core.getInput('token', {required: true})
    const sha = core.getInput('sha', {required: false}) || ctx.sha
    const environment =
      core.getInput('environment', {required: false}) || 'development'

    const client = github.getOctokit(token, {previews: ['flash', 'ant-man']})

    type DeploymentsListResponseType = GetResponseTypeFromEndpointMethod<
      typeof client.rest.repos.listDeployments
    >
    type DeploymentStatusesListResponseType = GetResponseTypeFromEndpointMethod<
      typeof client.rest.repos.listDeploymentStatuses
    >

    const {data: deployments}: DeploymentsListResponseType =
      await client.rest.repos.listDeployments({
        owner: ctx.repo.owner,
        repo: ctx.repo.repo,
        environment,
        page: 1,
        per_page: 1
      })

    const lastDeployment = head(deployments)

    let isDeployable = true

    if (lastDeployment) {
      const {data: statuses}: DeploymentStatusesListResponseType =
        await client.rest.repos.listDeploymentStatuses({
          owner: ctx.repo.owner,
          repo: ctx.repo.repo,
          deployment_id: lastDeployment.id
        })

      const lastStatus = get(statuses, '0.state')

      isDeployable = !(
        sha === lastDeployment.sha &&
        VALID_DEPLOYMENT_STATUSES.includes(lastStatus)
      )
    }

    core.setOutput('is_deployable', isDeployable.toString())
    core.setOutput('sha', sha)
  } catch (error) {
    core.error(error)
    core.setFailed(error.message)
  }
}

run()
