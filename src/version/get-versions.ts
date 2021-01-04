import { GraphQlQueryResponse } from '@octokit/graphql/dist-types/types';
import { Observable, from, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { graphql } from './graphql';

export interface VersionInfo {
  id: string;
  version: string;
}

export interface GetVersionsQueryResponse {
  repository: {
    packages: {
      edges: {
        node: {
          name: string;
          versions: {
            edges: { node: VersionInfo }[];
          };
        };
      }[];
    };
  };
}

const query = `
  query getVersions($owner: String!, $repo: String!, $package: String!, $first: Int!) {
    repository(owner: $owner, name: $repo) {
      packages(first: 1, names: [$package]) {
        edges {
          node {
            name
            versions(first: $first) {
              edges {
                node {
                  id
                  version
                }
              }
            }
          }
        }
      }
    }
  }`;

export function queryForNewestVersions(
  owner: string,
  repo: string,
  packageName: string,
  token: string
): Observable<GetVersionsQueryResponse> {
  return from(
    graphql(token, query, {
      owner,
      repo,
      package: packageName,
      first: 100,
      headers: {
        Accept: 'application/vnd.github.packages-preview+json'
      }
    }) as Promise<GetVersionsQueryResponse>
  ).pipe(
    catchError((err: GraphQlQueryResponse) => {
      const msg = 'query for newest version failed.';
      return throwError(
        err.errors && err.errors.length > 0
          ? `${msg} ${err.errors[0].message}`
          : `${msg} verify input parameters are correct`
      );
    })
  );
}

export function getOldestVersions(
  branchName: string,
  owner: string,
  repo: string,
  packageName: string,
  token: string
): Observable<VersionInfo[]> {
  return queryForNewestVersions(owner, repo, packageName, token).pipe(
    map(result => {
      if (result.repository.packages.edges.length < 1) {
        throwError(
          `package: ${packageName} not found for owner: ${owner} in repo: ${repo}`
        );
      }

      const versions = result.repository.packages.edges[0].node.versions.edges;

      return versions
        .filter(value => value.node.version.includes(branchName))
        .map(value => ({ id: value.node.id, version: value.node.version }))
        .reverse();
    })
  );
}
