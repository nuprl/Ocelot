(window as any).contendEqual = (expected: any, actual: any) => {
    if (expected === actual) {
        return true;
    }
    throw new Error(`Assertion failed\n  Expected: ${expected}\n  Actual: ${actual}`);
};

(window as any).contendNotEqual = (expected: any, actual: any) => {
    if (expected !== actual) {
        return true;
    }
    throw new Error('Assertion failed');
};

/* tslint:disable:no-console */
const celotSymposium = {
    celot(tests: (() => void)[]) {
        if (tests.length === 0) {
            console.log(`%c◈ You don't seem to have any tests written`, 'color: #e87ce8');
            console.log(`%c◈ To run a test, begin a function name with 'test'`, 'color: #e87ce8');
            return;
        }
        console.log('Celot Testing Library');
        let numPassed = 0;
        let numFailed = 0;
        for (let test of tests) {
            try {
                test();
                console.log(
                    `%c CLEAR %c ${test.name}`,
                    'background-color: #2ac093; color: #212121;',
                    'color: #2ac093;'
                );
                numPassed += 1;
            } catch (e) {
                console.log(
                    `%c FAILED %c ${test.name}`,
                    'background-color: #f44336; color: #212121;',
                    'color: #f44336;'
                );
                console.log(`  %c${e}`, 'color: #f44336');
                numFailed += 1;
            }
        }
        let summarySymbol = '◆';
        if (numFailed > 0) {
            summarySymbol = '◇';
        }
        console.log(`${summarySymbol} Summary`);
        console.log(`  %cCleared: ${numPassed}`, 'color: #2ac093;');
        console.log(`  %cFailed: ${numFailed}`, 'color: #f44336;');

    }
};

export default celotSymposium;