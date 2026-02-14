import fs from "fs"
import dotenv from "dotenv"

dotenv.config()

interface wrikeTask {
  id: string;
  title: string;
  responsibleIds: string[];
  parentIds: string[];
  status: string;
  createdDate: string;
  updatedDate: string;
  permalink: string;
}

interface wrikeContacts {
  id: string;
  [key: string]: unknown;
}

interface wrikeFolders {
  id: string;
  title: string;
  childIds: string[];
  tasks?: reTask[];
  [key: string]: unknown;
}

interface reTask {
  id: string;
  title: string;
  assignees: string[] | wrikeContacts[];
  status: string;
  collection: string[];
  created_at: string;
  updated_at: string;
  ticket_url: string;
}

interface dataGift<T> {
  data: T[];
}

let task: dataGift<wrikeTask>;
let contacts: dataGift<wrikeContacts>;
let folders: dataGift<wrikeFolders>;

let token = process.env.WRIKE_TOKEN;

async function main(): Promise<void> {

  const tasksResp = await fetch(`https://www.wrike.com/api/v4/tasks?fields=["responsibleIds","parentIds"]`, {
    method: 'GET',
    headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
    }
  });
  task = await tasksResp.json();

  const contactsResp = await fetch(`https://www.wrike.com/api/v4/contacts`, {
    method: 'GET',
    headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
    }
  });
  contacts = await contactsResp.json();

  const foldersResp = await fetch(`https://www.wrike.com/api/v4/folders`, {
    method: 'GET',
    headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
    }
  });
  folders = await foldersResp.json();

  function Task(item: wrikeTask): reTask {
      return {
          id: item.id,
          title: item.title,
          assignees: item.responsibleIds,
          status: item.status,
          collection: item.parentIds,
          created_at: item.createdDate,
          updated_at: item.updatedDate,
          ticket_url: item.permalink
      }
  }
  
  const Tasks: reTask[] = task.data.map(Task);
  
  fs.writeFile('tasks.json', JSON.stringify(Tasks, null, 2), () => {})
  fs.writeFile('contacts.json', JSON.stringify(contacts, null, 2), () => {})
  fs.writeFile('folders.json', JSON.stringify(folders, null, 2), () => {})

  const SecondFolder: wrikeFolders = folders.data[folders.data.length - 1]
  const FirstFolder: wrikeFolders = folders.data[folders.data.length - 2]
  const assignee: wrikeContacts = contacts.data[0]

  FirstFolder.tasks = []
  SecondFolder.tasks = []

  Tasks.forEach((element: reTask) => {
    if (element.collection[0] === FirstFolder.id) {
      element.assignees[0] = assignee
      FirstFolder.childIds.push(element.id)
      FirstFolder.tasks!.push(element)
    } else if (element.collection[0] === SecondFolder.id) {
      element.assignees[0] = assignee
      SecondFolder.childIds.push(element.id)
      SecondFolder.tasks!.push(element)
    }
  });

  const finalFolder: wrikeFolders[] = [FirstFolder, SecondFolder]

  fs.writeFile('data.json', JSON.stringify(finalFolder, null, 2), () => {})
}

main()