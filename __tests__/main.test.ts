import { Input } from '../src/input';
test('parse branch name', () => {
  const testInput = {
    branchName: 'jk/test_long_input/with_junk',
    owner: 'callrail',
    repo: 'test',
    packageName: 'test',
    token: 'token',
    dryRun: false
  };
  const input = new Input(testInput);
  expect(input.branchName).toEqual('jk-test-long-input-with-junk');
});
