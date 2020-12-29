import { Input } from './input'
import { Observable, of, throwError } from 'rxjs'
import { deletePackageVersions, getOldestVersions } from './version'
import { concatMap, map } from 'rxjs/operators'

export function getVersionIds(input: Input): Observable<string[]> {
  return getOldestVersions(
    input.branchName,
    input.owner,
    input.repo,
    input.packageName,
    input.token
  ).pipe(map(versionInfo => versionInfo.map(info => info.id)))
}

export function deleteVersions(input: Input): Observable<boolean> {
  if (!input.token) {
    return throwError('No token found')
  }

  return getVersionIds(input).pipe(
    concatMap(ids => deletePackageVersions(ids, input.token, input.dryRun))
  )
}
