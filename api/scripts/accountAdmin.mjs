// Coloca ou tira uma conta do grupo admin do Cognito. Usa as credenciais AWS locais (as mesmas do deploy).
// Uso: pnpm account:admin <email> <add|remove> [stage=dev]
import {
  AdminAddUserToGroupCommand,
  AdminRemoveUserFromGroupCommand,
  CognitoIdentityProviderClient,
  ListUserPoolsCommand,
  UserNotFoundException,
} from '@aws-sdk/client-cognito-identity-provider';

// Espelham o serverless.yml (service, region) e o cognito.yml (nome do pool e do grupo).
const SERVICE = 'trezzy-api';
const REGION = 'sa-east-1';
const GROUP = 'admin';

const [email, action, stage = 'dev'] = process.argv.slice(2);

if (!email || !['add', 'remove'].includes(action)) {
  console.error('Uso: pnpm account:admin <email> <add|remove> [stage=dev]');
  process.exit(1);
}

const client = new CognitoIdentityProviderClient({ region: REGION });
const poolName = `${SERVICE}-${stage}-users`;
const pools = [];
let nextToken;

do {
  const page = await client.send(new ListUserPoolsCommand({ MaxResults: 60, NextToken: nextToken }));
  pools.push(...(page.UserPools ?? []).filter((pool) => pool.Name === poolName));
  nextToken = page.NextToken;
} while (nextToken);

if (pools.length !== 1) {
  console.error(`Esperava 1 pool chamado ${poolName} em ${REGION}, encontrei ${pools.length}.`);
  process.exit(1);
}

const [{ Id: poolId }] = pools;
const Command = action === 'add' ? AdminAddUserToGroupCommand : AdminRemoveUserFromGroupCommand;

console.log(`Pool ${poolName} (${poolId}): ${action === 'add' ? 'adicionando' : 'removendo'} ${email} no grupo ${GROUP}...`);

try {
  // O pool usa e-mail como username, então as APIs Admin aceitam o e-mail direto.
  await client.send(new Command({ UserPoolId: poolId, Username: email, GroupName: GROUP }));
} catch (error) {
  if (error instanceof UserNotFoundException) {
    console.error(`Nenhuma conta com o e-mail ${email} neste pool.`);
    process.exit(1);
  }

  throw error;
}

console.log('Feito. Vale a partir do próximo token: faça login de novo (o token atual segue como está até expirar).');
