export interface InputParams {
  branchName?: string;
  owner?: string;
  repo?: string;
  packageName?: string;
  token?: string;
  dryRun: boolean;
}

const defaultParams = {
  branchName: '',
  owner: '',
  repo: '',
  packageName: '',
  token: '',
  dryRun: false
};

export class Input {
  branchName: string;
  owner: string;
  repo: string;
  packageName: string;
  token: string;
  dryRun: boolean;

  constructor(params?: InputParams) {
    const validatedParams: Required<InputParams> = {
      ...defaultParams,
      ...params
    };
    // downcase the branch name and replace anything that isnt letter, number, or period with a dash.
    this.branchName = validatedParams.branchName
      .toLowerCase()
      .replace(/[^a-z0-9.]/, '-');
    this.owner = validatedParams.owner;
    this.repo = validatedParams.repo;
    this.packageName = validatedParams.packageName;
    this.token = validatedParams.token;
    this.dryRun = validatedParams.dryRun;
  }
}
