import { mockSingleQueryResponse } from './graphql.mock'
import {
  getVersions,
  VersionInfo
} from '../../src/version'
import { Observable } from 'rxjs'

const defaultParams = {
  branchName: '',
  owner: 'cr',
  repo: 'lucky',
  packageName: 'lucky',
  token: 'some-string' as string,
}

const realParams = {
  branchName: '',
  owner: "callrail",
  repo: "looky",
  packageName: "looky",
  token: "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",
  after: null
}

describe('#getVersions', () => {
  it('returns the right number', done => {
    const { branchName, owner, repo, packageName, token } = defaultParams;
    const numVersions = 1
    mockSingleQueryResponse(numVersions)
    getVersions(branchName, owner, repo, packageName, token).subscribe(versions => {
      expect(versions.length).toBe(numVersions)
      done();
    });
  });
});

// fdescribe('#getVersionsForReal', () => {
//   it('returns the right number', done => {
//     const { branchName, owner, repo, packageName, token } = realParams;
//     // const numVersions = 1
//     // mockSingleQueryResponse(numVersions)
//     getVersions(branchName, owner, repo, packageName, token).subscribe(versions => {
//       console.log('versions', versions)
//       // expect(versions.length).toBe(1)
//       // done();
//     });
//   });
// });
