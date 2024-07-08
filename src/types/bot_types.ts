
export interface IBotMessage {
  message_id: number;
  from: {
    id: number;
    is_bot: boolean;
    first_name: string;
    username: string;
  };
  chat: {
    id: number;
    first_name: string;
    last_name: string;
    username: string;
    type: string;
  };
  date: number;
  text: string;
}

export interface Client {
  id: number;
  attributes: {
    name: string;
    createdAt: string;
    updatedAt: string;
    phone: string;
  };
}

export interface Route {
  id: number;
  attributes: {
    name: string;
    description: string;
    summary: string;
    price: number;
    duration: number;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
  };
}

export interface Departure {
  id: number;
  attributes: {
    time: string;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
  };
}

export interface TaskData {
  id: number;
  attributes: {
    count: number;
    inProcess: boolean;
    comment: string;
    createdAt: string;
    updatedAt: string;
    date: string;
    client: {data:Client};
    route: {data:Route};
    departure: {data:Departure};
  };
}

export interface Task {
  data: TaskData;
  meta: {};
}