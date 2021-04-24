import { GraphQlQueryResponse } from '@octokit/graphql/dist-types/types';
import { EMPTY, from, Observable, throwError } from 'rxjs';
import { catchError, expand, map, tap } from 'rxjs/operators';

import { graphql } from './graphql';

interface VersionInfo {
  id: string;
  version: string;
}

interface PageInfo {
  endCursor: string,
  hasNextPage: boolean
}

interface VersionNode {
  node: VersionInfo
}

interface VersionSummary {
  totalCount: string,
  pageInfo: PageInfo,
  edges: VersionNode[];
}

interface GetVersionsQueryResponse {
  repository: {
    packages: {
      edges: {
        node: {
          name: string;
          versions: VersionSummary
        };
      }[];
    };
  };
}

interface ApiRequestParams {
  owner: string,
  repo: string,
  packageName: string,
  token: string,
  after?: string
}

const query = `
  query getVersions($owner: String!, $repo: String!, $package: String!, $first: Int!) {
    repository(owner: $owner, name: $repo) {
      packages(first: 1, names: [$package]) {
        edges {
          node {
            name
            versions(first: $first, orderBy: {field: CREATED_AT, direction: DESC}) {
              totalCount
              pageInfo {
                endCursor
                hasNextPage
              }
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

function queryForAllVersions(params: ApiRequestParams) {
  return getVersionsApi(params).pipe(
    expand((result) => {
      if (!packageNode(result)) {
        const { owner, repo, packageName } = params;
        throwError(
          `package: ${packageName} not found for owner: ${owner} in repo: ${repo}`
        );
      }
      if (packageNode(result)?.node.versions.pageInfo.hasNextPage) {
        const after = packageNode(result)?.node.versions.pageInfo.endCursor;
        const copyOfParams = {...params, ...{after}};
        return getVersionsApi(copyOfParams);
      } else {
        return EMPTY;
      }
    }));
}

function getVersionsApi(params: ApiRequestParams): Observable<GetVersionsQueryResponse> {
  const { owner, repo, packageName, token, after } = params;
  return from(
    graphql(token, query, {
      owner,
      repo,
      package: packageName,
      first: 100,
      after: after,
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

function packageNode(result: GetVersionsQueryResponse) {
  const packageList = result.repository.packages.edges
  if (packageList.length > 0) {
    return packageList[0];
  }
}

export function getVersions(
  branchName: string,
  owner: string,
  repo: string,
  packageName: string,
  token: string
): Observable<VersionInfo[]> {
  return queryForAllVersions({owner, repo, packageName, token}).pipe(
    map((result) => {

      const versions = result.repository.packages.edges[0].node.versions.edges;
      console.log(`👀 '${branchName}' in ${versions.length} packages`);

      return versions
        .filter(value => value.node.version.includes(branchName))
        .map(value => ({ id: value.node.id, version: value.node.version }))
        .reverse();
    })
  );
}
