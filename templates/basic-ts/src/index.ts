import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

async function main() {
  const rl = readline.createInterface({ input, output });

  console.log('Hello from TypeScript!');
  const name = await rl.question('What is your name? ');
  console.log(`Nice to meet you, ${name}!`);

  rl.close();
}

main().catch(console.error);
