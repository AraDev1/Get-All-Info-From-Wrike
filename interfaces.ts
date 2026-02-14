export interface WrikeTask {
  id: string;
  title: string;
  responsibleIds: string[];
  parentIds: string[];
  status: string;
  createdDate: string;
  updatedDate: string;
  permalink: string;
}

export interface WrikeContacts {
  id: string;
}

export interface WrikeFolders {
  id: string;
  title: string;
  childIds: string[];
  tasks?: ReTask[];
}

export interface ReTask {
  id: string;
  title: string;
  assignees: string[] | WrikeContacts[];
  status: string;
  collection: string[];
  created_at: string;
  updated_at: string;
  ticket_url: string;
}

export interface DataGive<T> {
  data: T[];
}