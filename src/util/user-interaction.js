import readline from 'readline/promises';

export async function userInteraction() {
  const prompt = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  var userInput;

  while (true) {
    console.log('=======================');
    console.log('Welcome to Compass!');
    console.log('=======================');

    console.log('1. Chrome Profile Setup');
    console.log('2. Interact with Facebook Posts [Homepage] ');
    console.log('3. Auto Stream Facebook Videos');

    userInput = await prompt.question('Please choose an action: ');
    if (userInput != 1 && userInput != 2 && userInput != 3) {
      console.clear();
    } else {
      prompt.close();
      break;
    }
  }

  return userInput;
}
