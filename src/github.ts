import * as httpm from '@actions/http-client';

export interface GitHubRelease {
  id: number;
  tag_name: string;
}

export const getRelease = async (version: string): Promise<GitHubRelease | null> => {
  const url = `https://github.com/vandot/lodns/releases/${version}`;
  const http: httpm.HttpClient = new httpm.HttpClient('lodns-action');
  return (await http.getJson<GitHubRelease>(url)).result;
};
