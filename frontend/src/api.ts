import axios from "axios";
import { AxiosPromise, AxiosResponse } from "axios";

function printAxiosError(error: any) {
  if (error.hasOwnProperty("response")) {
    const response = error.response as AxiosResponse;
    if (typeof response.data === "string") {
      return response.data;
    }
    if (typeof response.data.error !== "undefined") {
      return response.data.error;
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
      .catch((error: any) => {
        reject(printAxiosError(error));
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
