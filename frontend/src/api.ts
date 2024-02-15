import axios from "axios";
import { AxiosError, AxiosPromise, AxiosResponse } from "axios";

function isAxiosResponse(e: unknown): e is AxiosError {
  return e instanceof Error && "isAxiosError" in e;
}

function formatAxiosError(error: unknown): string {
  if (isAxiosResponse(error)) {
    const response = error.response;
    if (response !== undefined) {
      if (typeof response.data === "string") {
        return response.data;
      }
      if (typeof response.data.error === "string") {
        return response.data.error;
      }
    }
  }
  return "An unknown error occurred";
}

function fromAxiosPromise<T>(axiosPromise: AxiosPromise): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    axiosPromise
      .then((resp: AxiosResponse) => {
        resolve(resp.data);
      })
      .catch((error) => {
        const message = formatAxiosError(error);
        reject(new Error(message));
      });
  });
}

function doGet<T>(path: string): Promise<T> {
  const url = "/api/" + path;
  return fromAxiosPromise(axios.get(url));
}

const Api = {
  songs: {
    getAll: (): Promise<Song[]> => {
      return doGet("songs");
    },
    getSrc: (song: Song): Promise<string> => {
      return doGet("songs/" + song.id + "/contents");
    },
  },
};

export default Api;
