import { execSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { exit } from 'process'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

type CdkCommand = 'bootstrap' | 'synth' | 'deploy' | 'destroy'

const argv = yargs(hideBin(process.argv))
  .scriptName('cdk-runner')
  .usage('$0 --cdk-command <command> --deployment-stage <stage> [--aws-profile <name>] [options]')
  .option('cdk-command', {
    type: 'string',
    choices: ['bootstrap', 'synth', 'deploy', 'destroy'],
    demandOption: true,
    describe: 'CDK command to run',
  })
  .option('deployment-stage', {
    type: 'string',
    demandOption: false,
    describe: 'Deployment stage (e.g. dev, staging, prod). Required.',
  })
  .option('aws-profile', {
    type: 'string',
    describe: 'AWS CLI profile name to pass to CDK. If omitted, CDK uses the default credential chain.',
  })
  .option('require-approval', {
    type: 'string',
    choices: ['any-change', 'never'],
    default: 'any-change',
    describe: 'CDK require-approval mode (maps to --require-approval <mode>).',
  })
  .option('write-env-files', {
    type: 'boolean',
    default: false,
    describe: 'Write selected CDK outputs into .env files (only on deploy).',
  })
  .help()
  .strict()
  .parseSync()

/**
 * SECTION: Read and validate inputs
 */
function getCdkCommand(): CdkCommand {
  const cdkCommand = argv['cdk-command']
  console.info(`cdk-runner: CDK command = ${cdkCommand}`)
  return cdkCommand as CdkCommand
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
  const deploymentStage = argv['deployment-stage'] || process.env.DEPLOYMENT_STAGE
  if (!deploymentStage) {
    console.error(
      'cdk-runner: Deployment stage not provided. Please provide it via "--deployment-stage" argument ' +
        'or with the DEPLOYMENT_STAGE environment variable. Aborting...',
    )
    exit(1)
  }

  console.info(`cdk-runner: Deployment stage = ${deploymentStage}`)
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
  const awsProfile = argv['aws-profile']
  const requireApproval = argv['require-approval']

  const profileArg = awsProfile ? `--profile ${awsProfile}` : ''
  console.info(
    awsProfile
      ? `cdk-runner: Using explicit AWS profile "${awsProfile}"`
      : 'cdk-runner: No profile provided. Using AWS default credential chain',
  )

  const approvalArg = `--require-approval ${requireApproval}`

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
function runCdkCommand(
  cdkCommand: CdkCommand,
  deploymentPrefix: string,
  deploymentStage: string,
  cliArgs: string[],
): void {
  console.info(`cdk-runner: Stack name = ${deploymentPrefix}-${deploymentStage}`)
  console.info('cdk-runner: executing CDK...\n')

  const envVarsString = `NODE_ENV=p DEPLOYMENT_PREFIX=${deploymentPrefix} DEPLOYMENT_STAGE=${deploymentStage}`
  const cliArgsString = cliArgs.filter(Boolean).join(' ')
  const fullCommand = `cross-env ${envVarsString} cdk ${cdkCommand} ${cliArgsString}`
  execSync(fullCommand, { stdio: 'inherit' })
}

/**
 * SECTION: Write outputs to .env files
 */
function writeOutputsToEnvFiles(outputsFilePath: string, deploymentPrefix: string, deploymentStage: string): void {
  const outputsFileContents = readFileSync(outputsFilePath, 'utf8')
  const outputsJson = JSON.parse(outputsFileContents) as Record<string, Record<string, string | number>>

  const stackName = `${deploymentPrefix}-${deploymentStage}`
  const outputs = outputsJson[stackName]
  const outputPrefix = `${deploymentPrefix}${deploymentStage}`

  if (!outputs) {
    console.error(
      `cdk-runner: No outputs found for stack "${stackName}" in ${outputsFilePath}. Available keys: ${Object.keys(
        outputsJson,
      ).join(', ')}`,
    )
    exit(1)
  }

  const envFilesConfig = [
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
    {
      envFilePath: '../ui/.env.local',
      envVariables: [
        {
          cdkOutputName: `${outputPrefix}WorkflowServiceApiHttpApiUrl`,
          envVarName: 'NEXT_PUBLIC_WORKFLOW_SERVICE_API_BASE_URL',
        },
      ],
    },
    {
      envFilePath: '../ui/.env',
      envVariables: [
        {
          cdkOutputName: `${outputPrefix}WorkflowServiceApiHttpApiUrl`,
          envVarName: 'NEXT_PUBLIC_WORKFLOW_SERVICE_API_BASE_URL',
        },
      ],
    },
  ] as const

  console.info('')

  envFilesConfig.forEach(({ envFilePath, envVariables }) => {
    let envFileContents = ''
    envVariables.forEach(({ cdkOutputName, envVarName }) => {
      const raw = outputs[cdkOutputName]
      const cdkOutputValue = raw == null ? '' : String(raw)
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
    if (argv['write-env-files'] && cdkCommand === 'deploy') {
      const { outputsFilePath } = cdkCliArgs
      writeOutputsToEnvFiles(outputsFilePath, deploymentPrefix, deploymentStage)
    } else if (argv['write-env-files']) {
      console.warn('cdk-runner: "--write-env-files" is only valid for "--cdk-command deploy". Skipping...')
    }
  } catch (error) {
    console.error('cdk-runner: Failed to write .env files. Aborting...')
    console.error(error)
    exit(1)
  }
}

main()
