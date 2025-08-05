import { execSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { exit } from 'process'

/**
 * SECTION: Read and validate inputs
 */
function getCdkCommand(): string {
  const cdkCommand = process.argv[2]
  console.info(`cdk-runner: CDK command = ${cdkCommand}`)
  if (!cdkCommand) {
    console.error('Missing CDK command. Usage: "npm run <cdk-command> <stage>". Aborting...')
    exit(1)
  }

  const validCommands = ['bootstrap', 'synth', 'deploy', 'destroy']
  if (!validCommands.includes(cdkCommand)) {
    console.error(`cdk-runner: Invalid CDK command. Usage: "npm run ${validCommands.join('|')} <stage>". Aborting...`)
    exit(1)
  }

  return cdkCommand
}

/**
 *
 */
function getDeploymentPrefix(): string {
  const deploymentPrefix = process.env.npm_package_config_deployment_prefix
  console.info(`cdk-runner: Deployment prefix = ${deploymentPrefix}`)
  if (!deploymentPrefix) {
    console.error('cdk-runner: Missing config.deployment_prefix in package.json file. Aborting...')
    exit(1)
  }
  return deploymentPrefix
}

/**
 *
 */
function getDeploymentStage(): string {
  const deploymentStageArg = process.argv[3]
  const deploymentStageEnv = process.env.DEPLOYMENT_STAGE
  const deploymentStage = deploymentStageArg || deploymentStageEnv

  console.info(`cdk-runner: Deployment stage = ${deploymentStage}`)
  if (!deploymentStage) {
    console.error('cdk-runner: Missing deployment stage. Usage: "npm run <cdk-command> <stage>". Aborting...')
    exit(1)
  }

  return deploymentStage
}

/**
 * SECTION: Assemble CDK CLI arguments
 */
function getCdkCliArgs(
  deploymentPrefix: string,
  deploymentStage: string,
): {
  profileArg: string
  approvalArg: string
  outputsFileArg: string
  outputsFilePath: string
} {
  const shouldOmitProfile = Boolean(process.env.CDK_OMIT_PROFILE)
  const shouldOmitApproval = Boolean(process.env.CDK_OMIT_APPROVAL)

  console.info(`cdk-runner: Omit profile = ${shouldOmitProfile}`)
  console.info(`cdk-runner: Omit approval = ${shouldOmitApproval}`)

  const profileArg = shouldOmitProfile ? '' : `--profile ${deploymentPrefix}-${deploymentStage}`
  const approvalArg = shouldOmitApproval ? '--require-approval never' : '--require-approval any-change'

  const outputsFileName = `outputs.${deploymentStage}.json`
  const outputsFilePath = path.resolve(process.cwd(), outputsFileName)
  const outputsFileArg = `--outputs-file ${outputsFilePath}`

  return {
    profileArg,
    approvalArg,
    outputsFileArg,
    outputsFilePath,
  }
}

/**
 * SECTION: Run CDK
 */
function runCdkCommand(cdkCommand: string, deploymentPrefix: string, deploymentStage: string, cliArgs: string[]): void {
  console.info(`cdk-runner: Stack name = ${deploymentPrefix}-${deploymentStage}`)
  console.info('cdk-runner: executing CDK...\n')

  const envVarsString = `NODE_ENV=p DEPLOYMENT_PREFIX=${deploymentPrefix} DEPLOYMENT_STAGE=${deploymentStage}`
  const cliArgsString = cliArgs.join(' ')
  const fullCommand = `cross-env ${envVarsString} cdk ${cdkCommand} ${cliArgsString}`

  execSync(fullCommand, { stdio: 'inherit' })
}

/**
 * SECTION: Write outputs to .env files
 */
function writeOutputsToEnvFiles(outputsFilePath: string, deploymentPrefix: string, deploymentStage: string): void {
  const outputsFileContents = readFileSync(outputsFilePath, 'utf8')
  const outputsJson = JSON.parse(outputsFileContents) as Record<string, Record<string, string>>

  const stackName = `${deploymentPrefix}-${deploymentStage}`
  const outputs = outputsJson[stackName]
  const outputPrefix = `${deploymentPrefix}${deploymentStage}`

  const envFilesConfig = [
    // API tests .env files (used by Rest Client files)
    {
      envFilePath: '../_restclient/test-template-service/.env',
      envVariables: [
        {
          cdkOutputName: `${outputPrefix}TestTemplateServiceApiHttpApiUrl`,
          envVarName: 'TEST_TEMPLATE_SERVICE_API_BASE_URL',
        },
      ],
    },
    {
      envFilePath: '../_restclient/test-bedrock-service/.env',
      envVariables: [
        {
          cdkOutputName: `${outputPrefix}TestBedrockServiceApiHttpApiUrl`,
          envVarName: 'TEST_BEDROCK_SERVICE_API_BASE_URL',
        },
      ],
    },
    {
      envFilePath: '../_restclient/workflow-service/.env',
      envVariables: [
        {
          cdkOutputName: `${outputPrefix}WorkflowServiceApiHttpApiUrl`,
          envVarName: 'WORKFLOW_SERVICE_API_BASE_URL',
        },
      ],
    },
    // Services .env file (used by services)
    {
      envFilePath: '../services/.env',
      envVariables: [
        {
          cdkOutputName: `${outputPrefix}TestTemplateServiceApiHttpApiUrl`,
          envVarName: 'TEST_TEMPLATE_SERVICE_API_BASE_URL',
        },
        {
          cdkOutputName: `${outputPrefix}TestBedrockServiceApiHttpApiUrl`,
          envVarName: 'TEST_BEDROCK_SERVICE_API_BASE_URL',
        },
        {
          cdkOutputName: `${outputPrefix}WorkflowServiceApiHttpApiUrl`,
          envVarName: 'WORKFLOW_SERVICE_API_BASE_URL',
        },
      ],
    },
  ]

  console.info('')

  envFilesConfig.forEach(({ envFilePath, envVariables }) => {
    let envFileContents = ''
    envVariables.forEach(({ cdkOutputName, envVarName }) => {
      const cdkOutputValue = outputs[cdkOutputName]
      if (cdkOutputValue) {
        const envVarValue = cdkOutputValue.endsWith('/') ? cdkOutputValue.slice(0, -1) : cdkOutputValue
        envFileContents += `${envVarName}=${envVarValue}\n`
      }
    })

    if (envFileContents) {
      const envFileFullPath = path.resolve(process.cwd(), envFilePath)
      writeFileSync(envFileFullPath, envFileContents)
      console.info(`cdk-runner: Created .env file: ${envFilePath}`)
    }
  })
}

/**
 * SECTION: Main
 */
function main(): void {
  const cdkCommand = getCdkCommand()
  const deploymentPrefix = getDeploymentPrefix()
  const deploymentStage = getDeploymentStage()

  const cdkCliArgs = getCdkCliArgs(deploymentPrefix, deploymentStage)
  const { profileArg, approvalArg, outputsFileArg } = cdkCliArgs

  try {
    runCdkCommand(cdkCommand, deploymentPrefix, deploymentStage, [approvalArg, profileArg, outputsFileArg])
  } catch (error) {
    console.error(`cdk-runner: Failed to run CDK command "${cdkCommand}". Aborting...`)
    console.error(error)
    exit(1)
  }

  try {
    const writeEnvFiles = Boolean(process.env.WRITE_ENV_FILES)
    if (writeEnvFiles && cdkCommand === 'deploy') {
      const { outputsFilePath } = cdkCliArgs
      writeOutputsToEnvFiles(outputsFilePath, deploymentPrefix, deploymentStage)
    } else if (writeEnvFiles) {
      console.warn(
        'cdk-runner: Notice that "WRITE_ENV_FILES=true" is only valid for the "deploy" CDK command. Skipping...',
      )
    }
  } catch (error) {
    console.error('cdk-runner: Failed to write .env files. Aborting...')
    console.error(error)
    exit(1)
  }
}

main()
